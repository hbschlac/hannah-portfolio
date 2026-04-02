import { readFileSync } from "fs";
import { join } from "path";

export async function GET() {
  const file = readFileSync(
    join(process.cwd(), "public", "add-claude-idea.shortcut")
  );
  return new Response(file, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": 'attachment; filename="Add Claude Idea.shortcut"',
    },
  });
}
