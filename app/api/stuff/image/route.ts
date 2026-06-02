import { NextRequest, NextResponse } from "next/server";

// Image proxy. Many publishers (Fortune, NYT, etc) block direct hotlinking,
// so the browser-fetched <img src> 403s. Routing through here lets us forward
// a browser-y User-Agent and a same-origin Referer the publisher's CDN
// expects, and gives us CDN-cacheable bytes back on schlacter.me.
export async function GET(req: NextRequest) {
  const target = new URL(req.url).searchParams.get("u");
  if (!target) return new NextResponse(null, { status: 400 });

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return new NextResponse(null, { status: 400 });
  }

  try {
    const res = await fetch(parsed.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Referer: `${parsed.origin}/`,
        Accept:
          "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return new NextResponse(null, { status: res.status });
    const ct = res.headers.get("content-type") || "image/jpeg";
    if (!ct.startsWith("image/")) return new NextResponse(null, { status: 415 });
    const body = await res.arrayBuffer();
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": ct,
        // 1 day browser + 30 days CDN, so subsequent loads hit the edge.
        "Cache-Control": "public, max-age=86400, s-maxage=2592000",
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
