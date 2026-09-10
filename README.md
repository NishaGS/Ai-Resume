# AI Resume Analyzer & Job Recommendation System

An NLP-powered resume analyzer that extracts skills from a PDF/DOCX resume, matches it
against a curated library of job roles using **TF-IDF vectorisation + cosine similarity**,
detects skill gaps, generates a **4-week learning roadmap** and exports a **PDF report**.

The deployed web app is self-contained: the whole analysis pipeline is implemented in
TypeScript and runs on the app's own server functions, so there is no external service to
start. A **Python/FastAPI reference backend** mirroring the same pipeline is included under
`backend/` for self-hosting or coursework submission.

## Live app structure

| Route        | Purpose                                                                    |
| ------------ | -------------------------------------------------------------------------- |
| `/`          | Hero + resume upload, full analysis results in tabs                        |
| `/dashboard` | Analysis history, average scores, most recommended roles, matching library  |
| `/about`     | Pipeline documentation, scoring formula, responsible-AI limits             |

### Analysis pipeline

1. **Parse** — `pdfjs-dist` reads PDF text layers, `mammoth` converts DOCX. Parsing happens
   in the browser; the file is never uploaded.
2. **Clean** — lowercasing, de-hyphenation and stopword removal while preserving `C++`,
   `C#`, `.NET`, `Node.js`, `CI/CD`.
3. **Extract** — section splitting, alias-aware skill matching, education, projects,
   experience, certifications, contact links, experience estimation.
4. **Vectorise** — sublinear TF-IDF over resume + role documents.
5. **Score** — hybrid: `0.45 × required-skill coverage + 0.35 × cosine similarity +
   0.20 × Jaccard skill overlap`.
6. **Recommend** — ranked roles with reason, confidence, matched/missing skills, salary
   band and career path.
7. **Roadmap + report** — deterministic 4-week plan and a multi-page `jsPDF` report.

### Key source files

```
src/lib/nlp/textCleaner.ts     normalisation + tokenisation
src/lib/nlp/skillDictionary.ts 78 skills across 12 categories, with aliases
src/lib/nlp/jobRoles.ts        13 job-role profiles
src/lib/nlp/tfidf.ts           TF-IDF + cosine similarity
src/lib/nlp/extract.ts         section/skill/entity extraction
src/lib/nlp/analyze.ts         orchestrator
src/lib/nlp/roadmap.ts         4-week plan generation
src/lib/nlp/feedback.ts        ATS scoring + suggestions
src/lib/analyze.functions.ts   server function endpoint
src/lib/report.ts              PDF report
```

## Datasets

- `data/job_roles.csv` — role, category, required/optional skills, description, career
  path, salary range, keywords.
- `data/skill_dictionary.csv` — skill, category, pipe-separated aliases.

Both CSVs are the source of truth mirrored by the TypeScript modules and read directly by
the FastAPI backend.

## Running the FastAPI backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# Swagger UI: http://localhost:8000/docs
```

Endpoints: `GET /api/health`, `GET /api/roles`, `GET /api/skills`,
`POST /api/analyze-text` (JSON), `POST /api/analyze` (multipart upload, max 5 MB).

### Docker

```bash
docker compose up --build   # api on :8000, web on :8080
```

## Responsible AI

Scoring uses only skills, projects, education, certifications and experience. Name,
gender, age, photo, nationality and school prestige never affect the result. Resume files
and extracted text are never persisted; dashboard history holds aggregate metrics in
browser local storage only. Results are upskilling guidance, not a hiring decision.

**Limitation:** scanned/image-only PDFs contain no text layer and cannot be analysed.
