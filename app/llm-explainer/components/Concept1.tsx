"use client";

import { useState, useCallback } from "react";

/* ─────────────────────────────────────────────
   Tokenizer logic (simplified BPE-like)
   ───────────────────────────────────────────── */

// Simulated subword tokenizer — splits on common patterns
function tokenize(text: string): string[] {
  if (!text.trim()) return [];
  // Simple word-level split, then apply common subword splits
  const words = text.match(/\S+|\s+/g) || [];
  const tokens: string[] = [];
  for (const w of words) {
    if (/^\s+$/.test(w)) continue;
    // Simulate subword splits for longer/compound words
    const lower = w.toLowerCase().replace(/[^\w']/g, "");
    const punct = w.replace(/[\w']/g, "");
    if (lower.length > 0) {
      const subwords = splitSubword(lower);
      tokens.push(...subwords);
    }
    if (punct) tokens.push(punct);
  }
  return tokens;
}

function splitSubword(word: string): string[] {
  // Common English subword boundaries
  const prefixes = ["un", "re", "pre", "dis", "mis", "over", "under", "out"];
  const suffixes = ["ing", "tion", "sion", "ment", "ness", "able", "ible", "ful", "less", "ous", "ive", "ly", "er", "est", "ed", "es", "al", "ize"];

  if (word.length <= 4) return [word];

  for (const pre of prefixes) {
    if (word.startsWith(pre) && word.length > pre.length + 2) {
      const rest = word.slice(pre.length);
      return [pre, ...splitSubword(rest)];
    }
  }

  for (const suf of suffixes) {
    if (word.endsWith(suf) && word.length > suf.length + 2) {
      const rest = word.slice(0, -suf.length);
      return [rest, suf];
    }
  }

  return [word];
}

// Simulated token IDs (deterministic hash)
function tokenToId(token: string): number {
  let hash = 0;
  for (let i = 0; i < token.length; i++) {
    hash = ((hash << 5) - hash + token.charCodeAt(i)) & 0xffff;
  }
  return 256 + (hash % 49744); // Simulate GPT-2 range
}

/* ─────────────────────────────────────────────
   Embedding logic (simulated 2D projections)
   ───────────────────────────────────────────── */

// Pre-defined embedding positions for common words to show meaningful clusters
const KNOWN_EMBEDDINGS: Record<string, [number, number]> = {
  // Animals cluster
  cat: [0.82, 0.75], dog: [0.78, 0.80], kitten: [0.85, 0.72],
  puppy: [0.75, 0.83], bird: [0.70, 0.68], fish: [0.65, 0.60],
  // Food cluster
  pizza: [0.20, 0.75], burger: [0.25, 0.80], pasta: [0.18, 0.70],
  sushi: [0.22, 0.68], food: [0.22, 0.73], eat: [0.28, 0.72],
  eating: [0.29, 0.73], hungry: [0.30, 0.68],
  // Emotions cluster
  happy: [0.50, 0.25], sad: [0.55, 0.20], angry: [0.58, 0.28],
  excited: [0.48, 0.22], love: [0.45, 0.18], hate: [0.60, 0.30],
  // Tech cluster
  computer: [0.15, 0.30], code: [0.18, 0.25], software: [0.12, 0.28],
  program: [0.20, 0.32], data: [0.14, 0.35], model: [0.16, 0.38],
  // Size/quantity
  big: [0.40, 0.50], small: [0.42, 0.55], large: [0.38, 0.48],
  tiny: [0.44, 0.58], huge: [0.36, 0.46],
  // Common words
  the: [0.50, 0.50], a: [0.52, 0.52], is: [0.48, 0.48],
  are: [0.47, 0.47], was: [0.49, 0.46], hello: [0.55, 0.40],
  world: [0.40, 0.42], hi: [0.56, 0.41],
  // People
  king: [0.72, 0.30], queen: [0.70, 0.25], man: [0.68, 0.35],
  woman: [0.66, 0.28], boy: [0.65, 0.38], girl: [0.63, 0.32],
  // Actions
  run: [0.35, 0.60], walk: [0.33, 0.62], jump: [0.37, 0.58],
  read: [0.30, 0.40], write: [0.28, 0.42], think: [0.32, 0.38],
  // AI/LLM relevant
  token: [0.10, 0.40], attention: [0.12, 0.42], transformer: [0.08, 0.38],
  embedding: [0.11, 0.36], neural: [0.13, 0.34], network: [0.15, 0.33],
};

function getEmbedding(token: string): [number, number] {
  const lower = token.toLowerCase();
  if (KNOWN_EMBEDDINGS[lower]) return KNOWN_EMBEDDINGS[lower];
  // Generate deterministic position from hash
  let h1 = 0, h2 = 0;
  for (let i = 0; i < lower.length; i++) {
    h1 = ((h1 << 3) + lower.charCodeAt(i) * 7) & 0xffff;
    h2 = ((h2 << 5) + lower.charCodeAt(i) * 13) & 0xffff;
  }
  return [(h1 % 800) / 1000 + 0.1, (h2 % 800) / 1000 + 0.1];
}

/* ─────────────────────────────────────────────
   Token colors
   ───────────────────────────────────────────── */

const TOKEN_COLORS = [
  "#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6",
  "#EC4899", "#06B6D4", "#F97316", "#6366F1", "#14B8A6",
  "#E11D48", "#84CC16", "#0EA5E9", "#D946EF", "#FB923C",
];

/* ─────────────────────────────────────────────
   Layer 1: STORY
   ───────────────────────────────────────────── */

function StoryLayer() {
  return (
    <section className="mb-16">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-xs font-semibold tracking-widest uppercase text-gray-400">
          The Story
        </span>
        <span className="text-xs text-gray-300">~30 seconds</span>
      </div>

      <div className="space-y-6 text-lg leading-relaxed text-gray-700">
        <p className="text-2xl font-semibold text-gray-900 leading-snug">
          You type &ldquo;hello&rdquo; into ChatGPT.
          <br />
          The computer sees <code className="bg-gray-100 px-2 py-0.5 rounded text-blue-600 font-mono text-xl">15496</code>.
        </p>

        <p>
          That&rsquo;s the fundamental gap between humans and machines. We think in words.
          Computers think in numbers. Every conversation you&rsquo;ve ever had with an AI
          started with this translation: your words became numbers, and the AI&rsquo;s
          numbers became words back.
        </p>

        <p>
          But it&rsquo;s not just about converting words to random IDs. The real magic is
          in <em>how</em> those numbers are arranged. In the right system, the number for
          &ldquo;king&rdquo; minus the number for &ldquo;man&rdquo; plus the number for
          &ldquo;woman&rdquo; equals... &ldquo;queen.&rdquo;
        </p>

        <p className="text-base text-gray-500 italic">
          Words become coordinates on a map. And on that map, meaning has a shape.
        </p>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Layer 2: JOURNEY
   ───────────────────────────────────────────── */

function JourneyLayer() {
  const [step, setStep] = useState(0);

  const sentence = "A cute teddy bear is reading";
  const journeyTokens = ["A", "cute", "teddy", "bear", "is", "read", "ing"];
  const tokenIds = journeyTokens.map(tokenToId);

  const embeddings: [number, number][] = [
    [0.52, 0.52], // A
    [0.85, 0.72], // cute (near soft/teddy)
    [0.83, 0.70], // teddy
    [0.78, 0.68], // bear
    [0.48, 0.48], // is
    [0.30, 0.40], // read
    [0.32, 0.42], // ing
  ];

  const steps = [
    {
      title: "Your sentence",
      description: "You type this into ChatGPT. But the model can't read English. It needs to break this down.",
    },
    {
      title: "Step 1: Tokenization",
      description: "The sentence is split into tokens. Notice \"reading\" becomes \"read\" + \"ing\" — the model breaks words into reusable pieces, like LEGO bricks.",
    },
    {
      title: "Step 2: Token IDs",
      description: "Each token gets a number from the vocabulary — like looking up a word in a dictionary and noting its page number. These IDs are arbitrary; they carry no meaning yet.",
    },
    {
      title: "Step 3: Embeddings",
      description: "Now the magic happens. Each token ID is converted into a coordinate — a position in \"meaning space.\" Notice how \"cute,\" \"teddy,\" and \"bear\" cluster together, while \"read\" is in a completely different neighborhood.",
    },
  ];

  return (
    <section className="mb-16">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-xs font-semibold tracking-widest uppercase text-gray-400">
          The Journey
        </span>
        <span className="text-xs text-gray-300">~2 minutes</span>
      </div>

      {/* Step indicator */}
      <div className="flex gap-2 mb-8">
        {steps.map((_, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === step ? "w-12 bg-gray-900" : i < step ? "w-6 bg-gray-400" : "w-6 bg-gray-200"
            }`}
          />
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {steps[step].title}
        </h3>
        <p className="text-gray-600 mb-8 leading-relaxed">
          {steps[step].description}
        </p>

        {/* Step 0: Raw sentence */}
        {step === 0 && (
          <div className="flex items-center justify-center py-8">
            <div className="bg-gray-50 rounded-xl px-8 py-6 border border-gray-200">
              <p className="text-2xl font-medium text-gray-900 tracking-wide">
                {sentence}
              </p>
            </div>
          </div>
        )}

        {/* Step 1: Tokenized */}
        {step === 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 py-8">
            {journeyTokens.map((t, i) => (
              <span
                key={i}
                className="px-4 py-2 rounded-lg text-white font-mono text-lg font-medium"
                style={{ background: TOKEN_COLORS[i % TOKEN_COLORS.length] }}
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Step 2: Token IDs */}
        {step === 2 && (
          <div className="flex flex-wrap items-center justify-center gap-3 py-8">
            {journeyTokens.map((t, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span
                  className="px-3 py-1.5 rounded-lg text-white font-mono text-sm font-medium"
                  style={{ background: TOKEN_COLORS[i % TOKEN_COLORS.length] }}
                >
                  {t}
                </span>
                <svg className="w-4 h-4 text-gray-300" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3v10M5 10l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="font-mono text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded">
                  {tokenIds[i]}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Step 3: Embeddings scatter */}
        {step === 3 && (
          <div className="py-4">
            <div className="relative w-full aspect-square max-w-md mx-auto bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
              {/* Axis labels */}
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-gray-400">
                Dimension 1
              </span>
              <span className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] text-gray-400">
                Dimension 2
              </span>
              {/* Grid */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                {[20, 40, 60, 80].map((v) => (
                  <g key={v}>
                    <line x1={v} y1={5} x2={v} y2={95} stroke="#E5E7EB" strokeWidth="0.3" />
                    <line x1={5} y1={v} x2={95} y2={v} stroke="#E5E7EB" strokeWidth="0.3" />
                  </g>
                ))}
              </svg>
              {/* Points */}
              {embeddings.map(([x, y], i) => {
                const px = x * 80 + 10; // scale to 10-90 range
                const py = (1 - y) * 80 + 10;
                return (
                  <div
                    key={i}
                    className="absolute flex flex-col items-center"
                    style={{
                      left: `${px}%`,
                      top: `${py}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <div
                      className="w-3 h-3 rounded-full shadow-sm"
                      style={{ background: TOKEN_COLORS[i % TOKEN_COLORS.length] }}
                    />
                    <span
                      className="text-[11px] font-mono font-medium mt-0.5"
                      style={{ color: TOKEN_COLORS[i % TOKEN_COLORS.length] }}
                    >
                      {journeyTokens[i]}
                    </span>
                  </div>
                );
              })}
              {/* Cluster labels */}
              <div className="absolute text-[10px] text-gray-400 italic" style={{ left: "75%", top: "15%" }}>
                descriptive words
              </div>
              <div className="absolute text-[10px] text-gray-400 italic" style={{ left: "15%", top: "55%" }}>
                action words
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => setStep(Math.min(steps.length - 1, step + 1))}
          disabled={step === steps.length - 1}
          className="px-5 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Layer 3: PLAYGROUND
   ───────────────────────────────────────────── */

function PlaygroundLayer() {
  const [input, setInput] = useState("The king and queen walked to the castle");
  const [tokens, setTokens] = useState<string[]>(() => tokenize("The king and queen walked to the castle"));
  const [hoveredToken, setHoveredToken] = useState<number | null>(null);

  const handleInput = useCallback((value: string) => {
    setInput(value);
    setTokens(tokenize(value));
    setHoveredToken(null);
  }, []);

  const embeddingPoints = tokens
    .filter((t) => !/^[^\w]+$/.test(t))
    .map((t) => ({ token: t, pos: getEmbedding(t), id: tokenToId(t) }));

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-xs font-semibold tracking-widest uppercase text-gray-400">
          The Playground
        </span>
        <span className="text-xs text-gray-300">explore freely</span>
      </div>

      <div className="space-y-6">
        {/* Input */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Type anything — watch it become numbers
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => handleInput(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all"
            placeholder="Try: The cat sat on the mat"
          />

          {/* Suggestions */}
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              "The cat sat on the mat",
              "King minus man plus woman equals queen",
              "I love eating pizza and pasta",
              "The neural network learned to code",
            ].map((s) => (
              <button
                key={s}
                onClick={() => handleInput(s)}
                className="text-xs px-3 py-1 rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors border border-gray-100"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Tokens display */}
        {tokens.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h4 className="text-sm font-medium text-gray-500 mb-4">
              Tokens ({tokens.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {tokens.map((t, i) => (
                <button
                  key={`${t}-${i}`}
                  onMouseEnter={() => setHoveredToken(i)}
                  onMouseLeave={() => setHoveredToken(null)}
                  className="group relative px-3 py-1.5 rounded-lg text-white font-mono text-sm font-medium transition-transform hover:scale-105"
                  style={{ background: TOKEN_COLORS[i % TOKEN_COLORS.length] }}
                >
                  {t}
                  {hoveredToken === i && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      ID: {tokenToId(t)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Embedding space */}
        {embeddingPoints.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h4 className="text-sm font-medium text-gray-500 mb-2">
              Embedding Space
            </h4>
            <p className="text-xs text-gray-400 mb-4">
              Each word is placed on a map based on its meaning. Words that are used in
              similar contexts end up near each other. Hover over a point to see which
              token it represents.
            </p>

            <div className="relative w-full aspect-[4/3] bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
              {/* Grid */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 75">
                {[20, 40, 60, 80].map((v) => (
                  <g key={v}>
                    <line x1={v} y1={2} x2={v} y2={73} stroke="#E5E7EB" strokeWidth="0.2" />
                  </g>
                ))}
                {[15, 30, 45, 60].map((v) => (
                  <g key={v}>
                    <line x1={2} y1={v} x2={98} y2={v} stroke="#E5E7EB" strokeWidth="0.2" />
                  </g>
                ))}
              </svg>

              {/* Points */}
              {embeddingPoints.map((pt, i) => {
                const px = pt.pos[0] * 80 + 10;
                const py = (1 - pt.pos[1]) * 60 + 7.5;
                const tokenIdx = tokens.indexOf(pt.token);
                const isHovered = hoveredToken !== null && tokens[hoveredToken] === pt.token;
                return (
                  <div
                    key={`${pt.token}-${i}`}
                    className="absolute flex flex-col items-center transition-all duration-200"
                    style={{
                      left: `${px}%`,
                      top: `${py}%`,
                      transform: `translate(-50%, -50%) scale(${isHovered ? 1.5 : 1})`,
                      zIndex: isHovered ? 10 : 1,
                    }}
                    onMouseEnter={() => setHoveredToken(tokenIdx >= 0 ? tokenIdx : null)}
                    onMouseLeave={() => setHoveredToken(null)}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full shadow-sm transition-all"
                      style={{
                        background: TOKEN_COLORS[(tokenIdx >= 0 ? tokenIdx : i) % TOKEN_COLORS.length],
                        opacity: isHovered ? 1 : 0.8,
                      }}
                    />
                    <span
                      className="text-[10px] font-mono font-medium mt-0.5 transition-opacity"
                      style={{
                        color: TOKEN_COLORS[(tokenIdx >= 0 ? tokenIdx : i) % TOKEN_COLORS.length],
                        opacity: isHovered ? 1 : 0.6,
                      }}
                    >
                      {pt.token}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-gray-400 mt-4 italic">
              Try typing words from the same category (e.g., &ldquo;cat dog kitten puppy&rdquo;)
              and watch them cluster together. Then add unrelated words and see where they land.
            </p>
          </div>
        )}

        {/* Insight callout */}
        <div className="bg-gray-900 text-white rounded-2xl p-6">
          <p className="text-sm font-medium text-gray-300 uppercase tracking-widest mb-2">
            The insight
          </p>
          <p className="text-lg leading-relaxed">
            This is how every LLM starts processing your message. Before any &ldquo;intelligence&rdquo;
            happens — before attention, before reasoning, before generating a response — your
            words are converted into coordinates in a high-dimensional space where meaning has
            geometry. &ldquo;King&rdquo; is to &ldquo;queen&rdquo; as &ldquo;man&rdquo; is to
            &ldquo;woman&rdquo; — not because someone programmed that, but because those words
            appear in similar patterns across billions of sentences.
          </p>
          <p className="text-sm text-gray-400 mt-4">
            Next: How does the model decide which words to pay attention to?
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Full Concept 1 Component
   ───────────────────────────────────────────── */

export function Concept1TextAsNumbers() {
  return (
    <div className="py-12">
      {/* Concept header */}
      <div className="mb-12">
        <span className="text-sm font-medium text-blue-600 mb-2 block">
          Concept 1 of 9
        </span>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
          Text as Numbers
        </h2>
        <p className="text-lg text-gray-500 mt-2">
          How computers read your words
        </p>
      </div>

      <StoryLayer />
      <JourneyLayer />
      <PlaygroundLayer />
    </div>
  );
}
