import { Suspense } from "react";
import { cookies } from "next/headers";
import LoginForm from "./LoginForm";
import AdminTabs from "./AdminTabs";
import { listResumes } from "@/lib/kv";

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
  const isAuthed = cookieStore.get("admin_session")?.value === "1";

  if (!isAuthed) return <LoginForm />;

  const resumes = await listResumes();
  return <AdminTabs resumes={resumes} />;
}
