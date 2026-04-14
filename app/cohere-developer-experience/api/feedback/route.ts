import {
  getRawFeedback,
  getCuratedFeedback,
  THEME_KEYWORDS,
  getThemeById,
  type Vendor,
} from "@/lib/cohere-experience";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const themeId = searchParams.get("themeId");
  const vendorFilter = searchParams.get("vendor") as Vendor | null;

  if (!themeId) {
    return Response.json({ error: "themeId query parameter required" }, { status: 400 });
  }

  const theme = getThemeById(themeId);
  if (!theme) {
    return Response.json({ error: "Unknown themeId" }, { status: 404 });
  }

  const keywords = THEME_KEYWORDS[themeId] ?? [];
  if (keywords.length === 0) {
    return Response.json({ themeId, total: 0, items: [] });
  }

  let allFeedback = await getRawFeedback();
  if (allFeedback.length === 0) {
    allFeedback = getCuratedFeedback();
  }

  const items = allFeedback.filter((f) => {
    if (vendorFilter && f.vendor !== vendorFilter) return false;
    const lower = f.text.toLowerCase();
    return keywords.some((kw) => lower.includes(kw));
  });

  return Response.json({ themeId, themeName: theme.name, total: items.length, items });
}
