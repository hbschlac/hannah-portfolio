import type { DocBlock, RichSpan } from "@/lib/google";

function Spans({ spans }: { spans: RichSpan[] }) {
  return (
    <>
      {spans.map((span, i) => {
        let node: React.ReactNode = span.text;

        if (span.bold && span.italic) {
          node = <strong key={i}><em>{span.text}</em></strong>;
        } else if (span.bold) {
          node = <strong key={i}>{span.text}</strong>;
        } else if (span.italic) {
          node = <em key={i}>{span.text}</em>;
        } else {
          node = <span key={i}>{span.text}</span>;
        }

        if (span.link) {
          return (
            <a
              key={i}
              href={span.link}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-stone-600 transition-colors"
            >
              {node}
            </a>
          );
        }

        return node;
      })}
    </>
  );
}

export default function ResumeLayout({ blocks }: { blocks: DocBlock[] }) {
  return (
    <div className="resume-root">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "name":
            return (
              <h1 key={i} className="resume-name">
                <Spans spans={block.spans} />
              </h1>
            );
          case "section":
            return (
              <div key={i} className="resume-section-header">
                <h2><Spans spans={block.spans} /></h2>
                <hr />
              </div>
            );
          case "entry-title":
            return (
              <h3 key={i} className="resume-entry-title">
                <Spans spans={block.spans} />
              </h3>
            );
          case "meta":
            return (
              <p key={i} className="resume-meta">
                <Spans spans={block.spans} />
              </p>
            );
          case "paragraph":
            return (
              <p key={i} className="resume-paragraph">
                <Spans spans={block.spans} />
              </p>
            );
          case "bullet":
            return (
              <div key={i} className={`resume-bullet resume-bullet-level-${block.level}`}>
                <span className="resume-bullet-dot">•</span>
                <span><Spans spans={block.spans} /></span>
              </div>
            );
        }
      })}
    </div>
  );
}
