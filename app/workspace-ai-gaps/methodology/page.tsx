import type { Metadata } from "next";
import { getCuratedFeedback } from "@/lib/workspace-ai";

export const metadata: Metadata = {
  title: "Methodology — Gemini Workspace AI Opportunity Map | Hannah Schlacter",
  description: "How the Gemini for Workspace opportunity analysis was built: data sources, scraper code, keyword matching, and the full dataset.",
};

const GITHUB_URL = "https://github.com/hbschlac/workspace-ai-research";
const RAW_DATA_URL = "/workspace-ai-gaps/api/export";

function CodeBlock({ code, language = "typescript" }: { code: string; language?: string }) {
  return (
    <div className="rounded-xl overflow-hidden border" style={{ borderColor: "#E8EAED" }}>
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900">
        <span className="text-xs text-gray-400 font-mono">{language}</span>
      </div>
      <pre className="overflow-x-auto bg-gray-950 p-5 text-sm leading-relaxed">
        <code className="text-gray-200 font-mono whitespace-pre">{code}</code>
      </pre>
    </div>
  );
}

function Section({ id, title, subtitle, children }: { id: string; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mt-14 scroll-mt-8">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 mt-1 mb-6">{subtitle}</p>}
      {!subtitle && <div className="mb-6" />}
      {children}
    </section>
  );
}

const REDDIT_CODE = `// Subreddits searched
const SUBREDDITS = [
  "GoogleWorkspace", "google", "artificial",
  "productivity", "ChatGPT"
];

// Search terms
const SEARCH_TERMS = [
  "gemini workspace", "gemini docs", "gemini gmail",
  "gemini sheets", "google ai workspace", "gemini side panel"
];

// Fetch via Reddit public JSON API (no auth required)
const url = \`https://www.reddit.com/r/\${sub}/search.json
  ?q=\${encodeURIComponent(term)}
  &restrict_sr=1&sort=relevance&t=year&limit=25\`;

const res = await fetch(url, {
  headers: { "User-Agent": "workspace-ai-analyzer/1.0" },
});`;

const HN_CODE = `// Uses Algolia HN search API — no auth required
const queries = [
  "gemini workspace", "google gemini docs",
  "gemini gmail", "google ai productivity"
];

// Fetch stories
fetch(\`https://hn.algolia.com/api/v1/search
  ?query=\${query}&tags=story&hitsPerPage=30\`);

// Also fetch comments (richer feedback signal)
fetch(\`https://hn.algolia.com/api/v1/search
  ?query=\${query}&tags=comment&hitsPerPage=50\`);

// Strip HTML tags from comment text
const text = hit.comment_text
  .replace(/<[^>]*>/g, " ")
  .replace(/\\s+/g, " ")
  .trim();`;

const APPSTORE_CODE = `// App Store IDs scraped (5 apps, 5 pages each)
const apps = [
  { id: 422689480, name: "gmail" },
  { id: 842842640, name: "docs" },
  { id: 842849113, name: "sheets" },
  { id: 879478102, name: "slides" },
  { id: 1013161476, name: "meet" },
];

// Only keep reviews mentioning AI-related keywords
const AI_KEYWORDS = [
  "ai", "gemini", "smart", "suggest", "summary",
  "compose", "write", "draft", "autocomplete",
  "hallucin", "context", "side panel", "useless",
  "broken", "buggy", "slow"
];

const reviews = await store.reviews({
  id: app.id,
  sort: store.sort.RECENT,
  page,   // pages 1–5
  country: "us",
});`;

const PLAYSTORE_CODE = `// Play Store app IDs scraped
const apps = [
  { id: "com.google.android.gm",                      name: "gmail" },
  { id: "com.google.android.apps.docs",               name: "docs" },
  { id: "com.google.android.apps.docs.editors.sheets",name: "sheets" },
  { id: "com.google.android.apps.docs.editors.slides",name: "slides" },
];

// Filter: only reviews mentioning AI/Gemini
const text = (review.text ?? "").toLowerCase();
if (
  !text.includes("ai") &&
  !text.includes("gemini") &&
  !text.includes("smart") &&
  !text.includes("suggest")
) continue;`;

const SO_CODE = `// Stack Overflow public API v2.3 (no auth)
// Searches both stackoverflow.com and webapps.stackexchange.com
const queries = [
  "gemini+google+workspace", "gemini+docs",
  "gemini+gmail", "gemini+sheets", "google+ai+workspace"
];

fetch(\`https://api.stackexchange.com/2.3/search/advanced
  ?order=desc&sort=relevance&q=\${query}
  &site=stackoverflow&pagesize=30&filter=withbody\`);

// Also webapps.stackexchange.com (more Workspace questions)
fetch(\`https://api.stackexchange.com/2.3/search/advanced
  ?q=\${query}&site=webapps&pagesize=30&filter=withbody\`);`;

const YOUTUBE_CODE = `// Step 1: Search YouTube HTML for video IDs
// No API key — parses ytInitialData from page HTML
const url = \`https://www.youtube.com/results
  ?search_query=\${query}&sp=CAISBAgCEAE\`; // filter: this year

const ids = [...html.matchAll(
  /\\"videoId\\":\\"([a-zA-Z0-9_-]{11})\\"/g
)].map(m => m[1]);

// Step 2: Fetch transcript via youtube-transcript-api (Python)
// Requires: pip install youtube-transcript-api
execSync(\`python3 -c "
from youtube_transcript_api import YouTubeTranscriptApi
api = YouTubeTranscriptApi()
transcript = api.fetch('\${videoId}', languages=['en'])
text = ' '.join([s.text for s in transcript.snippets])
print(text[:2000])
"\`);`;

const ANALYSIS_CODE = `// Each theme has a keyword list
const THEME_KEYWORDS: Record<string, string[]> = {
  "hallucination": [
    "hallucinate", "hallucination", "made up",
    "fabricat", "incorrect", "wrong information",
    "inaccurate", "false", "imagin"
  ],
  "cross-app-memory": [
    "context", "memory", "remember", "forget",
    "loses context", "switch", "cross-app",
    "between apps", "side panel", "persistent"
  ],
  "mobile-voice": [
    "mobile", "phone", "voice", "hands-free",
    "android", "ios", "cramped", "small screen"
  ],
  // ... (see analysis.ts for full list)
};

// Match: simple keyword substring search (case-insensitive)
function analyzeFeedback(raw: RawFeedback[], themes: PainPointTheme[]) {
  for (const feedback of raw) {
    const lower = feedback.text.toLowerCase();
    for (const theme of themes) {
      const keywords = THEME_KEYWORDS[theme.id] ?? [];
      if (keywords.some(kw => lower.includes(kw))) {
        theme.frequency++;
        if (theme.quotes.length < 5) {
          theme.quotes.push({ text, source, url, author, date });
        }
      }
    }
  }
  // Sort by severity × frequency (highest impact first)
  return themes.sort((a, b) =>
    b.severity * b.frequency - a.severity * a.frequency
  );
}`;

const PIPELINE_CODE = `// Full pipeline: scrape → analyze → save to Upstash Redis KV

export async function buildSnapshot() {
  // 1. Scrape all sources in parallel (with timeouts)
  const withTimeout = (p, ms, fallback) =>
    Promise.race([p, new Promise(r => setTimeout(() => r(fallback), ms))]);

  const [reddit, hn, stackoverflow, appstore] = await Promise.all([
    scrapeReddit(),
    scrapeHackerNews(),
    scrapeStackOverflow(),
    withTimeout(scrapeAppStore(), 20_000, []),  // 20s timeout
  ]);
  // YouTube is slower (transcripts), run sequentially after
  const youtube = await withTimeout(scrapeYouTube(), 60_000, []);
  const curated = getCuratedFeedback();

  const allFeedback = [
    ...reddit, ...hn, ...stackoverflow,
    ...appstore, ...youtube, ...curated
  ];

  // 2. Match feedback to themes
  const themes = analyzeFeedback(allFeedback, getDefaultThemes());

  // 3. Aggregate competitor mentions
  const topCompetitors = buildCompetitorRanking(themes);

  // 4. Save to KV (Upstash Redis)
  await saveRawFeedback(allFeedback);  // key: workspace-ai:raw-feedback
  await saveSnapshot({ themes, topCompetitors, ... });  // key: workspace-ai:snapshot
}`;

export default function MethodologyPage() {
  const curated = getCuratedFeedback();

  return (
    <div className="min-h-screen" style={{ background: "#FAFAFA" }}>
      {/* Header */}
      <header className="bg-white border-b" style={{ borderColor: "#E8EAED" }}>
        <div className="max-w-4xl mx-auto px-6 py-10">
          <a
            href="/google-workspace-ai-feedback"
            className="inline-flex items-center gap-1 text-sm text-blue-500 hover:underline mb-4"
          >
            ← Back to analysis
          </a>
          <h1 className="text-3xl font-bold text-gray-900">How this was built</h1>
          <p className="text-lg text-gray-500 mt-2 max-w-2xl">
            Full methodology: data sources, scraper code, keyword matching, and the complete dataset — so you can verify every finding.
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              View code on GitHub
            </a>
            <a
              href={RAW_DATA_URL}
              download
              className="inline-flex items-center gap-1.5 text-sm bg-white border text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              style={{ borderColor: "#E8EAED" }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Download raw data (JSON)
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pb-24">

        {/* TOC */}
        <nav className="mt-10 bg-white border rounded-xl p-5" style={{ borderColor: "#E8EAED" }}>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">On this page</p>
          <ol className="space-y-1.5 text-sm text-blue-600">
            {[
              ["#overview", "Overview"],
              ["#reddit", "1. Reddit"],
              ["#hackernews", "2. Hacker News"],
              ["#appstore", "3. App Store"],
              ["#playstore", "4. Play Store"],
              ["#stackoverflow", "5. Stack Overflow"],
              ["#youtube", "6. YouTube"],
              ["#analysis", "7. Theme Analysis Engine"],
              ["#pipeline", "8. Full Pipeline"],
              ["#curated", "9. Curated Baseline Data"],
              ["#reproduce", "10. Reproduce It"],
            ].map(([href, label]) => (
              <li key={href}>
                <a href={href} className="hover:underline">{label}</a>
              </li>
            ))}
          </ol>
        </nav>

        <Section id="overview" title="Overview" subtitle="The approach in one paragraph">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-sm text-blue-900 leading-relaxed">
            Six scrapers collect public user feedback from Reddit, Hacker News, the App Store, the Play Store,
            Stack Overflow, and YouTube — no authentication, no paywalled data. A keyword-based matching engine
            (not ML) assigns each feedback item to one or more opportunity themes. Severity scores (1–5) are
            set manually based on user sentiment patterns and business impact. Raw data is stored in
            Upstash Redis KV. A 15-item curated baseline ensures key themes are always represented even
            when scrapers return low volume.
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Sources", value: "6" },
              { label: "Themes", value: "7" },
              { label: "Keyword lists", value: "7" },
              { label: "Curated entries", value: "15" },
            ].map((s) => (
              <div key={s.label} className="bg-white border rounded-xl p-4 text-center" style={{ borderColor: "#E8EAED" }}>
                <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section id="reddit" title="1. Reddit" subtitle="Public JSON API — no auth required">
          <p className="text-sm text-gray-600 mb-4">
            Searches 5 subreddits × 6 search terms = 30 API calls. Each call returns up to 25 posts sorted by relevance
            within the past year. Posts are deduplicated by Reddit post ID.
          </p>
          <CodeBlock code={REDDIT_CODE} />
        </Section>

        <Section id="hackernews" title="2. Hacker News" subtitle="Algolia search API — no auth required">
          <p className="text-sm text-gray-600 mb-4">
            Searches for both stories and comments across 4 queries. Comments are included because they
            contain more specific technical feedback than top-level submissions. HTML tags are stripped from
            comment bodies.
          </p>
          <CodeBlock code={HN_CODE} />
        </Section>

        <Section id="appstore" title="3. Apple App Store" subtitle="app-store-scraper npm package">
          <p className="text-sm text-gray-600 mb-4">
            Scrapes the 5 most relevant Google Workspace apps (Gmail, Docs, Sheets, Slides, Meet) — 5 pages
            each, sorted by most recent. Reviews are filtered to only those mentioning AI-related keywords to
            reduce noise.
          </p>
          <CodeBlock code={APPSTORE_CODE} />
        </Section>

        <Section id="playstore" title="4. Google Play Store" subtitle="google-play-scraper npm package">
          <p className="text-sm text-gray-600 mb-4">
            Scrapes the 4 Android Workspace apps (Gmail, Docs, Sheets, Slides) — 30 most recent reviews each.
            Same AI-keyword filter applied as App Store.
          </p>
          <CodeBlock code={PLAYSTORE_CODE} />
        </Section>

        <Section id="stackoverflow" title="5. Stack Overflow" subtitle="StackExchange public API v2.3 — no auth required">
          <p className="text-sm text-gray-600 mb-4">
            Searches both stackoverflow.com and webapps.stackexchange.com (the latter has far more
            Workspace-specific questions). Full question bodies are fetched via the <code className="text-xs bg-gray-100 px-1 rounded">filter=withbody</code> parameter.
          </p>
          <CodeBlock code={SO_CODE} />
        </Section>

        <Section id="youtube" title="6. YouTube" subtitle="HTML scraping + youtube-transcript-api (Python)">
          <p className="text-sm text-gray-600 mb-4">
            YouTube has no public search API without quota limits. Instead, the scraper parses video IDs
            from the YouTube search results HTML (the <code className="text-xs bg-gray-100 px-1 rounded">ytInitialData</code> JSON embedded in the page).
            Transcripts are fetched via the open-source <code className="text-xs bg-gray-100 px-1 rounded">youtube-transcript-api</code> Python library — no
            API key needed. Up to 15 videos are transcribed per run.
          </p>
          <CodeBlock code={YOUTUBE_CODE} />
        </Section>

        <Section id="analysis" title="7. Theme Analysis Engine" subtitle="Keyword matching — no ML, fully auditable">
          <p className="text-sm text-gray-600 mb-4">
            Each raw feedback item is matched against 7 keyword lists via simple substring search.
            A single item can match multiple themes. Themes are ranked by{" "}
            <code className="text-xs bg-gray-100 px-1 rounded">severity × frequency</code> — highest impact first.
            Severity is manually assessed; frequency is computed.
          </p>
          <CodeBlock code={ANALYSIS_CODE} />

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 font-medium text-gray-700 border-b" style={{ borderColor: "#E8EAED" }}>Theme</th>
                  <th className="text-left p-3 font-medium text-gray-700 border-b" style={{ borderColor: "#E8EAED" }}>Severity</th>
                  <th className="text-left p-3 font-medium text-gray-700 border-b" style={{ borderColor: "#E8EAED" }}>Scope</th>
                  <th className="text-left p-3 font-medium text-gray-700 border-b" style={{ borderColor: "#E8EAED" }}>Sample keywords</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Trust & Grounding", severity: 5, scope: "Platform", kw: "hallucinate, fabricat, made up, incorrect" },
                  { name: "Cross-App Context & Memory", severity: 5, scope: "Platform", kw: "context, memory, forget, side panel, switch" },
                  { name: "Mobile & Voice-First AI", severity: 4, scope: "Platform", kw: "mobile, phone, voice, hands-free, ios" },
                  { name: "Context-Aware Writing", severity: 4, scope: "App-level", kw: "help me write, generic, tone, style, fluff" },
                  { name: "Deeper Spreadsheet Intelligence", severity: 3, scope: "App-level", kw: "formula, vlookup, array, pivot, sheets" },
                  { name: "Meeting Intelligence Upgrade", severity: 4, scope: "App-level", kw: "meeting, action item, speaker, attribution" },
                  { name: "Value Perception", severity: 3, scope: "Platform", kw: "pricing, cost, expensive, per user, tier" },
                ].map((row) => (
                  <tr key={row.name} className="border-b hover:bg-gray-50" style={{ borderColor: "#F3F4F6" }}>
                    <td className="p-3 font-medium text-gray-900">{row.name}</td>
                    <td className="p-3 text-gray-600">{row.severity}/5</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${row.scope === "Platform" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                        {row.scope}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500 font-mono text-xs">{row.kw}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="pipeline" title="8. Full Pipeline" subtitle="Sources → KV → Dashboard">
          <p className="text-sm text-gray-600 mb-4">
            All scrapers run in parallel (except YouTube, which requires sequential transcript fetches).
            Results are saved to two Upstash Redis keys:{" "}
            <code className="text-xs bg-gray-100 px-1 rounded">workspace-ai:raw-feedback</code> (all items) and{" "}
            <code className="text-xs bg-gray-100 px-1 rounded">workspace-ai:snapshot</code> (analyzed themes + competitors).
            The dashboard reads from the snapshot; the drill-down drawer reads from raw feedback.
          </p>
          <CodeBlock code={PIPELINE_CODE} />
        </Section>

        <Section id="curated" title="9. Curated Baseline Data" subtitle="15 manually sourced entries with real source URLs">
          <p className="text-sm text-gray-600 mb-6">
            The curated set ensures key themes always have representative quotes, even when scraper
            volume is low. These are real user complaints sourced from Reddit and Google&apos;s own support forums —
            not invented. Each entry is tagged with the original URL.
          </p>
          <div className="space-y-4">
            {curated.map((item, i) => (
              <div key={item.id} className="bg-white border rounded-xl p-4" style={{ borderColor: "#E8EAED" }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono text-gray-400">#{i + 1}</span>
                      <span className="text-xs text-gray-400">{item.author}</span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-400">
                        {new Date(item.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{item.text}</p>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-xs text-blue-500 hover:underline"
                  >
                    Source →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section id="reproduce" title="10. Reproduce It" subtitle="Run the full pipeline yourself">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white border rounded-xl p-4" style={{ borderColor: "#E8EAED" }}>
              <h3 className="font-medium text-sm text-gray-900 mb-3">Trigger a fresh scrape</h3>
              <CodeBlock language="bash" code={`curl -X POST \\
  "https://schlacter.me/workspace-ai-gaps/api/scrape\\
  ?secret=YOUR_SYNC_SECRET"`} />
              <p className="text-xs text-gray-400 mt-2">Requires <code className="bg-gray-100 px-1 rounded">SYNC_SECRET</code> env var. Returns theme counts and source volumes.</p>
            </div>
            <div className="bg-white border rounded-xl p-4" style={{ borderColor: "#E8EAED" }}>
              <h3 className="font-medium text-sm text-gray-900 mb-3">Download the raw dataset</h3>
              <CodeBlock language="bash" code={`curl "https://schlacter.me/workspace-ai-gaps/api/export" \\
  -o raw-feedback.json`} />
              <p className="text-xs text-gray-400 mt-2">Public endpoint. Returns all {">"}1,000 feedback items as JSON.</p>
            </div>
          </div>
          <div className="bg-white border rounded-xl p-4" style={{ borderColor: "#E8EAED" }}>
            <h3 className="font-medium text-sm text-gray-900 mb-3">Get the analyzed snapshot</h3>
            <CodeBlock language="bash" code={`curl "https://schlacter.me/workspace-ai-gaps/api/analyze"`} />
            <p className="text-xs text-gray-400 mt-2">Returns themes with frequency counts, quotes, competitor data, and source breakdown.</p>
          </div>

          <div className="mt-6 bg-gray-50 rounded-xl p-5">
            <h3 className="font-medium text-sm text-gray-900 mb-2">Clone and run locally</h3>
            <CodeBlock language="bash" code={`git clone https://github.com/hbschlac/workspace-ai-research
cd workspace-ai-research

# Install dependencies
npm install google-play-scraper app-store-scraper @upstash/redis

# Install Python transcript fetcher
pip install youtube-transcript-api

# Scraper and analysis code is in:
#   scraper.ts   — all 6 data source scrapers
#   analysis.ts  — keyword matching + theme engine
#   data/        — curated-feedback.json, raw-feedback.json`} />
          </div>
        </Section>

      </main>

      <footer className="border-t py-8 text-center" style={{ borderColor: "#E8EAED" }}>
        <p className="text-xs text-gray-400">
          Built by{" "}
          <a href="https://schlacter.me" className="text-blue-500 hover:underline">
            Hannah Schlacter
          </a>
          {" "} — Product Manager
        </p>
        <div className="flex items-center justify-center gap-4 mt-2">
          <a href="/google-workspace-ai-feedback" className="text-xs text-blue-500 hover:underline">← Analysis</a>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:underline">GitHub</a>
          <a href={RAW_DATA_URL} download className="text-xs text-gray-400 hover:underline">Raw data</a>
        </div>
      </footer>
    </div>
  );
}
