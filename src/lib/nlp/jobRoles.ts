import type { SkillCategory } from "./skillDictionary";

export interface JobRole {
  role: string;
  category: string;
  requiredSkills: string[];
  optionalSkills: string[];
  description: string;
  careerPath: string;
  salaryRange: string;
  keywords: string[];
}

/** Mirrors data/job_roles.csv */
export const JOB_ROLES: JobRole[] = [
  {
    role: "Data Analyst",
    category: "Data",
    requiredSkills: ["Python", "SQL", "Excel", "Power BI", "Pandas"],
    optionalSkills: ["Statistics", "Data Visualization", "Tableau", "ETL", "NumPy"],
    description:
      "Turns raw business data into dashboards, reports and insights that guide product and operations decisions.",
    careerPath: "Data Analyst → Senior Data Analyst → Analytics Lead → Head of Analytics",
    salaryRange: "₹4L – ₹12L / $55k – $95k",
    keywords: ["dashboard", "reporting", "kpi", "business insights", "data cleaning", "sql queries"],
  },
  {
    role: "Machine Learning Engineer",
    category: "AI/ML",
    requiredSkills: ["Python", "Machine Learning", "Scikit-learn", "FastAPI", "Docker"],
    optionalSkills: ["Pandas", "NumPy", "MLOps", "AWS", "TensorFlow", "PyTorch"],
    description:
      "Designs, trains and ships machine learning models as reliable production services and pipelines.",
    careerPath: "ML Engineer → Senior ML Engineer → ML Platform Lead → Head of AI",
    salaryRange: "₹8L – ₹28L / $95k – $170k",
    keywords: ["model training", "feature engineering", "model deployment", "pipeline", "evaluation metrics"],
  },
  {
    role: "AI Engineer",
    category: "AI/ML",
    requiredSkills: ["Python", "Deep Learning", "LLM", "RAG", "REST API"],
    optionalSkills: ["LangChain", "Prompt Engineering", "OpenAI API", "Gemini API", "Docker", "FastAPI"],
    description:
      "Builds LLM-powered applications: retrieval pipelines, agents, evaluation harnesses and AI product features.",
    careerPath: "AI Engineer → Senior AI Engineer → AI Architect → Head of AI Products",
    salaryRange: "₹9L – ₹32L / $105k – $185k",
    keywords: ["generative ai", "vector search", "embeddings", "agents", "prompt", "chatbot"],
  },
  {
    role: "NLP Engineer",
    category: "AI/ML",
    requiredSkills: ["Python", "NLP", "Transformers", "HuggingFace", "Machine Learning"],
    optionalSkills: ["spaCy", "TF-IDF", "NLTK", "PyTorch", "Deep Learning"],
    description:
      "Works on text understanding: classification, entity extraction, semantic search and language model fine-tuning.",
    careerPath: "NLP Engineer → Senior NLP Engineer → Research Engineer → NLP Lead",
    salaryRange: "₹8L – ₹26L / $95k – $165k",
    keywords: ["tokenization", "named entity recognition", "text classification", "embeddings", "language model"],
  },
  {
    role: "Computer Vision Engineer",
    category: "AI/ML",
    requiredSkills: ["Python", "OpenCV", "CNN", "YOLO", "Deep Learning"],
    optionalSkills: ["PyTorch", "TensorFlow", "Docker", "Machine Learning"],
    description:
      "Builds image and video intelligence: detection, segmentation, tracking and on-device inference.",
    careerPath: "CV Engineer → Senior CV Engineer → Perception Lead → Director of Vision AI",
    salaryRange: "₹7L – ₹25L / $90k – $160k",
    keywords: ["image processing", "object detection", "segmentation", "annotation", "inference"],
  },
  {
    role: "Python Developer",
    category: "Engineering",
    requiredSkills: ["Python", "REST API", "SQL", "Git", "FastAPI"],
    optionalSkills: ["Flask", "Django", "Docker", "PostgreSQL", "Linux"],
    description: "Builds Python services, automation and integrations with clean, tested, maintainable code.",
    careerPath: "Python Developer → Senior Developer → Tech Lead → Engineering Manager",
    salaryRange: "₹4L – ₹18L / $70k – $130k",
    keywords: ["scripting", "automation", "unit tests", "microservice", "backend logic"],
  },
  {
    role: "Backend Developer",
    category: "Engineering",
    requiredSkills: ["REST API", "SQL", "Docker", "Git", "PostgreSQL"],
    optionalSkills: ["Node.js", "Python", "Java", "Redis", "Kubernetes", "Linux"],
    description: "Owns server-side architecture, APIs, databases, authentication and system performance.",
    careerPath: "Backend Developer → Senior Backend Engineer → Staff Engineer → Architect",
    salaryRange: "₹5L – ₹22L / $80k – $150k",
    keywords: ["api design", "database schema", "caching", "authentication", "scalability"],
  },
  {
    role: "Frontend Developer",
    category: "Engineering",
    requiredSkills: ["HTML", "CSS", "JavaScript", "React", "Git"],
    optionalSkills: ["TypeScript", "Tailwind CSS", "Next.js", "Vue", "Angular"],
    description: "Builds accessible, responsive and fast user interfaces with modern component frameworks.",
    careerPath: "Frontend Developer → Senior Frontend Engineer → UI Architect → Head of Frontend",
    salaryRange: "₹4L – ₹18L / $70k – $135k",
    keywords: ["responsive design", "component", "state management", "accessibility", "ui"],
  },
  {
    role: "Full Stack Developer",
    category: "Engineering",
    requiredSkills: ["React", "Node.js", "SQL", "REST API", "Git"],
    optionalSkills: ["TypeScript", "MongoDB", "Docker", "Next.js", "Tailwind CSS", "Python"],
    description: "Delivers features end to end across UI, API and database with product ownership.",
    careerPath: "Full Stack Developer → Senior Full Stack Engineer → Tech Lead → CTO track",
    salaryRange: "₹5L – ₹24L / $80k – $155k",
    keywords: ["end to end", "crud", "deployment", "product feature", "integration"],
  },
  {
    role: "Software Engineer",
    category: "Engineering",
    requiredSkills: ["Git", "SQL", "Problem Solving", "REST API"],
    optionalSkills: ["Java", "Python", "C++", "Docker", "Linux", "Agile"],
    description: "General-purpose engineering role covering design, implementation, testing and code review.",
    careerPath: "Software Engineer → SDE II → Senior SDE → Staff Engineer",
    salaryRange: "₹5L – ₹25L / $85k – $160k",
    keywords: ["data structures", "algorithms", "system design", "code review", "testing"],
  },
  {
    role: "Data Scientist",
    category: "Data",
    requiredSkills: ["Python", "Statistics", "Machine Learning", "Pandas", "SQL"],
    optionalSkills: ["Scikit-learn", "Data Visualization", "Jupyter", "NumPy", "Deep Learning"],
    description: "Frames business problems as statistical experiments and models, and communicates findings.",
    careerPath: "Data Scientist → Senior Data Scientist → Principal DS → Head of Data Science",
    salaryRange: "₹7L – ₹26L / $95k – $165k",
    keywords: ["hypothesis testing", "experimentation", "regression", "clustering", "insights"],
  },
  {
    role: "DevOps Engineer",
    category: "Infrastructure",
    requiredSkills: ["Docker", "Kubernetes", "Linux", "GitHub Actions", "AWS"],
    optionalSkills: ["Azure", "GCP", "Python", "Git", "Redis"],
    description: "Automates build, release and infrastructure, and keeps production observable and reliable.",
    careerPath: "DevOps Engineer → Senior DevOps → SRE Lead → Platform Architect",
    salaryRange: "₹6L – ₹24L / $95k – $160k",
    keywords: ["infrastructure as code", "monitoring", "pipeline", "deployment", "reliability"],
  },
  {
    role: "Business Intelligence Developer",
    category: "Data",
    requiredSkills: ["SQL", "Power BI", "Excel", "ETL", "Data Visualization"],
    optionalSkills: ["Tableau", "Python", "PostgreSQL", "Statistics"],
    description: "Models warehouse data and builds governed, self-service reporting for business teams.",
    careerPath: "BI Developer → Senior BI Developer → Analytics Engineer → BI Manager",
    salaryRange: "₹4L – ₹16L / $70k – $120k",
    keywords: ["data warehouse", "star schema", "dax", "reporting layer", "semantic model"],
  },
];

export const ROLE_CATEGORY_WEIGHTS: Record<string, SkillCategory[]> = {
  "AI/ML": ["Machine Learning", "Artificial Intelligence", "NLP", "Computer Vision"],
  Data: ["Data & BI", "Databases", "Machine Learning"],
  Engineering: ["Programming", "Web", "Databases"],
  Infrastructure: ["DevOps", "Cloud"],
};
