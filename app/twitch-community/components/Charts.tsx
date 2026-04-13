"use client";

import type { AnalysisSnapshot, TwitchTheme, FeatureLaunch } from "@/lib/twitch-research";

const TWITCH_PURPLE = "#9146FF";
const TWITCH_PURPLE_LIGHT = "#BF94FF";

const SOURCE_COLORS: Record<string, string> = {
  reddit: "#FF4500",
  hackernews: "#FF6600",
  playstore: "#34A853",
  appstore: "#007AFF",
  youtube: "#FF0000",
  curated: "#9146FF",
};

const SOURCE_LABELS: Record<string, string> = {
  reddit: "Reddit",
  hackernews: "Hacker News",
  playstore: "Play Store",
  appstore: "App Store",
  youtube: "YouTube",
  curated: "Curated Sources",
};

// ── Source Distribution Bar Chart ──

export function SourceDistribution({ sources }: { sources: AnalysisSnapshot["sources"] }) {
  const entries = Object.entries(sources)
    .filter(([, count]) => (count ?? 0) > 0)
    .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0));

  const maxCount = Math.max(...entries.map(([, c]) => c ?? 0), 1);

  return (
    <div className="space-y-2">
      {entries.map(([source, count]) => (
        <div key={source} className="flex items-center gap-3">
          <span className="text-xs text-gray-400 w-20 text-right shrink-0">{SOURCE_LABELS[source] ?? source}</span>
          <div className="flex-1 h-5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${((count ?? 0) / maxCount) * 100}%`,
                background: SOURCE_COLORS[source] ?? "#666",
              }}
            />
          </div>
          <span className="text-xs text-gray-300 w-10 shrink-0">{count}</span>
        </div>
      ))}
    </div>
  );
}

// ── Perspective Split Bar ──

export function PerspectiveSplit({ split }: { split: AnalysisSnapshot["perspectiveSplit"] }) {
  const total = split.creator + split.viewer + split.both;
  if (total === 0) return null;

  const creatorPct = Math.round((split.creator / total) * 100);
  const viewerPct = Math.round((split.viewer / total) * 100);
  const bothPct = 100 - creatorPct - viewerPct;

  return (
    <div>
      <div className="flex h-4 rounded-full overflow-hidden">
        <div style={{ width: `${creatorPct}%`, background: TWITCH_PURPLE }} title={`Creators: ${split.creator}`} />
        <div style={{ width: `${viewerPct}%`, background: "#00C9A7" }} title={`Viewers: ${split.viewer}`} />
        <div style={{ width: `${bothPct}%`, background: "#4A5568" }} title={`Both: ${split.both}`} />
      </div>
      <div className="flex justify-between mt-1.5 text-xs text-gray-400">
        <span><span className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: TWITCH_PURPLE }} />Creators {creatorPct}%</span>
        <span><span className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: "#00C9A7" }} />Viewers {viewerPct}%</span>
        <span><span className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: "#4A5568" }} />Both {bothPct}%</span>
      </div>
    </div>
  );
}

// ── Theme Perspective Mini Bar ──

export function ThemePerspectiveBar({ creator, viewer, total }: { creator: number; viewer: number; total: number }) {
  if (total === 0) return null;
  const cPct = Math.round((creator / total) * 100);
  const vPct = Math.round((viewer / total) * 100);
  const bPct = 100 - cPct - vPct;

  return (
    <div className="flex h-2 rounded-full overflow-hidden" title={`Creator: ${creator}, Viewer: ${viewer}, Both: ${total - creator - viewer}`}>
      <div style={{ width: `${cPct}%`, background: TWITCH_PURPLE }} />
      <div style={{ width: `${vPct}%`, background: "#00C9A7" }} />
      <div style={{ width: `${bPct}%`, background: "#4A5568" }} />
    </div>
  );
}

// ── Funnel Visualization ──

export function FunnelChart({ themes }: { themes: TwitchTheme[] }) {
  const communityThemes = themes.filter((t) => t.layer === "community");
  const notifThemes = themes.filter((t) => t.layer === "notifications");
  const communityTotal = communityThemes.reduce((s, t) => s + t.frequency, 0);
  const notifTotal = notifThemes.reduce((s, t) => s + t.frequency, 0);
  const maxTotal = Math.max(communityTotal, notifTotal, 1);

  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-gray-300">Creator-Viewer Connection</span>
          <span className="text-xs text-gray-400">{communityTotal} mentions</span>
        </div>
        <div className="h-8 bg-gray-800 rounded-lg overflow-hidden">
          <div
            className="h-full rounded-lg flex items-center px-3"
            style={{
              width: `${(communityTotal / maxTotal) * 100}%`,
              background: `linear-gradient(90deg, ${TWITCH_PURPLE}, ${TWITCH_PURPLE_LIGHT})`,
              minWidth: "60px",
            }}
          >
            <span className="text-xs font-medium text-white">{communityThemes.length} themes</span>
          </div>
        </div>
      </div>
      <div className="flex justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={TWITCH_PURPLE} strokeWidth="2">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-gray-300">Notifications</span>
          <span className="text-xs text-gray-400">{notifTotal} mentions</span>
        </div>
        <div className="h-8 bg-gray-800 rounded-lg overflow-hidden">
          <div
            className="h-full rounded-lg flex items-center px-3"
            style={{
              width: `${(notifTotal / maxTotal) * 100}%`,
              background: "linear-gradient(90deg, #FF6B6B, #FF8E8E)",
              minWidth: "60px",
            }}
          >
            <span className="text-xs font-medium text-white">{notifThemes.length} themes</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Timeline Chart ──

export function TimelineChart({
  monthlyDistribution,
  featureLaunches,
  onMonthClick,
}: {
  monthlyDistribution: AnalysisSnapshot["monthlyDistribution"];
  featureLaunches: FeatureLaunch[];
  onMonthClick?: (month: string) => void;
}) {
  if (!monthlyDistribution.length) return null;

  const maxCount = Math.max(...monthlyDistribution.map((m) => m.count), 1);
  const chartHeight = 120;
  const barWidth = Math.max(20, Math.floor(600 / monthlyDistribution.length) - 4);

  // Map launches to months
  const launchByMonth = new Map<string, FeatureLaunch[]>();
  for (const launch of featureLaunches) {
    const d = new Date(launch.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!launchByMonth.has(key)) launchByMonth.set(key, []);
    launchByMonth.get(key)!.push(launch);
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex items-end gap-1 min-w-fit" style={{ height: chartHeight + 40 }}>
        {monthlyDistribution.map((m) => {
          const barHeight = Math.max(2, (m.count / maxCount) * chartHeight);
          const launches = launchByMonth.get(m.month) ?? [];
          const monthLabel = new Date(m.month + "-01").toLocaleDateString("en-US", { month: "short" });

          return (
            <div key={m.month} className="flex flex-col items-center" style={{ width: barWidth }}>
              {launches.length > 0 && (
                <div className="mb-1">
                  {launches.map((l) => (
                    <a
                      key={l.id}
                      href={l.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={l.name}
                      className="block w-3 h-3 rounded-full border-2 border-yellow-400 bg-yellow-400/30 hover:bg-yellow-400/60 mb-0.5 mx-auto"
                    />
                  ))}
                </div>
              )}
              <button
                onClick={() => onMonthClick?.(m.month)}
                className="w-full rounded-t hover:opacity-80 transition-opacity cursor-pointer"
                style={{
                  height: barHeight,
                  background: `linear-gradient(180deg, ${TWITCH_PURPLE}, ${TWITCH_PURPLE}88)`,
                }}
                title={`${m.month}: ${m.count} data points`}
              />
              <span className="text-[10px] text-gray-500 mt-1">{monthLabel}</span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full" style={{ background: TWITCH_PURPLE }} />
          Feedback volume
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full border border-yellow-400 bg-yellow-400/30" />
          Feature launch
        </span>
      </div>
    </div>
  );
}

// ── Severity Bar ──

export function SeverityBar({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="h-2 w-4 rounded-sm"
          style={{
            background: i <= level
              ? level >= 4 ? "#FF6B6B" : level >= 3 ? "#FFD93D" : "#6BCB77"
              : "#374151",
          }}
        />
      ))}
    </div>
  );
}
