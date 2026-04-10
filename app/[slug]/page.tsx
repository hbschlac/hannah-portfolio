import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getResume } from "@/lib/kv";
import { fetchGoogleDoc } from "@/lib/google";
import ResumeLayout from "@/components/ResumeLayout";
import DownloadPDFButton from "@/components/DownloadPDFButton";

export default function ResumePage({ params }: PageProps<"/[slug]">) {
  return (
    <main className="resume-page">
      <Suspense fallback={<ResumeSkeleton />}>
        {params.then(({ slug }) => (
          <ResumeContent slug={slug} />
        ))}
      </Suspense>
    </main>
  );
}

async function ResumeContent({ slug }: { slug: string }) {
  const entry = await getResume(slug);
  if (!entry) notFound();

  const button = entry.docId ? <DownloadPDFButton slug={slug} /> : null;

  // Use inline content if present (no Google Doc needed)
  if (entry.content && entry.content.length > 0) {
    return <>{button}<ResumeLayout blocks={entry.content} /></>;
  }

  let blocks;
  try {
    blocks = await fetchGoogleDoc(entry.docId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return (
      <div className="max-w-760 mx-auto py-16 text-center space-y-3">
        <p className="text-stone-500 text-sm">Could not load resume content.</p>
        <p className="text-stone-400 text-xs font-mono break-all">{message}</p>
      </div>
    );
  }

  return <>{button}<ResumeLayout blocks={blocks} /></>;
}

function ResumeSkeleton() {
  return (
    <div className="max-w-760 w-full mx-auto animate-pulse space-y-4 py-4">
      <div className="h-8 bg-stone-100 rounded w-64" />
      <div className="h-4 bg-stone-100 rounded w-96" />
      <div className="mt-6 h-3 bg-stone-100 rounded w-32" />
      <div className="h-px bg-stone-200 rounded" />
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-3 bg-stone-100 rounded" style={{ width: `${75 + (i % 3) * 10}%` }} />
        ))}
      </div>
    </div>
  );
}
