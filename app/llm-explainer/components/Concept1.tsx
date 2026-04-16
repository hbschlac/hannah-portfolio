"use client";

import { useState, useCallback, useMemo } from "react";
import { Whisper } from "./Whisper";

/* ─────────────────────────────────────────────
   Tokenizer logic (simplified BPE-like)
   ───────────────────────────────────────────── */

function tokenize(text: string): string[] {
  if (!text.trim()) return [];
  const words = text.match(/\S+|\s+/g) || [];
  const tokens: string[] = [];
  for (const w of words) {
    if (/^\s+$/.test(w)) continue;
    const lower = w.toLowerCase().replace(/[^\w']/g, "");
    const punct = w.replace(/[\w']/g, "");
    if (lower.length > 0) tokens.push(...splitSubword(lower));
    if (punct) tokens.push(punct);
  }
  return tokens;
}

function splitSubword(word: string): string[] {
  const prefixes = ["un", "re", "pre", "dis", "mis", "over", "under", "out"];
  const suffixes = ["ing", "tion", "sion", "ment", "ness", "able", "ible", "ful", "less", "ous", "ive", "ly", "er", "est", "ed", "es", "al", "ize"];
  if (word.length <= 4) return [word];
  for (const pre of prefixes) {
    if (word.startsWith(pre) && word.length > pre.length + 2) {
      return [pre, ...splitSubword(word.slice(pre.length))];
    }
  }
  for (const suf of suffixes) {
    if (word.endsWith(suf) && word.length > suf.length + 2) {
      return [word.slice(0, -suf.length), suf];
    }
  }
  return [word];
}

function tokenToId(token: string): number {
  let hash = 0;
  for (let i = 0; i < token.length; i++) {
    hash = ((hash << 5) - hash + token.charCodeAt(i)) & 0xffff;
  }
  return 256 + (hash % 49744);
}

/* ─────────────────────────────────────────────
   Embeddings
   ───────────────────────────────────────────── */

const KNOWN_EMBEDDINGS: Record<string, [number, number]> = {
  cat: [0.82, 0.75], dog: [0.78, 0.80], kitten: [0.85, 0.72],
  puppy: [0.75, 0.83], bird: [0.70, 0.68], fish: [0.65, 0.60],
  pizza: [0.20, 0.75], burger: [0.25, 0.80], pasta: [0.18, 0.70],
  sushi: [0.22, 0.68], food: [0.22, 0.73], eat: [0.28, 0.72],
  eating: [0.29, 0.73], hungry: [0.30, 0.68],
  happy: [0.50, 0.25], sad: [0.55, 0.20], angry: [0.58, 0.28],
  excited: [0.48, 0.22], love: [0.45, 0.18], hate: [0.60, 0.30],
  computer: [0.15, 0.30], code: [0.18, 0.25], software: [0.12, 0.28],
  program: [0.20, 0.32], data: [0.14, 0.35], model: [0.16, 0.38],
  big: [0.40, 0.50], small: [0.42, 0.55], large: [0.38, 0.48],
  tiny: [0.44, 0.58], huge: [0.36, 0.46],
  the: [0.50, 0.50], a: [0.52, 0.52], is: [0.48, 0.48],
  are: [0.47, 0.47], was: [0.49, 0.46], hello: [0.55, 0.40],
  world: [0.40, 0.42], hi: [0.56, 0.41], and: [0.51, 0.49],
  to: [0.49, 0.51], of: [0.50, 0.49],
  king: [0.72, 0.30], queen: [0.70, 0.25], man: [0.68, 0.35],
  woman: [0.66, 0.28], boy: [0.65, 0.38], girl: [0.63, 0.32],
  run: [0.35, 0.60], walk: [0.33, 0.62], jump: [0.37, 0.58],
  read: [0.30, 0.40], write: [0.28, 0.42], think: [0.32, 0.38],
  token: [0.10, 0.40], attention: [0.12, 0.42], transformer: [0.08, 0.38],
  embedding: [0.11, 0.36], neural: [0.13, 0.34], network: [0.15, 0.33],
  cute: [0.85, 0.72], teddy: [0.83, 0.70], bear: [0.78, 0.68],
  soft: [0.84, 0.71], plus: [0.50, 0.45], minus: [0.51, 0.44],
  equals: [0.49, 0.43],
};

function getEmbedding(token: string): [number, number] {
  const lower = token.toLowerCase();
  if (KNOWN_EMBEDDINGS[lower]) return KNOWN_EMBEDDINGS[lower];
  let h1 = 0, h2 = 0;
  for (let i = 0; i < lower.length; i++) {
    h1 = ((h1 << 3) + lower.charCodeAt(i) * 7) & 0xffff;
    h2 = ((h2 << 5) + lower.charCodeAt(i) * 13) & 0xffff;
  }
  return [(h1 % 800) / 1000 + 0.1, (h2 % 800) / 1000 + 0.1];
}

/* ─────────────────────────────────────────────
   Token colors & cluster detection
   ───────────────────────────────────────────── */

const TOKEN_COLORS = [
  "#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6",
  "#EC4899", "#06B6D4", "#F97316", "#6366F1", "#14B8A6",
  "#E11D48", "#84CC16", "#0EA5E9", "#D946EF", "#FB923C",
];

const CLUSTERS: Record<string, string[]> = {
  animals: ["cat", "dog", "kitten", "puppy", "bird", "fish", "bear"],
  food: ["pizza", "burger", "pasta", "sushi", "food", "eat", "eating", "hungry"],
  emotions: ["happy", "sad", "angry", "excited", "love", "hate"],
  royalty: ["king", "queen", "man", "woman", "boy", "girl"],
  tech: ["computer", "code", "software", "program", "data", "model", "token", "neural", "network", "attention", "transformer", "embedding"],
};

function detectInsight(tokens: string[]): { type: string; message: string; pairs?: [string, string][] } | null {
  const lowers = tokens.map((t) => t.toLowerCase());

  // Vector arithmetic
  if (lowers.includes("king") && lowers.includes("queen") && (lowers.includes("man") || lowers.includes("woman"))) {
    return {
      type: "arithmetic",
      message: "king \u2212 man + woman \u2248 queen. These analogies emerge naturally from how words co-occur in text.",
      pairs: [["king", "queen"], ["man", "woman"]],
    };
  }

  // Same-cluster detection
  for (const [name, words] of Object.entries(CLUSTERS)) {
    const matches = lowers.filter((t) => words.includes(t));
    if (matches.length >= 2) {
      const pairs: [string, string][] = [];
      for (let i = 0; i < matches.length - 1; i++) {
        pairs.push([matches[i], matches[i + 1]]);
      }
      const labels: Record<string, string> = {
        animals: "These words cluster together because they appear in similar contexts \u2014 sentences about pets, nature, and animals.",
        food: "Food words land near each other because they show up in the same kinds of sentences \u2014 recipes, reviews, conversations about meals.",
        emotions: "Emotion words cluster because they fill the same grammatical slots: \u201cI feel ___\u201d, \u201cshe was ___\u201d.",
        royalty: "These words are neighbors because they appear in similar stories, historical texts, and fairy tales.",
        tech: "Tech terms cluster because they co-occur in documentation, papers, and tutorials.",
      };
      return { type: "cluster", message: labels[name] || "These words cluster because they appear in similar contexts.", pairs };
    }
  }

  // Cross-cluster
  const foundClusters = new Set<string>();
  for (const t of lowers) {
    for (const [name, words] of Object.entries(CLUSTERS)) {
      if (words.includes(t)) foundClusters.add(name);
    }
  }
  if (foundClusters.size >= 2) {
    return { type: "separation", message: "See how meaning creates geography? Words from different categories land in different neighborhoods.", pairs: [] };
  }

  return null;
}

/* ─────────────────────────────────────────────
   Stage type
   ───────────────────────────────────────────── */

type Stage = "story" | "journey" | "playground";

/* ─────────────────────────────────────────────
   STORY STAGE
   ───────────────────────────────────────────── */

function StoryStage({ onNext }: { onNext: () => void }) {
  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-2xl space-y-8">
        <div className="space-y-2">
          <p className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
            You type &ldquo;hello&rdquo; into ChatGPT.
          </p>
          <p className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
            The computer sees{" "}
            <Whisper text="Token #15,496 in GPT-2's vocabulary of 50,257 tokens. The number is arbitrary — like a page number in a dictionary.">
              <span className="text-blue-600 font-mono cursor-help border-b-2 border-dotted border-blue-300">
                15496
              </span>
            </Whisper>
            .
          </p>
        </div>

        <p className="text-xl text-gray-500 leading-relaxed max-w-lg mx-auto">
          Every conversation you&rsquo;ve ever had with an AI started with this translation:
          your words became numbers, and the AI&rsquo;s numbers became words back.
        </p>

        <p className="text-lg text-gray-400 leading-relaxed max-w-md mx-auto">
          But it&rsquo;s not random. In the right system,{" "}
          <Whisper text="This is called word embedding arithmetic — it emerges from patterns in billions of sentences, not from anyone programming it.">
            <span className="border-b border-dotted border-gray-300 cursor-help">
              &ldquo;king&rdquo; minus &ldquo;man&rdquo; plus &ldquo;woman&rdquo; equals &ldquo;queen.&rdquo;
            </span>
          </Whisper>
        </p>

        <p className="text-base italic text-gray-400">
          Words become coordinates on a map. And on that map, meaning has a shape.
        </p>

        <button
          onClick={onNext}
          className="mt-8 px-8 py-4 bg-gray-900 text-white rounded-xl text-lg font-medium hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          See it happen &rarr;
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   JOURNEY STAGE
   ───────────────────────────────────────────── */

const JOURNEY_TOKENS = ["A", "cute", "teddy", "bear", "is", "read", "ing"];
const JOURNEY_IDS = JOURNEY_TOKENS.map(tokenToId);
const JOURNEY_EMBEDDINGS: [number, number][] = [
  [0.52, 0.52], [0.85, 0.72], [0.83, 0.70], [0.78, 0.68],
  [0.48, 0.48], [0.30, 0.40], [0.32, 0.42],
];

const TOKEN_WHISPERS: Record<string, string> = {
  A: "Common words like 'a' get their own token — they appear so often it's efficient to keep them whole.",
  cute: "Adjectives usually stay as single tokens unless they're very long or unusual.",
  teddy: "'Teddy' is common enough to be its own token. Rarer words would get split further.",
  bear: "The tokenizer doesn't know this is part of 'teddy bear' — it just sees individual pieces.",
  is: "Short, common verbs are almost always single tokens.",
  read: "'Reading' was split into 'read' + 'ing' — the model reuses 'read' across reading, reader, readable, etc.",
  ing: "This suffix appears in thousands of words. Reusing it keeps the vocabulary small (~50K tokens vs 500K+ words).",
};

const ID_WHISPERS: Record<number, string> = {};
JOURNEY_TOKENS.forEach((t, i) => {
  ID_WHISPERS[JOURNEY_IDS[i]] = `The model looked up "${t}" in its vocabulary table and found it at position ${JOURNEY_IDS[i]}. This number is arbitrary — it was assigned when the vocabulary was built.`;
});

function JourneyStage({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      intro: "Let\u2019s trace what happens to a real sentence.",
      title: "Your raw text",
      description: "You type this into ChatGPT. But the model can\u2019t read English \u2014 it needs to break this down into pieces it understands.",
    },
    {
      title: "Tokenization",
      description: (
        <>
          The sentence is split into{" "}
          <Whisper text="Tokens are the atomic units the model works with. Modern tokenizers use ~50,000 tokens — a middle ground between individual characters (~100) and whole words (~500,000+).">
            <span className="border-b border-dotted border-gray-400 cursor-help">tokens</span>
          </Whisper>
          . Notice &ldquo;reading&rdquo; becomes &ldquo;read&rdquo; + &ldquo;ing&rdquo; \u2014 like LEGO bricks the model can reuse across many words.
        </>
      ),
    },
    {
      title: "Token IDs",
      description: (
        <>
          Each token gets a number from the{" "}
          <Whisper text="The vocabulary is a fixed list of ~50,000 tokens built before training. Every token gets a permanent ID. Think of it as a phone book for word-pieces.">
            <span className="border-b border-dotted border-gray-400 cursor-help">vocabulary</span>
          </Whisper>
          . These IDs are like page numbers in a dictionary \u2014 they carry no meaning yet.
        </>
      ),
    },
    {
      title: "Embeddings",
      description: (
        <>
          Now the magic. Each ID becomes a{" "}
          <Whisper text="Real embeddings have 768-12,288 dimensions, not just 2. We're showing a simplified 2D projection so you can see the clusters.">
            <span className="border-b border-dotted border-gray-400 cursor-help">coordinate in meaning space</span>
          </Whisper>
          . Notice how &ldquo;cute,&rdquo; &ldquo;teddy,&rdquo; and &ldquo;bear&rdquo; cluster together, while &ldquo;read&rdquo; is in a different neighborhood.
        </>
      ),
    },
  ];

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-2xl">
        {/* Step indicator */}
        <div className="flex gap-2 mb-8 justify-center">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? "w-12 bg-gray-900" : i < step ? "w-6 bg-gray-400" : "w-6 bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Intro line (only on first step) */}
        {step === 0 && steps[0].intro && (
          <p className="text-center text-gray-400 text-sm mb-6">{steps[0].intro}</p>
        )}

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-8 shadow-sm min-h-[280px] md:min-h-[360px] flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {steps[step].title}
          </h3>
          <p className="text-gray-600 mb-8 leading-relaxed">
            {steps[step].description}
          </p>

          <div className="flex-1 flex items-center justify-center">
            {/* Step 0: Raw sentence */}
            {step === 0 && (
              <div className="bg-gray-50 rounded-xl px-4 py-4 md:px-8 md:py-6 border border-gray-200">
                <p className="text-lg md:text-2xl font-medium text-gray-900 tracking-wide">
                  A cute teddy bear is reading
                </p>
              </div>
            )}

            {/* Step 1: Tokenized */}
            {step === 1 && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                {JOURNEY_TOKENS.map((t, i) => (
                  <Whisper key={i} text={TOKEN_WHISPERS[t] || ""} position="bottom">
                    <span
                      className="px-4 py-2 rounded-lg text-white font-mono text-lg font-medium cursor-help border-b-2 border-transparent hover:border-white/50 transition-all"
                      style={{ background: TOKEN_COLORS[i % TOKEN_COLORS.length] }}
                    >
                      {t}
                    </span>
                  </Whisper>
                ))}
              </div>
            )}

            {/* Step 2: Token IDs */}
            {step === 2 && (
              <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
                {JOURNEY_TOKENS.map((t, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <Whisper text={TOKEN_WHISPERS[t] || ""}>
                      <span
                        className="px-3 py-1.5 rounded-lg text-white font-mono text-sm font-medium cursor-help"
                        style={{ background: TOKEN_COLORS[i % TOKEN_COLORS.length] }}
                      >
                        {t}
                      </span>
                    </Whisper>
                    <svg className="w-4 h-4 text-gray-300" viewBox="0 0 16 16" fill="none">
                      <path d="M8 3v10M5 10l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <Whisper text={ID_WHISPERS[JOURNEY_IDS[i]] || ""} position="bottom">
                      <span className="font-mono text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded cursor-help border-b border-dotted border-gray-300">
                        {JOURNEY_IDS[i]}
                      </span>
                    </Whisper>
                  </div>
                ))}
              </div>
            )}

            {/* Step 3: Embeddings scatter */}
            {step === 3 && (
              <div className="w-full">
                <div className="relative w-full aspect-square max-w-sm mx-auto bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                    {[20, 40, 60, 80].map((v) => (
                      <g key={v}>
                        <line x1={v} y1={5} x2={v} y2={95} stroke="#E5E7EB" strokeWidth="0.3" />
                        <line x1={5} y1={v} x2={95} y2={v} stroke="#E5E7EB" strokeWidth="0.3" />
                      </g>
                    ))}
                  </svg>
                  {JOURNEY_EMBEDDINGS.map(([x, y], i) => {
                    const px = x * 80 + 10;
                    const py = (1 - y) * 80 + 10;
                    return (
                      <div
                        key={i}
                        className="absolute"
                        style={{ left: `${px}%`, top: `${py}%`, transform: "translate(-50%, -50%)" }}
                      >
                        <Whisper
                          text={`"${JOURNEY_TOKENS[i]}" landed here because of the contexts it appeared in across billions of sentences. ${
                            i >= 1 && i <= 3
                              ? "It's near the other descriptive/object words."
                              : i >= 5
                              ? "Action words cluster in a different region."
                              : ""
                          }`}
                          position={py < 50 ? "bottom" : "top"}
                        >
                          <span className="flex flex-col items-center cursor-help">
                            <span
                              className="w-3.5 h-3.5 rounded-full shadow-sm hover:scale-150 transition-transform"
                              style={{ background: TOKEN_COLORS[i % TOKEN_COLORS.length] }}
                            />
                            <span
                              className="text-[11px] font-mono font-medium mt-0.5"
                              style={{ color: TOKEN_COLORS[i % TOKEN_COLORS.length] }}
                            >
                              {JOURNEY_TOKENS[i]}
                            </span>
                          </span>
                        </Whisper>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => (step === 0 ? onBack() : setStep(step - 1))}
            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            {step === 0 ? "\u2190 Back to story" : "Back"}
          </button>
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-5 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all"
            >
              Next
            </button>
          ) : (
            <button
              onClick={onNext}
              className="px-5 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all"
            >
              Now try it yourself &rarr;
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PLAYGROUND STAGE
   ───────────────────────────────────────────── */

function PlaygroundStage({ onBack }: { onBack: () => void }) {
  const [input, setInput] = useState("A cute teddy bear is reading");
  const [hoveredToken, setHoveredToken] = useState<number | null>(null);

  const tokens = useMemo(() => tokenize(input), [input]);
  const embeddingPoints = useMemo(
    () =>
      tokens
        .filter((t) => !/^[^\w]+$/.test(t))
        .map((t, i) => ({ token: t, pos: getEmbedding(t), id: tokenToId(t), idx: i })),
    [tokens]
  );
  const insight = useMemo(() => detectInsight(tokens), [tokens]);

  const handleInput = useCallback((value: string) => {
    setInput(value);
    setHoveredToken(null);
  }, []);

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-start md:justify-center px-4 md:px-6 py-8 md:py-12">
      <div className="w-full max-w-2xl space-y-6">
        {/* Intro */}
        <p className="text-center text-gray-400 text-sm">Now try it yourself.</p>

        {/* Input */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <input
            type="text"
            value={input}
            onChange={(e) => handleInput(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all"
            placeholder="Type anything..."
          />
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              "cat dog kitten puppy",
              "King minus man plus woman equals queen",
              "pizza burger pasta sushi",
              "happy sad angry excited",
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

        {/* Tokens */}
        {tokens.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <h4 className="text-sm font-medium text-gray-500">
                Tokens ({tokens.length})
              </h4>
              {tokens.length !== input.split(/\s+/).filter(Boolean).length && (
                <Whisper text="The tokenizer split some words into subwords. This is how the model handles rare or compound words — by reusing pieces it already knows.">
                  <span className="text-xs text-blue-500 cursor-help border-b border-dotted border-blue-300">
                    Why {tokens.length} tokens for {input.split(/\s+/).filter(Boolean).length} words?
                  </span>
                </Whisper>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {tokens.map((t, i) => (
                <Whisper key={`${t}-${i}`} text={`"${t}" → Token ID ${tokenToId(t)}. ${TOKEN_WHISPERS[t] || ""}`}>
                  <button
                    onMouseEnter={() => setHoveredToken(i)}
                    onMouseLeave={() => setHoveredToken(null)}
                    className="px-3 py-1.5 rounded-lg text-white font-mono text-sm font-medium transition-transform hover:scale-105 cursor-help"
                    style={{ background: TOKEN_COLORS[i % TOKEN_COLORS.length] }}
                  >
                    {t}
                  </button>
                </Whisper>
              ))}
            </div>
          </div>
        )}

        {/* Embedding space */}
        {embeddingPoints.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <h4 className="text-sm font-medium text-gray-500">Embedding Space</h4>
              <Whisper text="Each word is placed on a map based on its meaning. Words used in similar contexts end up near each other. Real models use 768+ dimensions — this is a 2D simplification.">
                <span className="text-xs text-gray-400 cursor-help border-b border-dotted border-gray-300">
                  What is this?
                </span>
              </Whisper>
            </div>

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

                {/* Connection lines for insights */}
                {insight?.pairs?.map(([a, b], i) => {
                  const ptA = embeddingPoints.find((p) => p.token.toLowerCase() === a);
                  const ptB = embeddingPoints.find((p) => p.token.toLowerCase() === b);
                  if (!ptA || !ptB) return null;
                  const x1 = ptA.pos[0] * 80 + 10;
                  const y1 = (1 - ptA.pos[1]) * 60 + 7.5;
                  const x2 = ptB.pos[0] * 80 + 10;
                  const y2 = (1 - ptB.pos[1]) * 60 + 7.5;
                  return (
                    <line
                      key={i}
                      x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke={insight.type === "arithmetic" ? "#3B82F6" : "#10B981"}
                      strokeWidth="0.4"
                      strokeDasharray={insight.type === "arithmetic" ? "1.5 1" : "1 1"}
                      opacity="0.6"
                    />
                  );
                })}
              </svg>

              {/* Points */}
              {embeddingPoints.map((pt, i) => {
                const px = pt.pos[0] * 80 + 10;
                const py = (1 - pt.pos[1]) * 60 + 7.5;
                const isHovered = hoveredToken === pt.idx;
                return (
                  <Whisper
                    key={`${pt.token}-${i}`}
                    text={`"${pt.token}" landed here based on the contexts it appeared in across billions of sentences.`}
                    position={py < 40 ? "bottom" : "top"}
                  >
                    <div
                      className="absolute flex flex-col items-center transition-all duration-200 cursor-help"
                      style={{
                        left: `${px}%`,
                        top: `${py}%`,
                        transform: `translate(-50%, -50%) scale(${isHovered ? 1.5 : 1})`,
                        zIndex: isHovered ? 10 : 1,
                      }}
                      onMouseEnter={() => setHoveredToken(pt.idx)}
                      onMouseLeave={() => setHoveredToken(null)}
                    >
                      <div
                        className="w-3 h-3 rounded-full shadow-sm transition-all"
                        style={{
                          background: TOKEN_COLORS[pt.idx % TOKEN_COLORS.length],
                          opacity: isHovered ? 1 : 0.8,
                        }}
                      />
                      <span
                        className="text-[10px] font-mono font-medium mt-0.5"
                        style={{
                          color: TOKEN_COLORS[pt.idx % TOKEN_COLORS.length],
                          opacity: isHovered ? 1 : 0.7,
                        }}
                      >
                        {pt.token}
                      </span>
                    </div>
                  </Whisper>
                );
              })}
            </div>

            {/* Insight callout */}
            {insight && (
              <div className="mt-4 px-4 py-3 rounded-xl bg-blue-50 border border-blue-100 text-sm text-blue-800 leading-relaxed transition-all">
                {insight.message}
              </div>
            )}

            {!insight && (
              <p className="text-xs text-gray-400 mt-4 italic">
                Try typing words from the same category (animals, food, emotions) and watch them cluster. Or try the &ldquo;king minus man&rdquo; suggestion above.
              </p>
            )}
          </div>
        )}

        {/* Connection callout */}
        <div className="bg-gray-900 text-white rounded-2xl p-8 text-center">
          <p className="text-lg leading-relaxed mb-2">
            You just did what ChatGPT does 100 billion times during training.
          </p>
          <p className="text-sm text-gray-400 leading-relaxed">
            Every word becomes a coordinate. Similar meanings become neighbors. This is Step 1 of how an LLM processes your message.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Next: how does the model decide which words to pay attention to?
          </p>
        </div>

        {/* Nav */}
        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            &larr; Back to walkthrough
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   FULL CONCEPT 1
   ───────────────────────────────────────────── */

export function Concept1TextAsNumbers() {
  const [stage, setStage] = useState<Stage>("story");

  return (
    <div className="relative">
      {/* Crossfade wrapper */}
      <div
        key={stage}
        className="animate-[fadeIn_0.4s_ease-out]"
        style={{ animation: "fadeIn 0.4s ease-out" }}
      >
        {stage === "story" && <StoryStage onNext={() => setStage("journey")} />}
        {stage === "journey" && (
          <JourneyStage
            onNext={() => setStage("playground")}
            onBack={() => setStage("story")}
          />
        )}
        {stage === "playground" && (
          <PlaygroundStage onBack={() => setStage("journey")} />
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
