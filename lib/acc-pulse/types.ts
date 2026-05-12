export type JourneyStage =
  | "discover"
  | "schedule"
  | "checkin"
  | "service"
  | "pickup"
  | "post_visit";

export type Brand = "walmart_acc" | "sams_club" | "costco" | "discount_tire";

export type Source =
  | "reddit"
  | "consumeraffairs"
  | "google"
  | "yelp"
  | "app_store"
  | "play_store"
  | "youtube";

export type Sentiment = "negative" | "positive" | "mixed";

export interface Quote {
  id: string;
  quote: string;
  source: Source;
  url: string;
  date?: string;
  stage: JourneyStage;
  brand: Brand;
  sentiment: Sentiment;
}

export interface StageMeta {
  id: JourneyStage;
  label: string;
  shortLabel: string;
  description: string;
  /** One-line friction hypothesis the data surfaces for this stage. */
  hypothesis: string;
}

export interface Experiment {
  id: string;
  stage: JourneyStage;
  title: string;
  hypothesis: string;
  signal: string[]; // quote ids that inspired it
  test: string;
  primaryMetric: string;
  secondaryMetrics: string[];
  guardrail: string;
}

export const STAGES: StageMeta[] = [
  {
    id: "discover",
    label: "Discover",
    shortLabel: "Discover",
    description: "Browsing tires, fitment, pricing on walmart.com, the Walmart app, or Sam's Club app.",
    hypothesis: "Shoppers can find a tire price, but they can't tell if their car will be serviced soon — fitment and store availability are decoupled.",
  },
  {
    id: "schedule",
    label: "Schedule",
    shortLabel: "Schedule",
    description: "Booking an appointment — picking service, time, and store.",
    hypothesis: "Appointment slots don't reflect real bay capacity, so a digital \"booking\" feels like a coin flip on arrival.",
  },
  {
    id: "checkin",
    label: "Check-in",
    shortLabel: "Check-in",
    description: "Arriving, handing off keys, setting expectations on wait and on what was agreed.",
    hypothesis: "The handoff from digital (booked/paid online) to in-store (technician with a clipboard) is where the promise breaks.",
  },
  {
    id: "service",
    label: "Service",
    shortLabel: "Service",
    description: "The work itself — communication during, and visibility into whether it was done right.",
    hypothesis: "Without proof-of-work, every visit is a trust gamble — and one bad story kills all future loyalty.",
  },
  {
    id: "pickup",
    label: "Pickup",
    shortLabel: "Pickup",
    description: "Paying, confirming the work, and walking out.",
    hypothesis: "Pickup is the last chance to repair trust — and the most common place the receipt disagrees with the promise.",
  },
  {
    id: "post_visit",
    label: "Post-visit",
    shortLabel: "Post-visit",
    description: "Warranty service, rotation reminders, returns, rebooking.",
    hypothesis: "Nobody comes back for the rotation they paid for — so the lifetime value of a tire sale leaks after day one.",
  },
];
