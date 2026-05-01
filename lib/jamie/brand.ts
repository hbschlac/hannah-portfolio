// Jamie's Bach 2026 brand tokens
// Gen Z forward · Newport-grounded · sunset palette · sticker collage energy

export const colors = {
  cream: "#FFF8EC",
  coral: "#FF6B6B",
  tangerine: "#FF9E58",
  butter: "#FFD16A",
  lime: "#C8E85A",
  lavender: "#B8A4DD",
  navy: "#1F2A44",
  navySoft: "#2D3A55",
} as const;

export const sunsetGradient =
  "linear-gradient(135deg, #FF6B6B 0%, #FF9E58 50%, #FFD16A 100%)";

export const fonts = {
  display: '"Fraunces", "Playfair Display", Georgia, serif',
  body: '"Inter", system-ui, -apple-system, sans-serif',
  script: '"Caveat", "Homemade Apple", cursive',
  mono: '"JetBrains Mono", ui-monospace, monospace',
} as const;

// Per-attendee accent colors (for face circles, room chips, flight pills)
export const attendeeColorTokens = [
  "coral",
  "tangerine",
  "butter",
  "lime",
  "lavender",
  "navySoft",
  "coral",
  "tangerine",
  "lime",
] as const;

// Bold flat sticker shadow
export const stickerShadow = "4px 4px 0 #1F2A44";
export const stickerShadowSoft = "3px 3px 0 rgba(31,42,68,0.6)";

// Common card style helper
export const cardBase = {
  background: colors.cream,
  border: `3px solid ${colors.navy}`,
  boxShadow: stickerShadow,
  borderRadius: "14px",
} as const;
