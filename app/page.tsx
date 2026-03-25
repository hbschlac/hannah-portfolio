import { projects } from "@/content/projects";
import ProjectTile from "@/components/ProjectTile";
import Manifesto from "@/components/Manifesto";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Name / header */}
      <div className="max-w-2xl mx-auto px-6 pt-16 pb-2">
        <p className="text-xs tracking-widest uppercase text-muted">
          Hannah Schlacter
        </p>
        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
          <p className="text-xs text-muted">PM building consumer products with AI</p>
        </div>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <a
            href="mailto:hbschlac@gmail.com"
            className="text-xs text-muted hover:text-foreground transition-colors"
          >
            hbschlac@gmail.com
          </a>
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
      {/* Footer */}
      <footer className="max-w-2xl mx-auto px-6 py-8 border-t border-border">
        <p className="text-xs text-muted/60 mb-3">Open to PM roles at AI-first companies — <a href="mailto:hbschlac@gmail.com" className="hover:text-foreground transition-colors">hbschlac@gmail.com</a></p>
        <p className="text-xs text-muted/60">Projects built with Claude, Codex &amp; ChatGPT.</p>
        <p className="text-xs text-muted/60">This site built by Claude.</p>
      </footer>
    </main>
  );
}
