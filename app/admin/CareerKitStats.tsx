import type { KitStats } from "@/lib/career-kit-stats";

// Private numbers for schlacter.me/career-kit. Only rendered inside the signed-in admin page.
export default function CareerKitStats({ stats, error }: { stats: KitStats | null; error?: string }) {
  if (!stats) {
    return (
      <p className="text-sm text-stone-500">
        Couldn&apos;t load the Career Kit numbers{error ? `: ${error}` : "."}
      </p>
    );
  }
  const { totals, people, viaShare } = stats;
  const visitors = people.view;
  const pct = (n: number) => (visitors ? `${Math.round((n / visitors) * 100)}%` : "–");
  const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

  const kpis: { label: string; value: number; sub: string }[] = [
    { label: "Visitors", value: visitors, sub: count(totals.view, "page view", "page views") },
    { label: "Shared the page", value: people.share, sub: `${count(totals.share, "share", "shares")} (share sheet or copied link)` },
    { label: "Came from a shared link", value: viaShare.viewers, sub: count(viaShare.views, "visit", "visits") },
    { label: "Went to GitHub to copy it", value: people.copy_kit, sub: `${count(totals.copy_kit, "click", "clicks")}, ${viaShare.copiers} via a shared link` },
    { label: "Made their private copy", value: people.step2, sub: "ticked step 2 done" },
    { label: "Finished setup", value: people.setup_done, sub: "ticked all 5 steps" },
  ];
  const funnel = [
    ["Visited", visitors],
    ["Went to GitHub", people.copy_kit],
    ["Made a private copy (step 2)", people.step2],
    ["Connected Drive + Gmail (step 3)", people.step3],
    ["Said “set me up” (step 5)", people.step5],
    ["Finished the checklist", people.setup_done],
  ] as const;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-stone-800">Career Kit</h2>
        <p className="text-xs text-stone-400 mt-1">
          schlacter.me/career-kit · people are counted once per browser · your own visits don&apos;t
          count on browsers signed in here
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-stone-200 p-4">
            <p className="text-2xl font-semibold text-stone-800 tabular-nums">{k.value}</p>
            <p className="text-xs font-medium text-stone-600 mt-1">{k.label}</p>
            <p className="text-xs text-stone-400 mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      <section>
        <p className="text-xs tracking-widest uppercase text-stone-400 mb-3">Funnel</p>
        <div className="space-y-2">
          {funnel.map(([label, n]) => (
            <div key={label} className="flex items-center gap-3 text-sm">
              <span className="w-48 shrink-0 text-stone-600">{label}</span>
              <div className="flex-1 h-2 rounded-full bg-stone-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-stone-700"
                  style={{ width: visitors ? `${(n / visitors) * 100}%` : "0%" }}
                />
              </div>
              <span className="w-16 text-right tabular-nums text-stone-700">
                {n} <span className="text-stone-400 text-xs">{pct(n)}</span>
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-stone-400 mt-2">
          GitHub doesn&apos;t report whether someone finished making a copy, so the steps come from
          the checklist on the page.
        </p>
      </section>

      <section>
        <p className="text-xs tracking-widest uppercase text-stone-400 mb-3">Last 14 days</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-stone-400 text-left">
                <th className="font-normal py-1.5">Day</th>
                <th className="font-normal py-1.5 text-right">Visits</th>
                <th className="font-normal py-1.5 text-right">Shares</th>
                <th className="font-normal py-1.5 text-right">To GitHub</th>
                <th className="font-normal py-1.5 text-right">Finished</th>
              </tr>
            </thead>
            <tbody>
              {stats.days.map((d) => (
                <tr key={d.date} className="border-t border-stone-100 tabular-nums">
                  <td className="py-1.5 text-stone-600">{d.date.slice(5)}</td>
                  <td className="py-1.5 text-right">{d.view}</td>
                  <td className="py-1.5 text-right">{d.share}</td>
                  <td className="py-1.5 text-right">{d.copy_kit}</td>
                  <td className="py-1.5 text-right">{d.setup_done}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid sm:grid-cols-2 gap-6">
        <List title="Where visits come from" rows={stats.sources} empty="No visits yet." />
        <List
          title="Your ?ref= tags"
          rows={stats.refs}
          empty="Add ?ref=anything to a link you post (schlacter.me/career-kit?ref=linkedin) to see it here."
        />
      </section>
    </div>
  );
}

function List({ title, rows, empty }: { title: string; rows: [string, number][]; empty: string }) {
  return (
    <div>
      <p className="text-xs tracking-widest uppercase text-stone-400 mb-3">{title}</p>
      {rows.length === 0 ? (
        <p className="text-xs text-stone-400">{empty}</p>
      ) : (
        <ul className="space-y-1.5 text-sm">
          {rows.map(([k, n]) => (
            <li key={k} className="flex justify-between gap-3">
              <span className="text-stone-600 truncate">{k}</span>
              <span className="tabular-nums text-stone-700">{n}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
