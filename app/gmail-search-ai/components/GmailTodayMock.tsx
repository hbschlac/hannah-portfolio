"use client";

const steps = [
  { n: 1, label: "Search", detail: "\"contract renewal from Salesforce\"" },
  { n: 2, label: "Scan 8 thread results", detail: "No synthesis, just a list" },
  { n: 3, label: "Open thread", detail: "12-message chain, scroll to context" },
  { n: 4, label: "Tap Compose", detail: "Blank window, start from scratch" },
  { n: 5, label: "Write reply manually", detail: "No AI assist" },
];

export function GmailTodayMock() {
  return (
    <div className="flex flex-col items-center">
      <div className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Gmail Today</div>

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

        {/* Search results — just a list */}
        <div className="divide-y divide-gray-50 bg-white">
          {["Re: Q4 Renewal — Action Needed", "Salesforce contract renewal...", "FW: Renewal reminder", "Renewal contract v2"].map((title, i) => (
            <div key={i} className="px-4 py-2.5 flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-gray-200 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <span className="text-[11px] font-semibold text-gray-800 truncate">{i === 0 ? "Marcus Kim" : i === 1 ? "Salesforce" : i === 2 ? "Legal Team" : "Sarah Chen"}</span>
                  <span className="text-[9px] text-gray-400 shrink-0 ml-1">{i === 0 ? "Oct 3" : i === 1 ? "Sep 28" : i === 2 ? "Sep 15" : "Aug 30"}</span>
                </div>
                <p className="text-[10px] text-gray-500 truncate">{title}</p>
              </div>
            </div>
          ))}
          <div className="px-4 py-2.5 flex items-start gap-2.5 opacity-40">
            <div className="w-6 h-6 rounded-full bg-gray-200 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-[11px] font-semibold text-gray-400">+ 4 more threads...</div>
            </div>
          </div>
        </div>

        {/* Step indicators */}
        <div className="bg-gray-50 px-3 py-3 space-y-1.5 border-t border-gray-100">
          {steps.map((s) => (
            <div key={s.n} className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-gray-300 text-white text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {s.n}
              </span>
              <div>
                <span className="text-[10px] font-semibold text-gray-600">{s.label} </span>
                <span className="text-[10px] text-gray-400">{s.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-400 text-center max-w-[240px]">
        5 taps + full read + compose from scratch
      </p>
    </div>
  );
}
