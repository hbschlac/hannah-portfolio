import { getGmailActionSnapshot, buildFallbackGmailSnapshot } from "@/lib/gmail-action";

export async function GET() {
  try {
    const snapshot = (await getGmailActionSnapshot()) ?? buildFallbackGmailSnapshot();
    return Response.json(snapshot);
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
