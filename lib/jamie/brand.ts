// Jamie's Bach 2026 brand tokens — editorial reset
// Travel + Leisure / Condé Nast Traveler Newport feature
// Photo-led · serif headlines · single coral pop · brass hairlines

export const colors = {
  // Editorial palette — true off-white ecru base
  paper: "#F7F3E9",       // off-white ecru background (lighter than the prior #EFEAE0)
  ink: "#1A1A1A",         // body + headlines
  inkSoft: "#5C544A",     // captions, secondary
  coral: "#C8453A",       // single editorial pop (sparingly)
  brass: "#9B7B3F",       // rule lines, small accents
  mist: "#EAE2D2",        // card dividers, hairlines (bumped so they stay visible on lighter paper)

  // Back-compat aliases for old token names — let legacy code keep compiling.
  cream: "#F7F3E9",       // → paper
  navy: "#1A1A1A",        // → ink
  navySoft: "#5C544A",    // → inkSoft
  tangerine: "#9B7B3F",   // → brass
  butter: "#9B7B3F",      // → brass
  lime: "#EAE2D2",        // → mist
  lavender: "#EAE2D2",    // → mist
} as const;

export const fonts = {
  // Playfair Display — calmer, classic editorial serif (less wonky than Fraunces).
  display:
    '"Playfair Display", "Cormorant Garamond", Georgia, "Times New Roman", serif',
  body: '"Inter", system-ui, -apple-system, sans-serif',
  // Aliases kept (mapped to body) so legacy refs compile; we don't decorate with these anymore.
  script: '"Playfair Display", Georgia, serif',
  mono: '"Inter", system-ui, sans-serif',
} as const;

// Per-attendee accent — neutralized to brass for the editorial system.
// Faces are now portrait photographs, not colored circles, so this barely shows.
export const attendeeColorTokens = [
  "brass",
  "brass",
  "brass",
  "brass",
  "brass",
  "brass",
  "brass",
  "brass",
  "brass",
] as const;

// Editorial type scale (px)
export const type = {
  display: 56,
  h1: 40,
  h2: 28,
  h3: 20,
  body: 16,
  caption: 13,
  eyebrow: 11,
} as const;

// Eyebrow styling helper — small uppercase tracked tag
export const eyebrowStyle = {
  fontFamily: '"Inter", system-ui, sans-serif',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.18em",
  textTransform: "uppercase" as const,
  color: "#9B7B3F",
};

// Thin brass hairline (separator)
export const hairline = `1px solid ${colors.brass}`;
export const mistRule = `1px solid ${colors.mist}`;

// Legacy gradient + sticker exports REMOVED in editorial reset.
// Stubs kept (transparent / none) so any stray import doesn't crash a render.
export const sunsetGradient = "transparent";
export const regattaStripes = "transparent";
export const stickerShadow = "none";
export const stickerShadowSoft = "none";
export const cardBase = {
  background: colors.paper,
  border: `1px solid ${colors.mist}`,
  borderRadius: 0,
} as const;
