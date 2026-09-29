"use client";

import type { ReactNode } from "react";
import { tracking, useVisitor } from "./visitor";

// Link to the kit on GitHub, routed through /career-kit/copy so each click is counted.
export function KitLink({ children, className }: { children: ReactNode; className?: string }) {
  const { vid, via } = useVisitor();
  const q = new URLSearchParams();
  if (vid && tracking()) {
    q.set("v", vid);
    if (via) q.set("via", via);
  }
  const qs = q.toString();
  const href = qs ? `/career-kit/copy?${qs}` : "/career-kit/copy";
  return (
    <a href={href} target="_blank" rel="noopener" className={className}>
      {children}
    </a>
  );
}
