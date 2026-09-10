import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { analyseResumeText } from "./nlp/analyze";

const schema = z.object({
  text: z.string().min(40, "Resume text is too short to analyse").max(400_000),
  fileName: z.string().min(1).max(255),
});

/**
 * Analyses extracted resume text server-side.
 * Responsible AI: only the extracted text is transmitted, nothing is persisted,
 * and the text is discarded as soon as the response is returned.
 */
export const analyzeResume = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => analyseResumeText(data.text, data.fileName));
