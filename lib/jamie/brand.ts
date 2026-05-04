// Jamie's Bach 2026 brand tokens
// Gen Z forward · East Coast sail · Newport harbor · regatta stripes
// (Token names kept stable; hex values shifted from tropical sunset to coastal navy.)

export const colors = {
  cream: "#FDF8EE",        // sailcloth — slightly warmer than pure white
  coral: "#D5453A",        // Nantucket red — primary pop
  tangerine: "#5B9BD5",    // marina blue — secondary pop
  butter: "#C8A24B",       // brass — warm accent
  lime: "#7FA88B",         // sea sage — "live" / fresh indicator
  lavender: "#B8A4DD",     // dusk — kept for evening sections
  navy: "#1B3A5C",         // harbor navy — primary anchor
  navySoft: "#3A5878",     // softer navy for body text
} as const;

// Renamed semantically but variable kept stable.
// Navy → marina blue → cream. Reads "harbor at golden hour" not "tropical sunset."
export const sunsetGradient =
  "linear-gradient(135deg, #1B3A5C 0%, #5B9BD5 65%, #FDF8EE 100%)";

// Regatta stripe band — for hero accents + section dividers.
export const regattaStripes =
  "repeating-linear-gradient(90deg, #1B3A5C 0 14px, #FDF8EE 14px 22px, #D5453A 22px 28px, #FDF8EE 28px 36px)";

export const fonts = {
  display: '"Fraunces", "Playfair Display", Georgia, serif',
  body: '"Inter", system-ui, -apple-system, sans-serif',
  script: '"Caveat", "Homemade Apple", cursive',
  mono: '"JetBrains Mono", ui-monospace, monospace',
} as const;

// Per-attendee accent colors (face circles, room chips, flight pills)
// Mapped to nautical palette
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
export const stickerShadow = "4px 4px 0 #1B3A5C";
export const stickerShadowSoft = "3px 3px 0 rgba(27,58,92,0.55)";

// Common card style helper
export const cardBase = {
  background: colors.cream,
  border: `3px solid ${colors.navy}`,
  boxShadow: stickerShadow,
  borderRadius: "14px",
} as const;
