import { Link } from "@tanstack/react-router";
import { BrainCircuit, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

const links = [
  { to: "/", label: "Analyzer" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/about", label: "How it works" },
] as const;

export function SiteHeader() {
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/25">
            <BrainCircuit className="size-5" />
          </span>
          <span className="text-sm leading-tight font-semibold sm:text-base">
            AI Resume Analyzer
            <span className="block text-[11px] font-normal text-muted-foreground">
              Job recommendation system
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              activeProps={{ className: "bg-accent text-accent-foreground" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <Button variant="outline" size="icon" aria-label="Toggle colour theme" onClick={toggle}>
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>
      </div>
    </header>
  );
}
