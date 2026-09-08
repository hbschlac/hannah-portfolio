import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#F8F6F2", color: "#1A1A1A" }}
    >
      <main className="flex-grow max-w-2xl mx-auto w-full px-6 pt-20 pb-10">
        <p className="text-xs tracking-widest uppercase">Hannah Schlacter</p>
        <p className="text-xs mt-1" style={{ color: "#8A8A8A" }}>
          this page doesn&apos;t exist
        </p>

        <div className="flex flex-col gap-2 mt-8">
          <Link
            href="/"
            className="text-xs transition-opacity hover:opacity-50"
            style={{ color: "#8A8A8A" }}
          >
            home →
          </Link>
          <Link
            href="/projects"
            className="text-xs transition-opacity hover:opacity-50"
            style={{ color: "#8A8A8A" }}
          >
            vibe coding projects →
          </Link>
        </div>
      </main>

      <footer className="max-w-2xl mx-auto w-full px-6 pb-10">
        <p className="text-xs" style={{ color: "#8A8A8A" }}>
          vibed with love | oakland, ca
        </p>
        <p className="text-xs mt-1" style={{ color: "#8A8A8A" }}>
          © 2026
        </p>
      </footer>
    </div>
  );
}
