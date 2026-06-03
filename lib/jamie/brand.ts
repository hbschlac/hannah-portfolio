// Jamie's Bach 2026 brand tokens — feminine bachelorette refresh
// Summery soft-white base · powder-blue accents ("something blue") · single coral pop
// NOTE: `brass` now holds the powder-blue accent (#7BA7CE). The name is kept only so the
// pages that read `colors.brass` for kickers/eyebrows/hairlines turn blue with no edits.

export const colors = {
  // Feminine palette — airy summery white base + light-blue accent
  paper: "#FAFBFC",       // soft summery white (was warm ecru #F7F3E9)
  ink: "#1A1A1A",         // body + headlines
  inkSoft: "#5C544A",     // captions, secondary
  coral: "#C8453A",       // single warm pop (sparingly)
  sky: "#7BA7CE",         // powder/cornflower blue — primary accent
  brass: "#7BA7CE",       // → sky (kept name for back-compat; drives all eyebrows/kickers/rules)
  mist: "#E4EAF1",        // cool blue-grey card dividers, hairlines

  // Back-compat aliases for old token names — let legacy code keep compiling.
  cream: "#FAFBFC",       // → paper
  navy: "#1A1A1A",        // → ink
  navySoft: "#5C544A",    // → inkSoft
  tangerine: "#7BA7CE",   // → sky
  butter: "#7BA7CE",      // → sky
  lime: "#E4EAF1",        // → mist
  lavender: "#E4EAF1",    // → mist
} as const;

export const fonts = {
  // Outfit — friendly rounded sans for display + headlines.
  // Body keeps Inter for paragraph copy.
  display: '"Outfit", "Inter", system-ui, -apple-system, sans-serif',
  body: '"Inter", system-ui, -apple-system, sans-serif',
  // Aliases kept (mapped to display/body) so legacy refs compile.
  script: '"Outfit", system-ui, sans-serif',
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
  color: "#7BA7CE",
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
