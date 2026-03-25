import { projects } from "@/content/projects";
import { notFound } from "next/navigation";
import Link from "next/link";
import ScreenshotStrip from "@/components/ScreenshotStrip";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  const sections = [
    { label: "The problem", content: project.problem },
    { label: "My hypothesis", content: project.hypothesis },
    { label: "What I built", content: project.built },
    { label: "What broke", content: project.broke },
    { label: "What I learned", content: project.learned },
    { label: "If I kept going", content: project.nextSteps },
  ];

  return (
    <main className="min-h-screen bg-background">
      {/* Back nav */}
      <div className="max-w-2xl mx-auto px-6 pt-10">
        <Link
          href="/"
          className="text-xs text-muted hover:text-foreground transition-colors"
        >
          ← Hannah Schlacter
        </Link>
      </div>

      {/* Header */}
      <div className="max-w-2xl mx-auto px-6 pt-10 pb-6">
        <div className="flex gap-1.5 flex-wrap mb-3">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full bg-accent-light text-foreground/70"
            >
              {tag}
            </span>
          ))}
        </div>
        <h1 className="text-2xl font-medium tracking-tight text-foreground mb-2">
          {project.title}
        </h1>
        <p className="text-sm text-muted leading-relaxed">{project.oneLiner}</p>
      </div>

      {/* Key learning callout */}
      <div className="max-w-2xl mx-auto px-6 pb-6">
        <div className="p-4 rounded-xl bg-accent-light text-sm italic text-foreground/70 leading-relaxed">
          ✨ {project.keyLearning}
        </div>
      </div>

      {/* Divider */}
      <div className="max-w-2xl mx-auto px-6 pb-8">
        <div className="border-t border-border" />
      </div>

      {/* Case study sections */}
      <div className="max-w-2xl mx-auto px-6 pb-8">
        <div className="flex flex-col gap-10">
          {sections.map((section) => (
            <div key={section.label}>
              <h2 className="text-xs tracking-widest uppercase text-muted mb-2">
                {section.label}
              </h2>
              <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-line">
                {section.content}
              </p>
            </div>
          ))}

          {/* Services map */}
          {project.services && project.services.length > 0 && (
            <div>
              <h2 className="text-xs tracking-widest uppercase text-muted mb-3">
                What was built
              </h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {project.services.map((layer) => (
                  <div
                    key={layer.layer}
                    className="rounded-xl border border-border bg-background p-3"
                  >
                    <p className="text-xs font-medium text-foreground mb-0.5">
                      {layer.layer}
                    </p>
                    <p className="text-xs text-muted mb-2">{layer.note}</p>
                    <ul className="flex flex-col gap-0.5">
                      {layer.items.map((item) => (
                        <li
                          key={item}
                          className="text-xs text-foreground/60 leading-snug"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prototype screens */}
          <div>
            <h2 className="text-xs tracking-widest uppercase text-muted mb-3">
              Prototype
            </h2>

            {/* Video embed */}
            {project.artifacts.videoUrl && (
              <div className="mb-4 rounded-xl overflow-hidden aspect-video">
                <iframe
                  src={project.artifacts.videoUrl}
                  className="w-full h-full"
                  allowFullScreen
                  allow="autoplay; fullscreen"
                />
              </div>
            )}

            {/* Screenshots — horizontal strip with lightbox */}
            {project.artifacts.screenshots.length === 0 && !project.artifacts.videoUrl ? (
              <div className="w-full h-44 rounded-xl bg-border flex items-center justify-center text-xs text-muted">
                Screenshots coming soon
              </div>
            ) : project.artifacts.screenshots.length > 0 ? (
              <ScreenshotStrip
                screenshots={project.artifacts.screenshots}
                title={project.title}
              />
            ) : null}

            {project.artifacts.liveUrl && (
              <a
                href={project.artifacts.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs mt-4 text-accent hover:underline"
              >
                View live ↗
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Back */}
      <div className="max-w-2xl mx-auto px-6 pb-24">
        <div className="border-t border-border pt-8">
          <Link
            href="/"
            className="text-xs text-muted hover:text-foreground transition-colors"
          >
            ← Back to all projects
          </Link>
        </div>
      </div>
    </main>
  );
}
