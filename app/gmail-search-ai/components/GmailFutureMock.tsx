"use client";

type Layer = "summary" | "action" | "voice";

const LAYER_LABELS: Record<Layer, string> = {
  summary: "H1 · Summary",
  action: "H2 · + Action",
  voice: "H3 · + Voice",
};

const LAYER_COLORS: Record<Layer, string> = {
  summary: "#EA4335",
  action: "#1a73e8",
  voice: "#34A853",
};

export function GmailFutureMock({ activeLayer }: { activeLayer: Layer }) {
  const showAction = activeLayer === "action" || activeLayer === "voice";
  const showVoice = activeLayer === "voice";

  return (
    <div className="flex flex-col items-center">
      <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Gmail Future</div>

      {/* Phone frame */}
      <div
        className="w-[280px] rounded-[32px] border-[6px] border-gray-800 bg-white overflow-hidden shadow-2xl"
        style={{ minHeight: 520 }}
      >
        {/* Status bar */}
        <div className="bg-white flex justify-between items-center px-5 pt-3 pb-1">
          <span className="text-[10px] font-semibold text-gray-700">9:41</span>
          <div className="flex gap-1">
            <div className="w-3 h-1.5 rounded-sm bg-gray-600" />
            <div className="w-1 h-1.5 rounded-sm bg-gray-300" />
          </div>
        </div>

        {/* Gmail header */}
        <div className="bg-white px-4 pt-1 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" stroke="#5f6368" strokeWidth="2"/><path d="M16.5 16.5l4 4" stroke="#5f6368" strokeWidth="2" strokeLinecap="round"/></svg>
            <span className="text-[11px] text-gray-500">contract renewal from Salesforce</span>
          </div>
        </div>

        {/* AI Overview panel */}
        <div className="mx-3 mt-2 rounded-xl border overflow-hidden" style={{ borderColor: "#c5d8ff" }}>
          {/* Gemini header */}
          <div className="flex items-center gap-1.5 px-3 py-1.5" style={{ background: "#f0f4ff" }}>
            {/* Gemini 4-pointed star */}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C12 2 13.5 9 20 12C13.5 15 12 22 12 22C12 22 10.5 15 4 12C10.5 9 12 2 12 2Z" fill="#1a73e8"/>
            </svg>
            <span className="text-[10px] font-semibold" style={{ color: "#1a73e8" }}>Gemini Overview</span>

            {/* H1 badge */}
            <span
              className="ml-auto text-[8px] font-bold px-1.5 py-0.5 rounded-full text-white"
              style={{ background: LAYER_COLORS["summary"] }}
            >
              H1
            </span>
          </div>

          <div className="bg-white px-3 py-2.5">
            <p className="text-[11px] font-semibold text-gray-800 leading-snug">
              Salesforce renewal due Nov 1 · $24k/yr
            </p>
            <div className="mt-1.5 space-y-1">
              <p className="text-[10px] text-gray-500">· 3 threads · Last reply Oct 3 from Marcus</p>
              <p className="text-[10px] text-gray-500">· Contract v2 attached Sep 28</p>
              <p className="text-[10px] font-medium text-orange-600">· Marcus's pricing question unanswered</p>
            </div>

            {/* Thread results below */}
            <div className="mt-2.5 pt-2 border-t border-gray-100 space-y-1.5">
              {["Re: Q4 Renewal — Action Needed", "Salesforce contract renewal..."].map((t, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gray-100 shrink-0" />
                  <span className="text-[10px] text-gray-500 truncate">{t}</span>
                </div>
              ))}
            </div>

            {/* Action layer */}
            {showAction && (
              <div className="mt-3 pt-2.5 border-t" style={{ borderColor: "#e8f0fe" }}>
                <div className="flex items-center gap-1 mb-2">
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: LAYER_COLORS["action"] }}>H2</span>
                  <span className="text-[9px] font-semibold" style={{ color: "#1a73e8" }}>Quick actions</span>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  <button
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-full border text-white transition-all"
                    style={{ background: "#1a73e8", borderColor: "#1a73e8" }}
                  >
                    Reply to Marcus
                  </button>
                  <button className="text-[10px] font-medium px-2 py-1 rounded-full border border-gray-200 text-gray-600">
                    Forward contract
                  </button>
                  <button className="text-[10px] font-medium px-2 py-1 rounded-full border border-gray-200 text-gray-600">
                    Remind me
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Voice draft panel */}
        {showVoice && (
          <div className="mx-3 mt-2 rounded-xl border overflow-hidden" style={{ borderColor: "#c8e6c9" }}>
            <div className="flex items-center gap-1.5 px-3 py-1.5" style={{ background: "#f1f8f1" }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C12 2 13.5 9 20 12C13.5 15 12 22 12 22C12 22 10.5 15 4 12C10.5 9 12 2 12 2Z" fill="#34A853"/>
              </svg>
              <span className="text-[10px] font-semibold" style={{ color: "#34A853" }}>Drafted in your voice</span>
              <span className="ml-auto text-[8px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: LAYER_COLORS["voice"] }}>H3</span>
            </div>
            <div className="bg-white px-3 py-2.5">
              <p className="text-[10px] text-gray-700 leading-relaxed">
                Hi Marcus — confirming we&apos;re good to proceed with renewal. Can you send the updated contract by EOW?
              </p>
              <p className="text-[10px] text-gray-400 mt-1.5">Thanks</p>
              <div className="flex gap-2 mt-3">
                <button
                  className="flex-1 text-[10px] font-semibold py-1.5 rounded-lg text-white"
                  style={{ background: "#34A853" }}
                >
                  Send
                </button>
                <button className="flex-1 text-[10px] font-medium py-1.5 rounded-lg border border-gray-200 text-gray-600">
                  Edit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom padding */}
        <div className="h-4" />
      </div>

      <p className="mt-4 text-xs text-center max-w-[240px]" style={{ color: LAYER_COLORS[activeLayer] }}>
        {activeLayer === "summary" && "AI summary at the top of search results"}
        {activeLayer === "action" && "Inline action buttons below the summary"}
        {activeLayer === "voice" && "Draft reply matched to your writing style"}
      </p>
    </div>
  );
}
