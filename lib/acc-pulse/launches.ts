import type { JourneyStage } from "./types";

export interface Launch {
  id: string;
  date: string; // YYYY-MM
  title: string;
  shortTitle: string;
  scale: string;
  summary: string;
  stagesTouched: JourneyStage[];
  sourceUrl: string;
  sourceName: string;
}

/**
 * Public Walmart ACC + Sam's Club T&BC launches in the Oct 2024 – Apr 2026
 * window. Sourced from corporate.walmart.com, Axios, Chain Store Age, and
 * Progressive Grocer. Each entry links to the primary source.
 */
export const LAUNCHES: Launch[] = [
  {
    id: "marketplace-tire-install",
    date: "2024-04",
    title: "Marketplace → ACC omnichannel tire install",
    shortTitle: "Marketplace tire install",
    scale: "2,300 ACCs · ~40,000 marketplace offers · +12K SKUs",
    summary:
      "Customer buys any third-party Marketplace tire and installs at their local ACC in the same visit — competitive shot at Tire Rack / eBay Motors.",
    stagesTouched: ["discover", "schedule"],
    sourceUrl:
      "https://chainstoreage.com/walmart-launches-omnichannel-tire-service-third-party-sales",
    sourceName: "Chain Store Age",
  },
  {
    id: "grapevine-club-of-future",
    date: "2024-12",
    title: "Sam's Grapevine — Club of the Future",
    shortTitle: "Grapevine Club of the Future",
    scale: "1 location (Grapevine, TX) as blueprint",
    summary:
      "Fully-digital club including a vertical tire carousel in the tire center — automates tire retrieval, frees associates for member-facing work.",
    stagesTouched: ["service"],
    sourceUrl:
      "https://corporate.walmart.com/about/samsclub/news/2024/12/12/grapevines-first-of-its-kind-club-offers-a-glimpse-into-the-future-of-sams-club",
    sourceName: "Walmart Corporate",
  },
  {
    id: "sams-growth-strategy",
    date: "2025-04",
    title: "Sam's Club 2025 growth strategy",
    shortTitle: "Sam's chain-wide remodel",
    scale: "All ~600 clubs to remodel · 30 new in 2025",
    summary:
      "Scales the Grapevine tire-center blueprint chain-wide (vertical carousels, automated forklifts). Part of a \"double membership in 8–10 years\" goal.",
    stagesTouched: ["service"],
    sourceUrl:
      "https://corporate.walmart.com/about/samsclub/news/2025/04/11/sams-club-unveils-ambitious-growth-strategy-at-2025-investment-community-meeting",
    sourceName: "Walmart Corporate",
  },
  {
    id: "acc-of-the-future",
    date: "2025-10",
    title: "ACC of the Future pilot",
    shortTitle: "ACC of the Future",
    scale: "10 locations (Fayetteville AR, TX, GA, WV, OH, PA) — 0.4% of ACCs",
    summary:
      "Smart key lockers, contactless check-in, live service tracking in the Walmart app. Tire installs only at launch, expanding to oil + battery.",
    stagesTouched: ["schedule", "checkin", "service", "pickup"],
    sourceUrl:
      "https://corporate.walmart.com/news/2025/10/09/drive-into-the-future-the-evolution-of-auto-care",
    sourceName: "Walmart Corporate",
  },
  {
    id: "hours-saved-disclosure",
    date: "2025-10",
    title: "6.6M hours saved disclosure",
    shortTitle: "6.6M hours saved",
    scale: "All 2,582 ACCs — two-year cumulative",
    summary:
      "First time Walmart publicly quantified the ROI of digital scheduling via Virtual Garage and app booking.",
    stagesTouched: ["schedule"],
    sourceUrl:
      "https://corporate.walmart.com/news/2025/10/09/drive-into-the-future-the-evolution-of-auto-care",
    sourceName: "Walmart Corporate",
  },
];
