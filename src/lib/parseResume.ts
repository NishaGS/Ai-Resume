import mammoth from "mammoth";

export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_EXTENSIONS = [".pdf", ".docx"] as const;

export interface ParsedFile {
  text: string;
  pages: number;
  fileName: string;
  sizeBytes: number;
}

export function validateFile(file: File): string | null {
  const lower = file.name.toLowerCase();
  const ok = ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
  if (!ok) return "Unsupported file type. Upload a PDF or DOCX resume.";
  if (file.size === 0) return "That file is empty.";
  if (file.size > MAX_FILE_BYTES) return "File is larger than 5 MB. Please upload a smaller resume.";
  return null;
}

async function extractPdf(file: File): Promise<{ text: string; pages: number }> {
  const pdfjs = await import("pdfjs-dist");
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await pdfjs.getDocument({ data }).promise;
  const chunks: string[] = [];
  for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
    const page = await doc.getPage(pageNumber);
    const content = await page.getTextContent();
    let lastY: number | null = null;
    let line = "";
    const pageLines: string[] = [];
    for (const item of content.items) {
      if (!("str" in item)) continue;
      const y = Math.round(item.transform[5] ?? 0);
      if (lastY !== null && Math.abs(y - lastY) > 3) {
        pageLines.push(line.trim());
        line = "";
      }
      line += `${item.str} `;
      lastY = y;
    }
    if (line.trim()) pageLines.push(line.trim());
    chunks.push(pageLines.join("\n"));
    page.cleanup();
  }
  const pages = doc.numPages;
  doc.cleanup();
  return { text: chunks.join("\n\n"), pages };
}

async function extractDocx(file: File): Promise<{ text: string; pages: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const text = result.value
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean)
    .join("\n");
  return { text, pages: Math.max(1, Math.ceil(text.length / 3000)) };
}

/** Extracts every PDF page / DOCX paragraph into plain text, entirely in the browser. */
export async function parseResumeFile(file: File): Promise<ParsedFile> {
  const lower = file.name.toLowerCase();
  const { text, pages } = lower.endsWith(".pdf") ? await extractPdf(file) : await extractDocx(file);
  if (text.replace(/\s/g, "").length < 40) {
    throw new Error(
      "No selectable text was found in that file. Scanned/image-only resumes are not supported — export a text-based PDF or DOCX.",
    );
  }
  return { text, pages, fileName: file.name, sizeBytes: file.size };
}
