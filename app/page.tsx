import Link from "next/link";

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#F8F6F2", color: "#1A1A1A" }}
    >
      <main className="flex-grow max-w-2xl mx-auto w-full px-6 pt-20 pb-10">
        <p
          className="text-xs tracking-widest uppercase"
          style={{ color: "#1A1A1A" }}
        >
          Hannah Schlacter
        </p>
        <p className="text-xs mt-1" style={{ color: "#8A8A8A" }}>
          product manager who ships
        </p>

        <div className="flex items-center gap-4 mt-4">
          {/* Email */}
          <Link
            href="/contact"
            aria-label="Email"
            className="transition-opacity hover:opacity-50"
            style={{ color: "#8A8A8A" }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M2 7l10 7 10-7" />
            </svg>
          </Link>

          {/* LinkedIn */}
          <a
            href="https://www.linkedin.com/in/hannahschlacter"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="transition-opacity hover:opacity-50"
            style={{ color: "#8A8A8A" }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
              <rect x="2" y="9" width="4" height="12" />
              <circle cx="4" cy="4" r="2" />
            </svg>
          </a>

          {/* GitHub */}
          <a
            href="https://github.com/hbschlac"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="transition-opacity hover:opacity-50"
            style={{ color: "#8A8A8A" }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
          </a>
        </div>

        <div className="mt-6">
          <Link
            href="/projects"
            className="text-xs transition-opacity hover:opacity-50"
            style={{ color: "#8A8A8A" }}
          >
            vibe coding projects →
          </Link>
        </div>
      </main>

      <footer
        className="max-w-2xl mx-auto w-full px-6 py-8"
        style={{ borderTop: "1px solid #E5E1D8" }}
      >
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
