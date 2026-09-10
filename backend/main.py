"""
AI Resume Analyzer & Job Recommendation System — FastAPI reference backend.

This service mirrors the TypeScript analysis engine that powers the deployed web
app (src/lib/nlp/*). It exists so the same pipeline can be run as a standalone
Python microservice for coursework, grading, or self-hosting.

Pipeline: parse -> clean -> extract -> TF-IDF vectorise -> cosine similarity
       -> hybrid score -> skill gap -> 4-week roadmap -> ATS feedback

Run locally:
    pip install -r requirements.txt
    uvicorn main:app --reload --port 8000
Docs: http://localhost:8000/docs
"""

from __future__ import annotations

import csv
import io
import math
import os
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import docx2txt
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pdfminer.high_level import extract_text as pdf_extract_text
from pydantic import BaseModel, Field
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

DATA_DIR = Path(os.environ.get("DATA_DIR", Path(__file__).resolve().parent.parent / "data"))
MAX_FILE_BYTES = 5 * 1024 * 1024
ALLOWED_SUFFIXES = {".pdf", ".docx", ".txt"}

# ---------------------------------------------------------------- data loading

def _load_roles() -> list[dict[str, Any]]:
    with (DATA_DIR / "job_roles.csv").open(encoding="utf-8") as fh:
        rows = list(csv.DictReader(fh))
    for row in rows:
        for key in ("required_skills", "optional_skills", "keywords"):
            row[key] = [v.strip() for v in row[key].split("|") if v.strip()]
    return rows


def _load_skills() -> list[dict[str, Any]]:
    with (DATA_DIR / "skill_dictionary.csv").open(encoding="utf-8") as fh:
        rows = list(csv.DictReader(fh))
    for row in rows:
        aliases = [a.strip().lower() for a in row["aliases"].split("|") if a.strip()]
        row["aliases"] = sorted(set(aliases + [row["skill"].lower()]), key=len, reverse=True)
    return rows


JOB_ROLES = _load_roles()
SKILLS = _load_skills()

# ------------------------------------------------------------- text processing

STOPWORDS = {
    "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "have",
    "in", "is", "it", "its", "of", "on", "or", "that", "the", "to", "was", "were",
    "with", "will", "using", "used", "use", "work", "worked", "working", "team",
    "responsible", "including", "various", "etc", "also", "able", "well",
}

# Technical tokens whose punctuation must survive normalisation.
TOKEN_GUARDS = {
    "c++": " cplusplus ",
    "c#": " csharp ",
    ".net": " dotnet ",
    "node.js": " nodejs ",
    "next.js": " nextjs ",
    "ci/cd": " cicd ",
    "objective-c": " objectivec ",
    "asp.net": " aspnet ",
}


def clean_text(raw: str) -> str:
    text = raw.lower().replace("\u2013", "-").replace("\u2014", "-")
    text = re.sub(r"(\w)-\n(\w)", r"\1\2", text)  # de-hyphenate line breaks
    for token, replacement in TOKEN_GUARDS.items():
        text = text.replace(token, replacement)
    text = re.sub(r"[^a-z0-9+#.\s/]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def tokenize(text: str) -> list[str]:
    return [t for t in clean_text(text).split(" ") if len(t) > 1 and t not in STOPWORDS]


SECTION_PATTERNS = {
    "summary": r"(professional\s+summary|summary|objective|profile|about\s+me)",
    "skills": r"(technical\s+skills|skills|technologies|tech\s+stack|competencies)",
    "education": r"(education|academic|qualifications)",
    "projects": r"(projects|personal\s+projects|academic\s+projects)",
    "experience": r"(experience|employment|work\s+history|internship[s]?)",
    "certifications": r"(certifications?|licenses?|courses)",
}


def split_sections(raw: str) -> dict[str, str]:
    lines = [line.strip() for line in raw.splitlines()]
    found: list[tuple[int, str]] = []
    for index, line in enumerate(lines):
        if not line or len(line) > 60:
            continue
        probe = re.sub(r"[^a-z\s]", "", line.lower()).strip()
        for name, pattern in SECTION_PATTERNS.items():
            if re.fullmatch(pattern, probe):
                found.append((index, name))
                break
    sections: dict[str, str] = {}
    for position, (index, name) in enumerate(found):
        end = found[position + 1][0] if position + 1 < len(found) else len(lines)
        sections[name] = "\n".join(lines[index + 1 : end]).strip()
    return sections


def extract_skills(raw: str) -> list[dict[str, Any]]:
    haystack = f" {clean_text(raw)} "
    detected: list[dict[str, Any]] = []
    for skill in SKILLS:
        occurrences = 0
        for alias in skill["aliases"]:
            probe = clean_text(alias)
            if not probe:
                continue
            occurrences += len(re.findall(rf"(?<![a-z0-9]){re.escape(probe)}(?![a-z0-9])", haystack))
        if occurrences:
            strength = "strong" if occurrences >= 3 else "moderate" if occurrences == 2 else "weak"
            detected.append(
                {
                    "name": skill["skill"],
                    "category": skill["category"],
                    "occurrences": occurrences,
                    "strength": strength,
                }
            )
    return sorted(detected, key=lambda s: (-s["occurrences"], s["name"]))


CONTACT_PATTERNS = {
    "email": r"[\w.+-]+@[\w-]+\.[\w.]+",
    "phone": r"(?:\+?\d[\d\s-]{8,14}\d)",
    "linkedin": r"linkedin\.com/[\w/-]+",
    "github": r"github\.com/[\w/-]+",
}


def extract_contact(raw: str) -> dict[str, str | None]:
    return {
        key: (match.group(0) if (match := re.search(pattern, raw, re.I)) else None)
        for key, pattern in CONTACT_PATTERNS.items()
    }


def estimate_years(raw: str) -> int:
    years = [int(y) for y in re.findall(r"(19|20)\d{2}", raw) for y in [y]] or []
    explicit = re.findall(r"(\d{1,2})\+?\s*(?:years?|yrs?)\s+(?:of\s+)?experience", raw, re.I)
    if explicit:
        return min(40, max(int(v) for v in explicit))
    stamps = [int(m.group(0)) for m in re.finditer(r"(?:19|20)\d{2}", raw)]
    if len(stamps) >= 2:
        return max(0, min(40, max(stamps) - min(stamps)))
    return 0


# ------------------------------------------------------------------- matching

W_COVERAGE, W_COSINE, W_JACCARD = 0.45, 0.35, 0.20


def _role_document(role: dict[str, Any]) -> str:
    return " ".join(
        [
            role["role"],
            role["category"],
            role["description"],
            " ".join(role["required_skills"] * 3),
            " ".join(role["optional_skills"]),
            " ".join(role["keywords"] * 2),
        ]
    )


def score_roles(resume_text: str, skill_names: set[str]) -> list[dict[str, Any]]:
    documents = [clean_text(resume_text)] + [clean_text(_role_document(r)) for r in JOB_ROLES]
    vectorizer = TfidfVectorizer(sublinear_tf=True, stop_words=list(STOPWORDS), ngram_range=(1, 2))
    matrix = vectorizer.fit_transform(documents)
    similarities = cosine_similarity(matrix[0:1], matrix[1:]).ravel()

    lowered = {s.lower() for s in skill_names}
    results: list[dict[str, Any]] = []
    for role, similarity in zip(JOB_ROLES, similarities):
        required = role["required_skills"]
        optional = role["optional_skills"]
        matched_required = [s for s in required if s.lower() in lowered]
        matched_optional = [s for s in optional if s.lower() in lowered]
        missing = [s for s in required if s.lower() not in lowered]
        coverage = len(matched_required) / len(required) if required else 0.0
        role_pool = {s.lower() for s in required + optional}
        union = role_pool | lowered
        jaccard = len(role_pool & lowered) / len(union) if union else 0.0
        score = W_COVERAGE * coverage + W_COSINE * float(similarity) + W_JACCARD * jaccard
        results.append(
            {
                "role": role["role"],
                "category": role["category"],
                "score": round(score * 100),
                "skill_coverage": round(coverage, 4),
                "cosine_similarity": round(float(similarity), 4),
                "jaccard": round(jaccard, 4),
                "matched_skills": matched_required + matched_optional,
                "missing_skills": missing,
                "description": role["description"],
                "career_path": role["career_path"],
                "salary_range": role["salary_range"],
                "confidence": round(min(99, 40 + coverage * 45 + float(similarity) * 40)),
                "reason": (
                    f"{len(matched_required)}/{len(required)} required skills matched "
                    f"with {round(float(similarity) * 100)}% textual similarity to the role profile."
                ),
            }
        )
    return sorted(results, key=lambda r: -r["score"])


# -------------------------------------------------------------------- roadmap

ROADMAP_FOCUS = [
    ("Week 1", "Fundamentals", "Close the most critical gap with structured theory plus daily exercises."),
    ("Week 2", "Applied practice", "Convert theory into working code with guided exercises and datasets."),
    ("Week 3", "Mini project", "Ship an end-to-end mini project that demonstrates the new skills."),
    ("Week 4", "Portfolio & interview", "Polish the resume, publish the project and drill role-specific questions."),
]


def build_roadmap(missing: list[str], role: str) -> list[dict[str, Any]]:
    buckets: list[list[str]] = [[], [], [], []]
    for index, skill in enumerate(missing[:12]):
        buckets[index % 4].append(skill)
    weeks = []
    for index, (label, focus, detail) in enumerate(ROADMAP_FOCUS):
        skills = buckets[index] or ["Consolidate existing strengths"]
        weeks.append(
            {
                "week": label,
                "focus": focus,
                "detail": detail,
                "skills": skills,
                "topics": [f"Core concepts of {s}" for s in skills],
                "resources": [f"Official {s} documentation and one structured course" for s in skills],
                "practice": [f"Build two small exercises using {s}" for s in skills],
                "milestone": (
                    f"Demonstrable {focus.lower()} progress towards {role}"
                    if index < 3
                    else f"Resume updated with {role} keywords and a published project"
                ),
            }
        )
    return weeks


# ------------------------------------------------------------------- feedback

def build_feedback(raw: str, sections: dict[str, str], skills: list[dict[str, Any]],
                   contact: dict[str, str | None]) -> tuple[list[dict[str, str]], int]:
    items: list[dict[str, str]] = []

    def add(category: str, severity: str, message: str) -> None:
        items.append({"category": category, "severity": severity, "message": message})

    words = len(raw.split())
    if words < 200:
        add("ATS", "critical", f"The resume contains only {words} words — aim for 400–800 words of substance.")
    elif words > 1200:
        add("Formatting", "improve", f"At {words} words the resume is long; tighten it to two pages maximum.")
    else:
        add("ATS", "good", f"Length is healthy at {words} words.")

    for name in ("skills", "education", "experience", "projects"):
        if sections.get(name):
            add("ATS", "good", f"A clearly labelled {name} section was detected.")
        else:
            add("ATS", "critical", f"No {name} section was detected — add an explicit '{name.title()}' heading.")

    if not contact["email"]:
        add("ATS", "critical", "No email address was found; recruiters and ATS parsers need one.")
    if not contact["linkedin"] and not contact["github"]:
        add("ATS", "improve", "Add a LinkedIn or GitHub link so reviewers can verify your work.")

    if len(skills) < 8:
        add("Keywords", "improve", f"Only {len(skills)} recognised skills were detected — list tools explicitly.")
    else:
        add("Keywords", "good", f"{len(skills)} recognised technical skills were detected.")

    if not re.search(r"\d+\s*%|\d+\s*(users|records|requests|hours|x\b)", raw, re.I):
        add("Projects", "improve", "Quantify impact with numbers (percentages, volumes, time saved).")
    else:
        add("Projects", "good", "Quantified achievements were detected.")

    if sections.get("certifications"):
        add("Certifications", "good", "Certifications are listed.")
    else:
        add("Certifications", "improve", "Add relevant certifications or completed courses.")

    if sections.get("summary"):
        add("Summary", "good", "A summary or objective statement is present.")
    else:
        add("Summary", "improve", "Add a 2–3 line summary naming your target role and top skills.")

    if re.search(r"\t|\|{2,}", raw):
        add("Formatting", "improve", "Tables or column layouts can confuse ATS parsers; prefer single-column text.")

    penalty = sum(12 if i["severity"] == "critical" else 5 for i in items if i["severity"] != "good")
    return items, max(0, min(100, 100 - penalty))


# ------------------------------------------------------------------ file read

def read_upload(filename: str, payload: bytes) -> str:
    suffix = Path(filename).suffix.lower()
    if suffix not in ALLOWED_SUFFIXES:
        raise HTTPException(400, f"Unsupported file type '{suffix}'. Use PDF, DOCX or TXT.")
    if len(payload) > MAX_FILE_BYTES:
        raise HTTPException(413, "File exceeds the 5 MB limit.")
    if suffix == ".pdf":
        return pdf_extract_text(io.BytesIO(payload)) or ""
    if suffix == ".docx":
        tmp = Path("/tmp") / f"{uuid.uuid4().hex}.docx"
        try:
            tmp.write_bytes(payload)
            return docx2txt.process(str(tmp)) or ""
        finally:
            tmp.unlink(missing_ok=True)
    return payload.decode("utf-8", errors="ignore")


# --------------------------------------------------------------------- models

class AnalyzeTextRequest(BaseModel):
    text: str = Field(min_length=50, max_length=200_000)
    file_name: str = Field(default="pasted-resume.txt", max_length=200)


class HealthResponse(BaseModel):
    status: str
    roles: int
    skills: int


# ------------------------------------------------------------------------ app

app = FastAPI(
    title="AI Resume Analyzer & Job Recommendation API",
    description="TF-IDF + cosine similarity resume analysis, skill gap detection and roadmap generation.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("ALLOWED_ORIGINS", "*").split(","),
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

DISCLAIMER = (
    "This analysis is automated guidance based on skills, projects, education and experience only. "
    "It ignores name, gender, age and photo, is not a hiring decision, and does not guarantee employment."
)


def analyze(raw_text: str, file_name: str) -> dict[str, Any]:
    if len(raw_text.strip()) < 50:
        raise HTTPException(
            422,
            "Could not extract enough text. Scanned or image-only PDFs have no text layer — export a text-based PDF.",
        )
    sections = split_sections(raw_text)
    skills = extract_skills(raw_text)
    contact = extract_contact(raw_text)
    matches = score_roles(raw_text, {s["name"] for s in skills})
    top = matches[:3]
    missing = top[0]["missing_skills"] if top else []
    feedback, ats = build_feedback(raw_text, sections, skills, contact)

    by_category: dict[str, int] = {}
    for skill in skills:
        by_category[skill["category"]] = by_category.get(skill["category"], 0) + 1

    return {
        "id": uuid.uuid4().hex,
        "file_name": file_name,
        "analysed_at": datetime.now(timezone.utc).isoformat(),
        "word_count": len(raw_text.split()),
        "years_of_experience": estimate_years(raw_text),
        "contact": contact,
        "sections_detected": sorted(sections.keys()),
        "skills": skills,
        "skills_by_category": [{"category": k, "found": v} for k, v in sorted(by_category.items())],
        "overall_score": top[0]["score"] if top else 0,
        "ats_score": ats,
        "matches": matches,
        "top_recommendations": top,
        "missing_skills": missing,
        "roadmap": build_roadmap(missing, top[0]["role"] if top else "your target role"),
        "feedback": feedback,
        "disclaimer": DISCLAIMER,
    }


@app.get("/api/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok", roles=len(JOB_ROLES), skills=len(SKILLS))


@app.get("/api/roles")
def roles() -> list[dict[str, Any]]:
    return JOB_ROLES


@app.get("/api/skills")
def skills() -> list[dict[str, Any]]:
    return SKILLS


@app.post("/api/analyze-text")
def analyze_text(request: AnalyzeTextRequest) -> dict[str, Any]:
    return analyze(request.text, request.file_name)


@app.post("/api/analyze")
async def analyze_upload(file: UploadFile = File(...)) -> dict[str, Any]:
    payload = await file.read()
    text = read_upload(file.filename or "resume.pdf", payload)
    # The uploaded bytes are never persisted — only the extracted text is analysed.
    return analyze(text, file.filename or "resume.pdf")
