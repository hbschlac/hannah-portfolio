import type { GmailActionSnapshot } from "@/lib/gmail-action";
import Link from "next/link";

export function HeroSection({ snapshot }: { snapshot: GmailActionSnapshot }) {
  return (
    <div className="max-w-2xl mx-auto px-6 pt-16 pb-8">
      <h1 className="text-3xl font-bold text-gray-900 leading-tight">
        Gmail's AI bet is what happens <em>after</em> the summary.
      </h1>
      <p className="mt-3 text-gray-400 text-sm">
        Hannah Schlacter · {snapshot.totalFeedback}+ Reddit posts scraped ·{" "}
        <Link href="/gmail-search-ai/methodology" className="underline hover:text-gray-700">
          methodology
        </Link>{" "}
        · Apr 2026
      </p>
    </div>
  );
}
