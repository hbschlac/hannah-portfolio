// Type re-exports for back-compat with components that imported from here
// during the front-end mockup. Canonical types now live in lib/stuff/types,
// which the API also uses.
export type {
  ItemType,
  ItemStatus,
  StuffItem,
  Note,
} from "@/lib/stuff/types";
