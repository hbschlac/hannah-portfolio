import type { ReactNode } from "react";

// Admin path uses the parent jamie-bach-2026 layout (which loads fonts + cream bg)
// but skips the bottom nav padding since admin uses sticky top nav.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div style={{ paddingBottom: 0 }}>{children}</div>;
}
