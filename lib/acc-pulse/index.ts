import { QUOTES, EXPERIMENTS } from "./data";
import { LAUNCHES } from "./launches";
import { STAGES } from "./types";
import type { Brand, JourneyStage, Quote, Source } from "./types";

export { QUOTES, EXPERIMENTS, LAUNCHES, STAGES };
export type { Launch } from "./launches";
export type { Brand, JourneyStage, Quote, Source };
export type { Experiment, Sentiment, StageMeta } from "./types";

export function quotesByStage(stage: JourneyStage, brand?: Brand): Quote[] {
  return QUOTES.filter((q) => q.stage === stage && (!brand || q.brand === brand));
}

export function walmartFrictionByStage() {
  const walmartBrands: Brand[] = ["walmart_acc", "sams_club"];
  const friction = QUOTES.filter(
    (q) => walmartBrands.includes(q.brand) && q.sentiment !== "positive",
  );
  const total = friction.length || 1;
  return STAGES.map((stage) => {
    const count = friction.filter((q) => q.stage === stage.id).length;
    return {
      ...stage,
      frictionCount: count,
      frictionShare: Math.round((count / total) * 100),
    };
  });
}

export function sourceBreakdown(): Record<Source, number> {
  const out: Record<Source, number> = {
    reddit: 0,
    consumeraffairs: 0,
    google: 0,
    yelp: 0,
    app_store: 0,
    play_store: 0,
    youtube: 0,
  };
  for (const q of QUOTES) {
    out[q.source] = (out[q.source] || 0) + 1;
  }
  return out;
}

export function walmartQuoteCount(): number {
  return QUOTES.filter((q) => q.brand === "walmart_acc" || q.brand === "sams_club").length;
}

export function benchmarkQuoteCount(): number {
  return QUOTES.filter((q) => q.brand === "costco" || q.brand === "discount_tire").length;
}

/** Human-friendly label for a journey stage — matches STAGES shortLabel. */
export function stageLabel(stage: JourneyStage): string {
  const s = STAGES.find((x) => x.id === stage);
  return s?.shortLabel ?? stage;
}
