import { Suspense } from "react";
import { cookies } from "next/headers";
import LoginForm from "./LoginForm";
import AdminTabs from "./AdminTabs";
import { listResumes } from "@/lib/kv";
import { getKitStats, type KitStats } from "@/lib/career-kit-stats";
import { ADMIN_COOKIE, isAdminSession } from "@/lib/admin-session";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
      <Suspense fallback={null}>
        <AdminContent />
      </Suspense>
    </main>
  );
}

async function AdminContent() {
  const cookieStore = await cookies();
  const isAuthed = isAdminSession(cookieStore.get(ADMIN_COOKIE)?.value);

  if (!isAuthed) return <LoginForm />;

  const resumes = await listResumes();
  let kitStats: KitStats | null = null;
  let kitError = "";
  try {
    kitStats = await getKitStats();
  } catch (err) {
    kitError = err instanceof Error ? err.message : "unknown error";
  }
  return <AdminTabs resumes={resumes} kitStats={kitStats} kitError={kitError} />;
}
