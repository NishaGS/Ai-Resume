import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, Loader2, ShieldCheck, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { MAX_FILE_BYTES, parseResumeFile, validateFile } from "@/lib/parseResume";

export type UploadStage = "idle" | "reading" | "extracting" | "analyzing" | "done";

interface Props {
  onAnalyze: (text: string, fileName: string) => Promise<void>;
  busy: boolean;
}

const STAGE_LABEL: Record<UploadStage, string> = {
  idle: "Waiting for a resume",
  reading: "Reading file…",
  extracting: "Extracting and cleaning text…",
  analyzing: "Running TF-IDF matching and skill gap analysis…",
  done: "Analysis complete — uploaded file discarded",
};

export function ResumeUpload({ onAnalyze, busy }: Props) {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState(0);
  const [stage, setStage] = useState<UploadStage>("idle");
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const run = useCallback(
    async (file: File) => {
      const error = validateFile(file);
      if (error) {
        toast.error(error);
        return;
      }
      setFileName(file.name);
      setFileSize(file.size);
      setStage("reading");
      setProgress(18);
      try {
        setStage("extracting");
        setProgress(45);
        const parsed = await parseResumeFile(file);
        setStage("analyzing");
        setProgress(74);
        await onAnalyze(parsed.text, parsed.fileName);
        setProgress(100);
        setStage("done");
        // Responsible AI: drop every reference to the uploaded file.
        if (inputRef.current) inputRef.current.value = "";
        toast.success("Analysis ready — uploaded file deleted from memory");
      } catch (err) {
        setStage("idle");
        setProgress(0);
        toast.error(err instanceof Error ? err.message : "Could not analyse that resume");
      }
    },
    [onAnalyze],
  );

  const reset = () => {
    setFileName(null);
    setFileSize(0);
    setStage("idle");
    setProgress(0);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="glass-panel p-5 sm:p-7">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) void run(file);
        }}
        className={cn(
          "relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-all",
          dragging
            ? "border-primary bg-primary/8 shadow-glow"
            : "border-border bg-muted/30 hover:border-primary/50 hover:bg-primary/5",
        )}
      >
        <motion.span
          animate={{ y: dragging ? -6 : 0, scale: dragging ? 1.06 : 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="grid size-16 place-items-center rounded-2xl bg-primary/12 text-primary ring-1 ring-primary/25"
        >
          <UploadCloud className="size-8" />
        </motion.span>
        <div>
          <h3 className="text-lg font-semibold">Drag & drop your resume</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            PDF or DOCX · up to {Math.round(MAX_FILE_BYTES / (1024 * 1024))} MB · parsed locally in your browser
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void run(file);
          }}
        />
        <Button onClick={() => inputRef.current?.click()} disabled={busy} size="lg">
          {busy ? <Loader2 className="size-4 animate-spin" /> : <FileText className="size-4" />}
          {busy ? "Analyzing…" : "Choose resume file"}
        </Button>
      </div>

      <AnimatePresence>
        {fileName ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-5 rounded-xl border border-border bg-card/70 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {(fileSize / 1024).toFixed(0)} KB · {STAGE_LABEL[stage]}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={reset} aria-label="Remove uploaded file">
                <Trash2 className="size-4" />
              </Button>
            </div>
            <Progress value={progress} className="mt-3 h-2" />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <p className="mt-5 flex items-start gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" />
        Your file never leaves your device as a file — only the extracted text is analysed, and it is discarded right
        after the response. No gender, age, photo, nationality or marital signals are read.
      </p>
    </div>
  );
}
