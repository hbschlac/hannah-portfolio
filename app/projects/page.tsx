import { projects } from "@/content/projects";
import ProjectTile from "@/components/ProjectTile";
import Manifesto from "@/components/Manifesto";
import GitHubActivity from "@/components/GitHubActivity";
import Link from "next/link";

export const metadata = {
  title: "Projects — Hannah Schlacter",
  description: "PM building consumer products with AI. Four things I built because I wanted them to exist.",
};

export default function ProjectsPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Name / header */}
      <div className="max-w-2xl mx-auto px-6 pt-16 pb-2">
        <Link href="/" className="text-xs text-muted hover:text-foreground transition-colors">
          ← schlacter.me
        </Link>
        <p className="text-xs tracking-widest uppercase text-muted mt-6">
          Hannah Schlacter
        </p>
        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
          <p className="text-xs text-muted">PM building consumer products with AI</p>
        </div>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <Link
            href="/contact"
            className="text-xs text-muted hover:text-foreground transition-colors"
          >
            say hello →
          </Link>
          <span className="text-muted/40 text-xs">·</span>
          <a
            href="https://www.linkedin.com/in/hannahschlacter"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted hover:text-foreground transition-colors"
          >
            LinkedIn
          </a>
        </div>
      </div>

      {/* Manifesto */}
      <Manifesto />

      {/* Divider */}
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="border-t border-border" />
      </div>

      {/* Projects */}
      <section className="max-w-2xl mx-auto px-6 pb-24">
        <p className="text-xs tracking-widest uppercase text-muted mb-1">
          Projects
        </p>
        <p className="text-xs text-muted/70 mb-6">Four things I built because I wanted them to exist.</p>
        <div className="flex flex-col gap-3">
          {projects.map((project) => (
            <ProjectTile key={project.slug} project={project} />
          ))}
        </div>
      </section>

      {/* GitHub Activity */}
      <div className="max-w-2xl mx-auto px-6 pb-10">
        <GitHubActivity />
      </div>

      {/* Footer */}
      <footer className="max-w-2xl mx-auto w-full px-6 py-8" style={{ borderTop: "1px solid #E5E1D8" }}>
        <p className="text-xs" style={{ color: "#8A8A8A" }}>Made with love, Oakland, CA 🌳 · © 2026</p>
      </footer>
    </main>
  );
}
