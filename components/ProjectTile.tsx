import Link from "next/link";
import { Project } from "@/content/projects";

export default function ProjectTile({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.slug}`} className="group block">
      <div className="flex gap-4 p-4 rounded-xl border border-border transition-colors duration-150 group-hover:border-accent">
        {/* Thumbnail */}
        {project.thumbnailImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.thumbnailImage}
            alt={project.title}
            className="flex-shrink-0 w-[72px] h-[72px] rounded-lg object-cover object-top"
          />
        ) : (
          <div
            className="flex-shrink-0 w-[72px] h-[72px] rounded-lg"
            style={{ backgroundColor: project.thumbnailColor }}
          />
        )}

        {/* Content */}
        <div className="flex flex-col justify-center gap-1.5 min-w-0">
          <h3 className="text-sm font-medium text-foreground group-hover:underline underline-offset-2">
            {project.title}
          </h3>
          <p className="text-sm text-muted leading-snug">{project.oneLiner}</p>
          <div className="flex gap-1.5 flex-wrap mt-0.5">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full bg-accent-light text-foreground/70"
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted/60 leading-snug mt-0.5 flex items-start gap-1">
            <span className="text-accent shrink-0">✦</span>
            <span>{project.tileInsight}</span>
          </p>
        </div>
      </div>
    </Link>
  );
}
