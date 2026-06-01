// Types + initial seed for the "Stuff" front-end app.
// Empty by default — the feed starts clean and fills as Hannah pastes URLs.
// (When the Phase 2 backend lands, this whole module is replaced by API fetches.)

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
  linkedItemIds: string[];
};

export const MOCK_ITEMS: StuffItem[] = [];
export const MOCK_NOTES: Note[] = [];
