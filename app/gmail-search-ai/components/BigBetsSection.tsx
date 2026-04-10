const BETS = [
  {
    n: "01",
    title: "Accuracy first, action second.",
    body: "Users won't tap Reply on a summary they don't trust. Get the grounding right before building anything on top of it — one bad summary kills the whole chain.",
  },
  {
    n: "02",
    title: "Close the search-to-action loop.",
    body: "Search → summary → draft reply, in 2 taps. Superhuman charges $30/month for this. Gmail has the data to do it free, at scale, for billions of people.",
  },
  {
    n: "03",
    title: "Voice matching is the moat.",
    body: "Gmail has years of your sent history and doesn't use it for personalization. Training reply style on that corpus is defensible — no competitor can replicate it without the same data.",
  },
  {
    n: "04",
    title: "The agentic horizon.",
    body: "Long-term: the AI doesn't wait for you to search. It surfaces what you need — the renewal coming up, the unanswered thread, the deal going cold. Proactive, not reactive.",
  },
];

export function BigBetsSection() {
  return (
    <div className="max-w-2xl mx-auto px-6 pb-20">
      <div className="border-t border-gray-100 pt-10 mb-10">
        <h2 className="text-lg font-semibold text-gray-900">Where I'd take it</h2>
      </div>

      <div className="space-y-8">
        {BETS.map((bet) => (
          <div key={bet.n} className="flex gap-6">
            <span className="text-xs font-mono text-gray-300 pt-0.5 shrink-0 w-6">{bet.n}</span>
            <div>
              <p className="text-sm font-semibold text-gray-900">{bet.title}</p>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">{bet.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
