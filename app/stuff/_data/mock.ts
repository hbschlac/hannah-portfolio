// Front-end-only mock data for the "Stuff" read-it-later mockup.
// No backend — this seeds local state. Replaced by KV in Phase 2.

export type ItemType = "article" | "video" | "podcast";
export type ItemStatus = "inbox" | "read" | "saved";

export type StuffItem = {
  id: string;
  url: string;
  title: string;
  source: string; // domain or publication
  type: ItemType;
  image?: string; // preview image (og:image)
  summary: string; // AI-generated summary
  length: string; // "6 min read" / "22 min" / "48 min"
  savedAt: string; // ISO date
  via: "share" | "email" | "paste";
  status: ItemStatus;
};

export type Note = {
  id: string;
  title: string;
  body: string;
  updatedAt: string; // ISO date
  linkedItemIds: string[]; // references into StuffItem.id
};

export const MOCK_ITEMS: StuffItem[] = [
  {
    id: "i1",
    url: "https://stratechery.com/2026/the-shape-of-ai-product-work/",
    title: "The Shape of AI Product Work",
    source: "stratechery.com",
    type: "article",
    image:
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80",
    summary:
      "Ben argues the PM role is splitting in two: people who curate model behavior and people who own the surrounding product surface. The teams that win treat eval design as a core PM craft.",
    length: "8 min read",
    savedAt: "2026-05-28T09:12:00.000Z",
    via: "share",
    status: "inbox",
  },
  {
    id: "i2",
    url: "https://www.lennysnewsletter.com/p/building-0-to-1-inside-big-companies",
    title: "Building 0→1 Products Inside Big Companies",
    source: "lennysnewsletter.com",
    type: "article",
    image:
      "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&q=80",
    summary:
      "A playbook for incubating new products without the startup's freedom: secure air cover from a VP, ship an embarrassing v1 to one real customer, and keep the team under seven people.",
    length: "11 min read",
    savedAt: "2026-05-27T20:40:00.000Z",
    via: "email",
    status: "inbox",
  },
  {
    id: "i3",
    url: "https://www.youtube.com/watch?v=notion-scale-talk",
    title: "How Notion Thinks About Scaling a Product Org",
    source: "youtube.com",
    type: "video",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    summary:
      "Notion's CPO walks through the moment they moved from one roadmap to pods, and why they killed quarterly planning in favor of rolling six-week bets.",
    length: "22 min",
    savedAt: "2026-05-27T14:05:00.000Z",
    via: "share",
    status: "inbox",
  },
  {
    id: "i4",
    url: "https://overcast.fm/+lenny-pod-pricing",
    title: "Pricing & Packaging for AI Products (Lenny's Podcast)",
    source: "overcast.fm",
    type: "podcast",
    image:
      "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&q=80",
    summary:
      "Madhavan Ramanujam on why usage-based pricing breaks down for AI features, and the 'value metric' test he uses to decide what to charge for.",
    length: "48 min",
    savedAt: "2026-05-26T22:18:00.000Z",
    via: "email",
    status: "inbox",
  },
  {
    id: "i5",
    url: "https://www.figma.com/blog/design-systems-at-scale/",
    title: "What We Learned Running a Design System at Scale",
    source: "figma.com",
    type: "article",
    image:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
    summary:
      "The hidden cost of a design system isn't building components, it's the governance: who approves changes, how teams migrate, and when to let a one-off live.",
    length: "6 min read",
    savedAt: "2026-05-26T11:30:00.000Z",
    via: "share",
    status: "inbox",
  },
  {
    id: "i6",
    url: "https://review.firstround.com/the-pm-interview-loop-that-actually-works/",
    title: "The PM Interview Loop That Actually Works",
    source: "review.firstround.com",
    type: "article",
    image:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80",
    summary:
      "First Round breaks down a take-home-free PM loop built around a single realistic product critique, scored on judgment rather than framework recall.",
    length: "9 min read",
    savedAt: "2026-05-25T18:02:00.000Z",
    via: "paste",
    status: "inbox",
  },
  // Already-processed items so History isn't empty in the mockup.
  {
    id: "i7",
    url: "https://www.nngroup.com/articles/ai-onboarding-patterns/",
    title: "Onboarding Patterns for AI Features",
    source: "nngroup.com",
    type: "article",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    summary:
      "NN/g catalogs how the best apps teach users to trust an AI feature: progressive disclosure, visible confidence, and an obvious escape hatch.",
    length: "7 min read",
    savedAt: "2026-05-22T08:15:00.000Z",
    via: "email",
    status: "read",
  },
  {
    id: "i8",
    url: "https://a16z.com/the-economics-of-inference/",
    title: "The Economics of Inference",
    source: "a16z.com",
    type: "article",
    image:
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80",
    summary:
      "A breakdown of where the cost actually sits in an AI product's unit economics, and why caching and routing matter more than raw model price.",
    length: "10 min read",
    savedAt: "2026-05-20T19:44:00.000Z",
    via: "share",
    status: "saved",
  },
];

export const MOCK_NOTES: Note[] = [
  {
    id: "n1",
    title: "Thoughts on the AI PM role split",
    body:
      "The eval-design-as-PM-craft idea keeps coming up. If the role really splits into model-curation vs product-surface, my eval work is the more defensible half. Worth framing my next case study around an eval loop I owned end to end.",
    updatedAt: "2026-05-28T09:30:00.000Z",
    linkedItemIds: ["i1"],
  },
  {
    id: "n2",
    title: "Reading queue — strategy week",
    body:
      "Pulling together a strategy reading block for the week. Goal: get sharper on pricing and org scaling before the next round of interviews. Skim the Notion org talk first, then the pricing pod on a walk.",
    updatedAt: "2026-05-27T21:10:00.000Z",
    linkedItemIds: ["i3", "i4"],
  },
];
