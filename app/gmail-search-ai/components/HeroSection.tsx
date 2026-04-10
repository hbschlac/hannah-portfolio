import type { GmailActionSnapshot } from "@/lib/gmail-action";
import Link from "next/link";

export function HeroSection({ snapshot }: { snapshot: GmailActionSnapshot }) {
  const redditCount = snapshot.sources.reddit ?? 0;
  const totalCount = snapshot.totalFeedback;

  return (
    <div className="border-b border-gray-100 bg-white">
      <div className="max-w-5xl mx-auto px-4 py-10 md:py-14">
        {/* Eyebrow */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-medium uppercase tracking-widest text-gray-400">
            Research · Gmail Search AI
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight max-w-3xl">
          Gmail's AI bet isn't search.
          <br />
          <span style={{ color: "#1a73e8" }}>It's what happens after the summary.</span>
        </h1>

        <p className="mt-4 text-base md:text-lg text-gray-500 max-w-2xl leading-relaxed">
          I scraped {totalCount.toLocaleString()}+ real Reddit posts across Gmail users and AI email tool users to validate
          three hypotheses about what the accuracy → action → voice chain needs to get right.
          Below: the evidence and a prototype of what it could look like.
        </p>

        {/* Stats strip */}
        <div className="flex flex-wrap gap-6 mt-8">
          <div>
            <div className="text-2xl font-bold text-gray-900">{redditCount > 0 ? redditCount.toLocaleString() + "+" : totalCount.toLocaleString()}</div>
            <div className="text-xs text-gray-400 mt-0.5">Reddit posts analyzed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">6</div>
            <div className="text-xs text-gray-400 mt-0.5">subreddits scraped</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">3</div>
            <div className="text-xs text-gray-400 mt-0.5">hypotheses tested</div>
          </div>
          <div>
            <div className="text-2xl font-bold" style={{ color: "#1a73e8" }}>validated</div>
            <div className="text-xs text-gray-400 mt-0.5">all three</div>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center gap-3 mt-8 text-sm">
          <Link
            href="/gmail-search-ai/methodology"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-gray-400 transition-colors"
          >
            <span>How this was built</span>
            <span>→</span>
          </Link>
          <Link
            href="/google-workspace-ai-feedback"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-gray-400 transition-colors"
          >
            <span>← Also see: Workspace AI Gaps</span>
          </Link>
          <span className="text-gray-300">·</span>
          <span className="text-xs text-gray-400">
            Last updated {new Date(snapshot.lastUpdated).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>
      </div>
    </div>
  );
}
