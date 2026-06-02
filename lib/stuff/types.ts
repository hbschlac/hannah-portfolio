// Types shared between the UI (under app/stuff) and the API (under app/api/stuff).

export type ItemType = "article" | "video" | "podcast";
export type ItemStatus = "inbox" | "read" | "saved";

export type StuffItem = {
  id: string;
  url: string;
  title: string;
  source: string;
  type: ItemType;
  image?: string;
  summary: string;
  length: string;
  savedAt: string; // ISO — when Hannah saved it
  publishedAt?: string; // ISO — when the article/video/episode was published
  via: "share" | "email" | "paste";
  status: ItemStatus;
};

export type Note = {
  id: string;
  title: string;
  body: string;
  updatedAt: string; // ISO
  linkedItemIds: string[];
};
