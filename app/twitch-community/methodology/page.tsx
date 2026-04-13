export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <a href="/twitch-community" className="text-sm text-purple-400 hover:text-purple-300 mb-6 inline-block">&larr; Back to Dashboard</a>

        <h1 className="text-3xl font-bold mb-2">Methodology</h1>
        <p className="text-gray-400 mb-8">How this research was conducted, what data was collected, and how it was analyzed.</p>

        <div className="space-y-8 text-sm text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">Overview</h2>
            <p>
              This dashboard aggregates publicly available feedback about Twitch from multiple sources,
              clusters it into themes using keyword matching, and presents it as an interactive research tool.
              No private data, APIs requiring authentication, or user accounts were accessed. All analysis is
              deterministic — no LLMs are used in the data pipeline.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">Data Sources</h2>
            <div className="space-y-3">
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                <h3 className="font-medium text-white">Reddit</h3>
                <p className="text-gray-400 mt-1">
                  Public JSON API (<code className="text-purple-400">reddit.com/r/[sub]/search.json</code>).
                  Subreddits: r/Twitch, r/streaming, r/Twitch_Startup, r/twitchstreams, r/twitchplayground.
                  17 search terms across all subreddits. Also scrapes comments on top posts for deeper signal.
                  Each post links to its exact Reddit permalink.
                </p>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                <h3 className="font-medium text-white">App Store (iOS)</h3>
                <p className="text-gray-400 mt-1">
                  <code className="text-purple-400">app-store-scraper</code> npm package. Twitch iOS app (ID: 460177396).
                  Up to 10 pages of recent reviews, filtered by 40+ notification/community/discovery keywords.
                  Each review links to the App Store review page.
                </p>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                <h3 className="font-medium text-white">Play Store (Android)</h3>
                <p className="text-gray-400 mt-1">
                  <code className="text-purple-400">google-play-scraper</code> npm package. Twitch Android app
                  (tv.twitch.android.app). Up to 10 pages of reviews with same keyword filter as App Store.
                </p>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                <h3 className="font-medium text-white">YouTube</h3>
                <p className="text-gray-400 mt-1">
                  HTML search to find video IDs, then <code className="text-purple-400">youtube-transcript-api</code> (Python)
                  to extract English transcripts. 8 search queries targeting Twitch notification/discovery/community content.
                  Each entry links to the exact YouTube video.
                </p>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                <h3 className="font-medium text-white">Hacker News</h3>
                <p className="text-gray-400 mt-1">
                  Algolia search API for both stories and comments. 8 queries with 12-month date filter.
                  HTML stripped from comments. Each entry links to the exact HN thread.
                </p>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                <h3 className="font-medium text-white">Curated Sources</h3>
                <p className="text-gray-400 mt-1">
                  20 hand-sourced, high-signal items from: top Reddit threads (500+ upvotes), creator tweets,
                  tech press (The Verge, TechCrunch, Polygon), and App Store reviews. Each has an exact source URL,
                  author, date, and perspective tag. These provide high-confidence anchors for themes that keyword
                  scraping might miss.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">Freshness Guardrail</h2>
            <p>
              All data is filtered to the last 12 months. Scrapers apply date filters at the source level
              (Reddit <code className="text-purple-400">t=year</code>, HN <code className="text-purple-400">numericFilters=created_at_i&gt;</code>),
              and a final pass rejects any item with a date older than 12 months before analysis.
              Items without reliable dates are flagged <code className="text-purple-400">dateConfidence: &quot;low&quot;</code>
              and excluded from the timeline view.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">Theme Analysis</h2>
            <p className="mb-3">
              Each piece of feedback is matched against 10 themes (5 community, 5 notification) using keyword lists.
              A feedback item matches a theme if its text (case-insensitive) contains any keyword from that theme&apos;s list.
              One item can match multiple themes.
            </p>
            <p>
              Themes are ranked by <code className="text-purple-400">severity &times; frequency</code>.
              Severity is manually assessed (1-5 scale) based on user impact. Frequency is the count of matching data points.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">Perspective Tagging</h2>
            <p>
              Each data point is tagged as <span className="text-purple-400">Creator</span>,{" "}
              <span className="text-green-400">Viewer</span>, or <span className="text-gray-400">Both</span> using
              keyword matching. Creator signals include phrases like &quot;my stream,&quot; &quot;my viewers,&quot; &quot;as a streamer.&quot;
              Viewer signals include &quot;I watch,&quot; &quot;my favorite streamer,&quot; &quot;I missed.&quot; Items matching both or neither
              default to &quot;Both.&quot;
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">Signal Strength</h2>
            <p>
              Data points are sorted by their score (Reddit upvotes, App Store stars, HN points) when displayed
              in drill-down views. Higher scores indicate stronger community validation of the feedback.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">Feature Launch Correlation</h2>
            <p>
              Recent Twitch product launches are documented with dates, descriptions, and source URLs.
              These appear as markers on the timeline chart and as &quot;Related Launches&quot; on theme cards,
              allowing visual correlation between product changes and feedback volume shifts.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">Sourcing Standard</h2>
            <ul className="list-disc list-inside text-gray-400 space-y-1">
              <li>Every quote links to the exact source URL (Reddit permalink, App Store review page, YouTube video, HN thread)</li>
              <li>Every chart percentage is calculated from the underlying data points, viewable via &quot;View data&quot; drill-down</li>
              <li>Feature launch markers link to the original announcement</li>
              <li>The full raw dataset is downloadable as JSON from the footer</li>
              <li>All code is open source on <a href="https://github.com/hbschlac/twitch-community-research" className="text-purple-400 hover:text-purple-300" target="_blank" rel="noopener noreferrer">GitHub</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">Tools Used</h2>
            <p>
              Built with <span className="text-purple-400 font-medium">Claude Code</span> (Anthropic),
              Next.js 16, React 19, Upstash Redis, and Vercel. No LLMs in the data pipeline —
              all analysis is deterministic keyword matching.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-800 flex gap-3">
          <a href="/twitch-community" className="text-xs text-gray-400 hover:text-white bg-gray-800 px-3 py-1.5 rounded-lg transition-colors">
            Back to Dashboard
          </a>
          <a href="https://github.com/hbschlac/twitch-community-research" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-white bg-gray-800 px-3 py-1.5 rounded-lg transition-colors">
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
