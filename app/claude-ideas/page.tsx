import { getIdeasFromKV } from "@/lib/kv";
import IdeasTable from "./IdeasTable";

export const metadata = { title: "Claude Ideas — schlacter.me" };

export default async function ClaudeIdeasPage() {
  const initialIdeas = await getIdeasFromKV();
  return (
    <main className="min-h-screen bg-white px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <p className="text-xs tracking-widest uppercase text-stone-400 mb-1">schlacter.me</p>
          <h1 className="text-2xl font-semibold text-stone-800">Claude Ideas</h1>
          <p className="text-sm text-stone-500 mt-1">Feature ideas tracker</p>
        </div>
        <IdeasTable initialIdeas={initialIdeas} />
      </div>
    </main>
  );
}
