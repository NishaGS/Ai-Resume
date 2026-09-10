import { Link } from "@tanstack/react-router";
import { BrainCircuit, Github, ShieldCheck } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border/60 bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <span className="flex items-center gap-2 font-semibold">
            <BrainCircuit className="size-5 text-primary" />
            ResumeIQ
          </span>
          <p className="mt-3 text-sm text-muted-foreground">
            An NLP-powered resume analyzer and job recommendation system built with TF-IDF vectorisation and cosine
            similarity.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Pages</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/" className="transition-colors hover:text-foreground">
                Analyzer
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="transition-colors hover:text-foreground">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/about" className="transition-colors hover:text-foreground">
                How it works
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck className="size-4 text-success" />
            Privacy first
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Resumes are parsed in your browser and discarded after analysis. Nothing is stored on a server, and scoring
            ignores name, gender, age and photo.
          </p>
          <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Github className="size-3.5" />
            Educational guidance only — not a hiring decision.
          </p>
        </div>
      </div>
    </footer>
  );
}
