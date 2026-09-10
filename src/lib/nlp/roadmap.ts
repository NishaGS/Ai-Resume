import { categoryOf } from "./skillDictionary";

export interface LearningResource {
  topics: string[];
  course: string;
  project: string;
  certification: string;
}

/** Curated, non-hallucinated resources: official documentation and well-known programs only. */
const RESOURCES: Record<string, LearningResource> = {
  Python: {
    topics: ["Data types & control flow", "Functions and modules", "OOP basics", "Virtual environments"],
    course: "Official Python Tutorial (docs.python.org/3/tutorial)",
    project: "CLI expense tracker that reads and writes CSV files",
    certification: "PCEP — Certified Entry-Level Python Programmer",
  },
  SQL: {
    topics: ["SELECT / WHERE / GROUP BY", "JOIN types", "Subqueries & CTEs", "Window functions"],
    course: "PostgreSQL Tutorial (postgresql.org/docs)",
    project: "Sales analytics queries over a public Kaggle dataset",
    certification: "Oracle Database SQL Certified Associate",
  },
  Excel: {
    topics: ["Formulas & lookups", "Pivot tables", "Charts", "Power Query basics"],
    course: "Microsoft Excel help & learning (support.microsoft.com/excel)",
    project: "Monthly KPI workbook with pivot dashboard",
    certification: "Microsoft Office Specialist: Excel Associate",
  },
  "Power BI": {
    topics: ["Data model & relationships", "DAX measures", "Visual best practice", "Row-level security"],
    course: "Microsoft Learn — Power BI learning paths",
    project: "3-page sales & retention dashboard with drill-through",
    certification: "Microsoft PL-300 Power BI Data Analyst",
  },
  Pandas: {
    topics: ["Series & DataFrame", "Indexing & filtering", "GroupBy & merge", "Missing data handling"],
    course: "Pandas User Guide (pandas.pydata.org/docs)",
    project: "End-to-end data cleaning notebook on a messy public dataset",
    certification: "—",
  },
  NumPy: {
    topics: ["ndarray basics", "Broadcasting", "Vectorised math", "Random sampling"],
    course: "NumPy Absolute Beginner's Guide (numpy.org/doc)",
    project: "Implement linear regression with only NumPy",
    certification: "—",
  },
  "Machine Learning": {
    topics: ["Train/test split & leakage", "Bias-variance", "Cross validation", "Metrics selection"],
    course: "scikit-learn User Guide (scikit-learn.org/stable/user_guide.html)",
    project: "Customer churn classifier with a proper evaluation report",
    certification: "—",
  },
  "Scikit-learn": {
    topics: ["Estimator API", "Pipelines & ColumnTransformer", "GridSearchCV", "Model persistence"],
    course: "scikit-learn Tutorials (scikit-learn.org/stable/tutorial)",
    project: "Pipeline-based tabular model exposed via a FastAPI endpoint",
    certification: "—",
  },
  TensorFlow: {
    topics: ["Tensors & layers", "tf.data pipelines", "Training loops", "Model export"],
    course: "TensorFlow Tutorials (tensorflow.org/tutorials)",
    project: "Image classifier trained on CIFAR-10",
    certification: "TensorFlow Developer Certificate",
  },
  PyTorch: {
    topics: ["Tensors & autograd", "nn.Module", "DataLoader", "Fine-tuning"],
    course: "PyTorch Learn the Basics (pytorch.org/tutorials)",
    project: "Fine-tune a pretrained ResNet on a custom dataset",
    certification: "—",
  },
  "Deep Learning": {
    topics: ["Backpropagation", "Regularisation & dropout", "Optimisers", "Transfer learning"],
    course: "DeepLearning.AI Deep Learning Specialization (Coursera)",
    project: "Compare a CNN trained from scratch vs transfer learning",
    certification: "DeepLearning.AI specialization certificate",
  },
  LLM: {
    topics: ["Tokenisation & context windows", "Sampling parameters", "Function calling", "Evaluation"],
    course: "Hugging Face LLM Course (huggingface.co/learn)",
    project: "Chat assistant with streaming responses and message history",
    certification: "—",
  },
  RAG: {
    topics: ["Chunking strategies", "Embeddings", "Vector search", "Grounded answering & citations"],
    course: "LangChain RAG tutorials (python.langchain.com/docs)",
    project: "Document Q&A over your own PDFs with citations",
    certification: "—",
  },
  "Prompt Engineering": {
    topics: ["Instruction design", "Few-shot examples", "Structured output", "Guardrails"],
    course: "OpenAI Prompt Engineering guide (platform.openai.com/docs)",
    project: "Prompt library with an automated regression test set",
    certification: "—",
  },
  NLP: {
    topics: ["Text preprocessing", "TF-IDF & embeddings", "Classification", "NER"],
    course: "Hugging Face NLP Course (huggingface.co/learn/nlp-course)",
    project: "Resume-to-job matcher using TF-IDF and cosine similarity",
    certification: "—",
  },
  spaCy: {
    topics: ["Pipelines", "Tokenizer & matcher", "NER training", "Custom components"],
    course: "Advanced NLP with spaCy (course.spacy.io)",
    project: "Skill extractor using spaCy PhraseMatcher",
    certification: "—",
  },
  Transformers: {
    topics: ["Attention intuition", "Pretrained models", "Fine-tuning", "Sentence embeddings"],
    course: "Hugging Face Transformers docs (huggingface.co/docs/transformers)",
    project: "Semantic search over 1k documents with sentence-transformers",
    certification: "—",
  },
  HuggingFace: {
    topics: ["Hub & model cards", "Datasets library", "Pipelines API", "Spaces deployment"],
    course: "Hugging Face Learn (huggingface.co/learn)",
    project: "Deploy a demo model on Hugging Face Spaces",
    certification: "—",
  },
  OpenCV: {
    topics: ["Image I/O & colour spaces", "Filtering & edges", "Contours", "Video capture"],
    course: "OpenCV-Python Tutorials (docs.opencv.org)",
    project: "Real-time face and motion detection from webcam",
    certification: "—",
  },
  YOLO: {
    topics: ["Anchor-free detection", "Dataset annotation", "Training config", "mAP evaluation"],
    course: "Ultralytics YOLO Docs (docs.ultralytics.com)",
    project: "Custom object detector trained on 300 annotated images",
    certification: "—",
  },
  CNN: {
    topics: ["Convolution & pooling", "Architectures", "Augmentation", "Grad-CAM"],
    course: "CS231n course notes (cs231n.github.io)",
    project: "Traffic sign classifier with augmentation and Grad-CAM",
    certification: "—",
  },
  FastAPI: {
    topics: ["Path & query params", "Pydantic models", "Dependencies", "Background tasks"],
    course: "FastAPI Tutorial (fastapi.tiangolo.com/tutorial)",
    project: "REST API serving an ML model with OpenAPI docs",
    certification: "—",
  },
  Docker: {
    topics: ["Images vs containers", "Dockerfile layers", "Volumes & networks", "docker compose"],
    course: "Docker Get Started (docs.docker.com/get-started)",
    project: "Containerise a FastAPI + React app with compose",
    certification: "Docker Certified Associate",
  },
  Kubernetes: {
    topics: ["Pods & deployments", "Services", "ConfigMaps & secrets", "Scaling"],
    course: "Kubernetes Basics (kubernetes.io/docs/tutorials)",
    project: "Deploy a 2-service app to a local kind cluster",
    certification: "CKA — Certified Kubernetes Administrator",
  },
  AWS: {
    topics: ["IAM basics", "EC2 & S3", "Lambda", "Cost awareness"],
    course: "AWS Skill Builder — Cloud Practitioner Essentials",
    project: "Host a static site on S3 + CloudFront",
    certification: "AWS Certified Cloud Practitioner",
  },
  Azure: {
    topics: ["Resource groups", "App Service", "Azure ML basics", "Storage"],
    course: "Microsoft Learn — Azure Fundamentals",
    project: "Deploy a containerised API to Azure App Service",
    certification: "Microsoft AZ-900 Azure Fundamentals",
  },
  GCP: {
    topics: ["Projects & IAM", "Cloud Run", "BigQuery basics", "Vertex AI overview"],
    course: "Google Cloud Skills Boost",
    project: "Deploy a container to Cloud Run with CI",
    certification: "Google Associate Cloud Engineer",
  },
  "GitHub Actions": {
    topics: ["Workflow syntax", "Jobs & matrix builds", "Secrets", "Deploy steps"],
    course: "GitHub Actions documentation (docs.github.com/actions)",
    project: "CI pipeline running tests and building a Docker image",
    certification: "GitHub Actions certification",
  },
  React: {
    topics: ["Components & props", "State & effects", "Lists & keys", "Data fetching"],
    course: "React Learn (react.dev/learn)",
    project: "Dashboard UI consuming a public REST API",
    certification: "—",
  },
  TypeScript: {
    topics: ["Types & interfaces", "Generics", "Narrowing", "Utility types"],
    course: "TypeScript Handbook (typescriptlang.org/docs)",
    project: "Convert a JavaScript project to strict TypeScript",
    certification: "—",
  },
  JavaScript: {
    topics: ["ES6 syntax", "Async/await", "DOM & events", "Modules"],
    course: "MDN JavaScript Guide (developer.mozilla.org)",
    project: "Interactive quiz app with local storage",
    certification: "—",
  },
  "Node.js": {
    topics: ["Modules & npm", "Async patterns", "HTTP servers", "Environment config"],
    course: "Node.js Learn (nodejs.org/en/learn)",
    project: "Express REST API with JWT auth",
    certification: "—",
  },
  "REST API": {
    topics: ["Resource design", "Status codes", "Pagination & filtering", "Auth patterns"],
    course: "MDN HTTP guide (developer.mozilla.org/docs/Web/HTTP)",
    project: "Versioned CRUD API with OpenAPI documentation",
    certification: "—",
  },
  Git: {
    topics: ["Commits & branches", "Merge vs rebase", "Pull requests", "Conflict resolution"],
    course: "Pro Git book (git-scm.com/book)",
    project: "Contribute a pull request to an open-source repository",
    certification: "—",
  },
  Statistics: {
    topics: ["Descriptive stats", "Distributions", "Hypothesis testing", "Confidence intervals"],
    course: "Khan Academy Statistics & Probability",
    project: "A/B test analysis notebook with effect size",
    certification: "—",
  },
  ETL: {
    topics: ["Extract patterns", "Transform & validation", "Scheduling", "Idempotency"],
    course: "Apache Airflow documentation (airflow.apache.org/docs)",
    project: "Daily pipeline loading an API into PostgreSQL",
    certification: "—",
  },
  "Data Visualization": {
    topics: ["Chart selection", "Colour & accessibility", "Annotation", "Interactive plots"],
    course: "Plotly Python documentation (plotly.com/python)",
    project: "Interactive Plotly report on a public dataset",
    certification: "—",
  },
  Linux: {
    topics: ["Filesystem & permissions", "Processes", "Shell scripting", "SSH"],
    course: "The Linux Command Line (linuxcommand.org)",
    project: "Automate backups with a cron-scheduled bash script",
    certification: "Linux Foundation LFCS",
  },
};

const GENERIC: LearningResource = {
  topics: ["Core concepts", "Hands-on setup", "Common patterns", "Debugging basics"],
  course: "Official documentation and a reputable structured course",
  project: "A small end-to-end project that uses the skill in a realistic scenario",
  certification: "—",
};

export interface RoadmapWeek {
  week: number;
  focus: string;
  skills: string[];
  topics: string[];
  courses: string[];
  practiceProjects: string[];
  miniProject: string;
  certifications: string[];
}

export function resourceFor(skill: string): LearningResource {
  return RESOURCES[skill] ?? GENERIC;
}

/**
 * Builds a 4-week roadmap from the prioritised missing/weak skills of the
 * best-matching role. Deterministic — no generated claims.
 */
export function generateRoadmap(targetRole: string, prioritisedSkills: string[]): RoadmapWeek[] {
  const skills = prioritisedSkills.filter(Boolean).slice(0, 12);
  const weeks: RoadmapWeek[] = [];
  const perWeek = Math.max(1, Math.ceil(skills.length / 4) || 1);

  for (let w = 0; w < 4; w++) {
    const weekSkills = skills.slice(w * perWeek, (w + 1) * perWeek);
    const resources = weekSkills.map((s) => ({ skill: s, res: resourceFor(s) }));
    const focusLabel =
      weekSkills.length > 0
        ? `${weekSkills.join(" + ")} for ${targetRole}`
        : w < 2
          ? `Consolidate ${targetRole} fundamentals`
          : `Portfolio & interview readiness for ${targetRole}`;

    const fallbackTopics =
      w === 2
        ? ["Refactor an existing project", "Write unit tests", "Document your work in a README"]
        : ["Mock interview questions for the role", "STAR-format project stories", "Resume keyword alignment"];

    weeks.push({
      week: w + 1,
      focus: focusLabel,
      skills: weekSkills,
      topics: resources.flatMap((r) => r.res.topics.slice(0, 3)).slice(0, 6).length
        ? resources.flatMap((r) => r.res.topics.slice(0, 3)).slice(0, 6)
        : fallbackTopics,
      courses: [...new Set(resources.map((r) => r.res.course))].slice(0, 3),
      practiceProjects: resources.map((r) => r.res.project).slice(0, 3),
      miniProject:
        weekSkills.length > 0
          ? `Ship a small ${weekSkills[0]}-focused module and push it to GitHub with a README`
          : `Publish one polished ${targetRole} portfolio project with documentation and a demo`,
      certifications: [
        ...new Set(resources.map((r) => r.res.certification).filter((c) => c && c !== "—")),
      ].slice(0, 2),
    });
  }
  return weeks;
}

export function prioritiseSkills(missing: string[], weak: string[]): string[] {
  const order: Record<string, number> = {
    Programming: 0,
    "Machine Learning": 1,
    "Artificial Intelligence": 1,
    NLP: 1,
    "Computer Vision": 1,
    Databases: 2,
    Web: 2,
    "Data & BI": 2,
    Tools: 3,
    DevOps: 4,
    Cloud: 4,
    "Soft Skills": 5,
  };
  const rank = (s: string) => order[categoryOf(s)] ?? 3;
  return [
    ...missing.slice().sort((a, b) => rank(a) - rank(b)),
    ...weak.slice().sort((a, b) => rank(a) - rank(b)),
  ];
}
