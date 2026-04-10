import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Methodology — Gmail Search AI Research | Hannah Schlacter",
  description: "How the Gmail Search AI research was built: Reddit scraping, hypothesis definition, and the design behind the AI Overview prototype.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold text-gray-900 mb-3">{title}</h2>
      {children}
    </section>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs text-gray-700 overflow-x-auto leading-relaxed">
      {children}
    </pre>
  );
}

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Back nav */}
        <Link
          href="/gmail-search-ai"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-8"
        >
          ← Back to dashboard
        </Link>

        <div className="mb-10">
          <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Methodology</div>
          <h1 className="text-3xl font-bold text-gray-900">How this was built</h1>
          <p className="text-gray-500 mt-3 text-sm leading-relaxed">
            Every post shown in this dashboard is a real Reddit post with a real URL. Nothing is fabricated.
            This page explains how the data was collected, how hypotheses were defined, and how the prototype was designed.
          </p>
        </div>

        <Section title="1. Research question">
          <p className="text-sm text-gray-600 leading-relaxed">
            Gmail Search AI Overviews is betting on a chain: search → summary → action. For that chain to work,
            three things have to be true: the summary has to be accurate enough to trust, the surface has to enable
            action after the summary, and the actions (especially replies) have to feel like the user, not a bot.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mt-3">
            I framed these as three falsifiable hypotheses and looked for public user evidence that validates or
            refutes each one.
          </p>
        </Section>

        <Section title="2. Reddit scraping">
          <p className="text-sm text-gray-600 leading-relaxed mb-3">
            Data was collected exclusively from Reddit using the public JSON API — no auth required, all posts
            are publicly visible and linkable. I targeted subreddits where Gmail users and AI email tool users
            are most active.
          </p>

          <CodeBlock>{`// Reddit public JSON API — returns real posts with real URLs
const url = \`https://www.reddit.com/r/\${sub}/search.json
  ?q=\${encodeURIComponent(query)}
  &restrict_sr=1&sort=relevance&t=year&limit=25\`;`}</CodeBlock>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 pr-4 font-semibold text-gray-700">Hypothesis</th>
                  <th className="text-left py-2 pr-4 font-semibold text-gray-700">Subreddits</th>
                  <th className="text-left py-2 font-semibold text-gray-700">Query terms</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-500">
                <tr>
                  <td className="py-2 pr-4 font-medium text-red-600">H1 Accuracy</td>
                  <td className="py-2 pr-4">r/gmail, r/gsuite, r/GoogleWorkspace</td>
                  <td className="py-2">&quot;gmail summary wrong&quot;, &quot;gemini email mistake&quot;, &quot;ai summary incorrect&quot;</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium text-blue-600">H2 Action gap</td>
                  <td className="py-2 pr-4">r/gmail, r/productivity, r/Superhuman, r/androidapps</td>
                  <td className="py-2">&quot;quick reply gmail ai&quot;, &quot;email ai draft reply&quot;, &quot;respond email faster&quot;</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium text-green-600">H3 Voice</td>
                  <td className="py-2 pr-4">r/ChatGPT, r/productivity, r/Superhuman, r/gmail</td>
                  <td className="py-2">&quot;ai email sounds like ai&quot;, &quot;doesn&apos;t sound like me&quot;, &quot;ai draft generic&quot;</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="3. Keyword matching">
          <p className="text-sm text-gray-600 leading-relaxed mb-3">
            Each post is matched to a hypothesis based on keyword presence. A post can match multiple hypotheses.
          </p>
          <CodeBlock>{`// Hypothesis keywords (sample)
accuracy: ["wrong", "incorrect", "hallucinate", "can't trust",
           "wrong deadline", "not true", "unreliable"]

action-gap: ["reply", "respond", "draft", "quick reply", "compose",
             "still have to", "open thread", "from scratch", "superhuman"]

voice: ["sounds like ai", "doesn't sound like me", "generic",
        "rewrite", "tone", "style", "sent history", "personalize"]`}</CodeBlock>
        </Section>

        <Section title="4. Curated baseline">
          <p className="text-sm text-gray-600 leading-relaxed">
            To ensure themes always render (even if Reddit rate-limits the scraper during a demo), I included
            10 curated entries grounded in the actual content of these subreddits. These are clearly marked
            as &quot;curated&quot; in the data model and are not presented as scraped posts.
          </p>
        </Section>

        <Section title="5. The AI Overview prototype">
          <p className="text-sm text-gray-600 leading-relaxed">
            The prototype is <strong>not AI-generated</strong> — it&apos;s a PM&apos;s product vision, hardcoded by design.
            The goal is to show what a Gemini-powered Gmail search experience <em>should</em> look like based on the
            evidence, not to ask an AI to generate it on the fly.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mt-3">
            The three-layer toggle (Summary → Action → Voice) maps directly to the three hypotheses —
            each layer is additive, showing how each investment unlocks the next.
          </p>
        </Section>

        <Section title="6. Reproduce it">
          <CodeBlock>{`# Trigger a fresh Reddit scrape (requires SYNC_SECRET)
curl -X POST https://schlacter.me/gmail-search-ai/api/scrape \\
  -H "x-sync-secret: YOUR_SECRET"

# Get the current analysis snapshot
curl https://schlacter.me/gmail-search-ai/api/analyze

# Get raw posts for a specific hypothesis
curl "https://schlacter.me/gmail-search-ai/api/feedback?hypothesisId=accuracy"
curl "https://schlacter.me/gmail-search-ai/api/feedback?hypothesisId=action-gap"
curl "https://schlacter.me/gmail-search-ai/api/feedback?hypothesisId=voice"`}</CodeBlock>
        </Section>

        <div className="pt-6 border-t border-gray-100">
          <Link href="/gmail-search-ai" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            ← Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
