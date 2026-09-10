/**
 * Skill dictionary grouped by category.
 * Each canonical skill has aliases used for token / phrase matching.
 * Mirrors data/skill_dictionary.csv
 */

export type SkillCategory =
  | "Programming"
  | "Web"
  | "Databases"
  | "Machine Learning"
  | "Artificial Intelligence"
  | "NLP"
  | "Computer Vision"
  | "Cloud"
  | "DevOps"
  | "Tools"
  | "Data & BI"
  | "Soft Skills";

export interface SkillDef {
  name: string;
  category: SkillCategory;
  aliases: string[];
}

const d = (name: string, category: SkillCategory, aliases: string[] = []): SkillDef => ({
  name,
  category,
  aliases: [name.toLowerCase(), ...aliases.map((a) => a.toLowerCase())],
});

export const SKILL_DICTIONARY: SkillDef[] = [
  // Programming
  d("Python", "Programming", ["python3", "py"]),
  d("Java", "Programming", ["core java", "java se"]),
  d("C", "Programming", ["c language", "ansi c"]),
  d("C++", "Programming", ["cpp", "c plus plus"]),
  d("C#", "Programming", ["c sharp", "csharp"]),
  d("JavaScript", "Programming", ["js", "es6", "ecmascript"]),
  d("TypeScript", "Programming", ["ts"]),
  d("Go", "Programming", ["golang"]),
  d("Rust", "Programming", []),
  d("R", "Programming", ["r language"]),
  d(".NET", "Programming", ["dotnet", "asp.net", "net core"]),
  // Web
  d("HTML", "Web", ["html5"]),
  d("CSS", "Web", ["css3"]),
  d("React", "Web", ["react.js", "reactjs"]),
  d("Angular", "Web", ["angularjs"]),
  d("Vue", "Web", ["vue.js", "vuejs"]),
  d("Node.js", "Web", ["nodejs", "node"]),
  d("Express", "Web", ["express.js", "expressjs"]),
  d("Next.js", "Web", ["nextjs"]),
  d("Tailwind CSS", "Web", ["tailwind", "tailwindcss"]),
  d("REST API", "Web", ["rest", "restful", "apis", "api development"]),
  d("GraphQL", "Web", []),
  // Databases
  d("MySQL", "Databases", []),
  d("PostgreSQL", "Databases", ["postgres"]),
  d("SQLite", "Databases", []),
  d("MongoDB", "Databases", ["mongo"]),
  d("SQL", "Databases", ["ansi sql", "t-sql", "pl/sql"]),
  d("Redis", "Databases", []),
  // Machine Learning
  d("Machine Learning", "Machine Learning", ["ml", "supervised learning", "unsupervised learning"]),
  d("NumPy", "Machine Learning", ["numpy"]),
  d("Pandas", "Machine Learning", []),
  d("Scikit-learn", "Machine Learning", ["sklearn", "scikit learn"]),
  d("TensorFlow", "Machine Learning", ["tf", "keras"]),
  d("PyTorch", "Machine Learning", ["torch"]),
  d("Deep Learning", "Machine Learning", ["neural networks", "dl"]),
  d("MLOps", "Machine Learning", ["mlflow", "model deployment"]),
  d("Statistics", "Machine Learning", ["statistical analysis", "probability"]),
  // AI
  d("LLM", "Artificial Intelligence", ["large language model", "llms", "gpt"]),
  d("RAG", "Artificial Intelligence", ["retrieval augmented generation", "vector database", "embeddings"]),
  d("Prompt Engineering", "Artificial Intelligence", ["prompting", "prompt design"]),
  d("OpenAI API", "Artificial Intelligence", ["openai", "chatgpt api"]),
  d("Gemini API", "Artificial Intelligence", ["gemini", "google ai studio"]),
  d("LangChain", "Artificial Intelligence", ["langgraph", "llamaindex"]),
  // NLP
  d("NLP", "NLP", ["natural language processing", "text mining"]),
  d("spaCy", "NLP", ["spacy"]),
  d("Transformers", "NLP", ["transformer", "bert", "sentence transformers"]),
  d("HuggingFace", "NLP", ["hugging face", "huggingface hub"]),
  d("NLTK", "NLP", []),
  d("TF-IDF", "NLP", ["tfidf", "tf idf", "cosine similarity"]),
  // Computer Vision
  d("OpenCV", "Computer Vision", ["cv2", "open cv"]),
  d("YOLO", "Computer Vision", ["yolov5", "yolov8", "object detection"]),
  d("CNN", "Computer Vision", ["convolutional neural network", "resnet", "image classification"]),
  // Cloud
  d("AWS", "Cloud", ["amazon web services", "ec2", "s3", "sagemaker", "lambda"]),
  d("Azure", "Cloud", ["microsoft azure", "azure ml"]),
  d("GCP", "Cloud", ["google cloud", "google cloud platform", "vertex ai"]),
  d("Render", "Cloud", ["railway", "vercel"]),
  // DevOps
  d("Docker", "DevOps", ["containerization", "dockerfile"]),
  d("Kubernetes", "DevOps", ["k8s"]),
  d("GitHub Actions", "DevOps", ["ci/cd", "cicd", "continuous integration", "jenkins"]),
  d("Linux", "DevOps", ["ubuntu", "bash", "shell scripting"]),
  // Tools
  d("Git", "Tools", ["version control"]),
  d("GitHub", "Tools", ["gitlab", "bitbucket"]),
  d("VS Code", "Tools", ["visual studio code", "vscode"]),
  d("Jupyter", "Tools", ["jupyter notebook", "colab", "google colab"]),
  d("FastAPI", "Tools", ["fast api"]),
  d("Flask", "Tools", []),
  d("Django", "Tools", []),
  d("Streamlit", "Tools", ["gradio"]),
  d("Postman", "Tools", []),
  // Data & BI
  d("Excel", "Data & BI", ["ms excel", "advanced excel", "pivot tables"]),
  d("Power BI", "Data & BI", ["powerbi"]),
  d("Tableau", "Data & BI", []),
  d("Data Visualization", "Data & BI", ["plotly", "matplotlib", "seaborn", "dashboards"]),
  d("ETL", "Data & BI", ["data pipeline", "airflow", "data cleaning"]),
  // Soft skills (evaluated only as professional competencies)
  d("Problem Solving", "Soft Skills", ["problem-solving", "analytical thinking"]),
  d("Communication", "Soft Skills", ["presentation skills", "stakeholder communication"]),
  d("Teamwork", "Soft Skills", ["collaboration", "team player"]),
  d("Agile", "Soft Skills", ["scrum", "kanban", "jira"]),
];

export const SKILL_CATEGORIES: SkillCategory[] = [
  "Programming",
  "Web",
  "Databases",
  "Machine Learning",
  "Artificial Intelligence",
  "NLP",
  "Computer Vision",
  "Cloud",
  "DevOps",
  "Tools",
  "Data & BI",
  "Soft Skills",
];

export const SKILL_BY_NAME = new Map(SKILL_DICTIONARY.map((s) => [s.name.toLowerCase(), s]));

export function categoryOf(skill: string): SkillCategory {
  return SKILL_BY_NAME.get(skill.toLowerCase())?.category ?? "Tools";
}
