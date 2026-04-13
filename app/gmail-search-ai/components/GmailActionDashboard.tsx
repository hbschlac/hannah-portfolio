"use client";

import type { GmailActionSnapshot } from "@/lib/gmail-action";
import { HeroSection } from "./HeroSection";
import { EvidenceSection } from "./EvidenceSection";
import { PrototypeSection } from "./PrototypeSection";
import { BigBetsSection } from "./BigBetsSection";

export function GmailActionDashboard({ snapshot }: { snapshot: GmailActionSnapshot }) {
  return (
    <div className="min-h-screen bg-white">
      {/* 1. Header */}
      <HeroSection snapshot={snapshot} />

      {/* 2. Data — quoted evidence linked to Reddit */}
      <EvidenceSection snapshot={snapshot} />

      {/* 3. Prototype — the visual */}
      <PrototypeSection />

      {/* 4. Where I'd take it */}
      <BigBetsSection />

      {/* Footer */}
      <div className="border-t border-gray-100 py-8">
        <div className="max-w-2xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-400">
          <span>
            Built by{" "}
            <a href="/" className="text-gray-600 hover:text-gray-900 font-medium">
              Hannah Schlacter
            </a>
            {" "}· Reddit public API · all quotes linked to source
          </span>
          <div className="flex gap-4">
            <a href="/gmail-search-ai/methodology" className="hover:text-gray-600">Methodology</a>
            <a href="/google-workspace-ai-feedback" className="hover:text-gray-600">Workspace AI Gaps</a>
          </div>
        </div>
      </div>
    </div>
  );
}
