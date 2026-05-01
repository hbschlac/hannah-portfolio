"use client";

import AdminGate from "./_components/AdminGate";
import AdminNav from "./_components/AdminNav";
import { useAdminState } from "./_components/useAdminState";
import { colors, fonts, stickerShadow, sunsetGradient } from "@/lib/jamie/brand";
import type { Reservation, Todo, ActivityEntry } from "@/lib/jamie/types";

export default function AdminDashboard() {
  return (
    <AdminGate>
      <AdminNav />
      <Body />
    </AdminGate>
  );
}

function Body() {
  const { state, error, loading } = useAdminState();
  if (loading) return <Loading />;
  if (error || !state) return <ErrorView error={error} />;

  const reservations = state.reservations;
  const booked = reservations.filter((r) =>
    ["booked", "confirmed", "paid"].includes(r.status)
  ).length;
  const pending = reservations.filter((r) => r.status === "pending").length;
  const tbd = reservations.filter((r) => r.status === "tbd").length;

  const todosOpen = state.todos.filter((t) => !t.done).length;
  const today = new Date().toISOString().slice(0, 10);
  const overdue = state.todos.filter(
    (t) => !t.done && t.dueDate && t.dueDate < today
  ).length;

  const flightsBooked = Object.values(state.flights).filter(
    (f) => f.status === "booked"
  ).length;
  const totalAttendees = state.roster.length - 1; // excludes Jamie

  const surveyResponses = state.survey.length;
  const surveyTotal = totalAttendees;

  const owedToHannah = state.expenses.prePaid
    .filter((p) => p.paidBy === "hannah")
    .reduce((s, p) => s + p.amount, 0);

  const tripStart = new Date(state.trip.startDate + "T00:00:00").getTime();
  const daysLeft = Math.max(
    0,
    Math.ceil((tripStart - Date.now()) / (1000 * 60 * 60 * 24))
  );

  const upcomingDeadlines = [
    ...state.reservations
      .filter((r) => r.deposit?.dueDate && !r.deposit.paid)
      .map((r) => ({
        label: `${r.name} deposit ($${r.deposit?.amount})`,
        owner: r.owner,
        due: r.deposit!.dueDate,
      })),
    ...state.todos
      .filter((t) => !t.done && t.dueDate)
      .map((t) => ({ label: t.title, owner: t.owner, due: t.dueDate! })),
  ]
    .filter((d) => d.due)
    .sort((a, b) => a.due.localeCompare(b.due))
    .slice(0, 6);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 16px 60px" }}>
      <header style={{ marginBottom: 16 }}>
        <div
          style={{
            fontFamily: fonts.script,
            fontSize: "1.2rem",
            color: colors.coral,
          }}
        >
          planning hq ✨
        </div>
        <h1
          style={{
            fontFamily: fonts.display,
            fontStyle: "italic",
            fontWeight: 900,
            fontSize: "2.2rem",
            color: colors.navy,
            margin: 0,
            lineHeight: 1,
          }}
        >
          dashboard
        </h1>
      </header>

      <div
        style={{
          background: sunsetGradient,
          border: `3px solid ${colors.navy}`,
          borderRadius: 14,
          padding: "14px 18px",
          boxShadow: stickerShadow,
          fontFamily: fonts.mono,
          fontWeight: 700,
          letterSpacing: "0.08em",
          fontSize: "0.95rem",
          textAlign: "center",
          marginBottom: 18,
        }}
      >
        T-MINUS {daysLeft} DAYS 🌊
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 12,
        }}
      >
        <StatCard
          label="reservations"
          big={`${booked}`}
          sub={`${pending} pending · ${tbd} tbd`}
          color={colors.lime}
        />
        <StatCard
          label="todos"
          big={`${todosOpen}`}
          sub={overdue ? `${overdue} overdue ⚠️` : "all on track"}
          color={overdue ? colors.coral : colors.butter}
        />
        <StatCard
          label="$ owed to hannah"
          big={`$${owedToHannah.toLocaleString()}`}
          sub="(pre-paid by Hannah)"
          color={colors.tangerine}
        />
        <StatCard
          label="flights"
          big={`${flightsBooked}/${totalAttendees}`}
          sub="booked"
          color={colors.lavender}
        />
        <StatCard
          label="rooms"
          big={
            state.rooms.assignments.filter((a) => a.attendeeId).length +
            "/" +
            state.rooms.assignments.length
          }
          sub="assigned"
          color={colors.cream}
        />
        <StatCard
          label="survey"
          big={`${surveyResponses}/${surveyTotal}`}
          sub="responded"
          color={colors.lime}
        />
      </div>

      <Section title="📌 deadlines" subtitle="next things to wrap">
        {upcomingDeadlines.length === 0 ? (
          <Empty>nothing on the radar</Empty>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {upcomingDeadlines.map((d, i) => {
              const overdue = d.due < today;
              return (
                <li
                  key={i}
                  style={{
                    padding: "10px 0",
                    borderTop: i === 0 ? "none" : `1px solid ${colors.navy}33`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    fontSize: "0.92rem",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{d.label}</div>
                    <div
                      style={{
                        fontSize: "0.78rem",
                        color: colors.navySoft,
                        fontFamily: fonts.mono,
                      }}
                    >
                      {d.owner} · due {d.due}
                    </div>
                  </div>
                  {overdue && (
                    <span
                      style={{
                        background: colors.coral,
                        color: "#fff",
                        padding: "2px 8px",
                        borderRadius: 999,
                        fontSize: "0.72rem",
                        fontWeight: 700,
                      }}
                    >
                      OVERDUE
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <Section title="📜 recent activity" subtitle="last 10 edits">
        {state.activity.length === 0 ? (
          <Empty>no edits yet — start by updating a reservation</Empty>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {state.activity.slice(0, 10).map((a, i) => (
              <li
                key={i}
                style={{
                  padding: "8px 0",
                  borderTop: i === 0 ? "none" : `1px solid ${colors.navy}22`,
                  fontSize: "0.85rem",
                  lineHeight: 1.4,
                }}
              >
                <strong style={{ color: colors.coral }}>{a.who}</strong>{" "}
                {a.what}{" "}
                <span
                  style={{
                    color: colors.navySoft,
                    fontSize: "0.72rem",
                    fontFamily: fonts.mono,
                  }}
                >
                  · {timeAgo(a.when)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

function StatCard({
  label,
  big,
  sub,
  color,
}: {
  label: string;
  big: string;
  sub: string;
  color: string;
}) {
  return (
    <div
      style={{
        background: color,
        border: `3px solid ${colors.navy}`,
        borderRadius: 14,
        padding: 14,
        boxShadow: stickerShadow,
      }}
    >
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: "0.7rem",
          fontWeight: 700,
          letterSpacing: "0.08em",
          color: colors.navy,
          opacity: 0.7,
        }}
      >
        {label.toUpperCase()}
      </div>
      <div
        style={{
          fontFamily: fonts.display,
          fontStyle: "italic",
          fontWeight: 900,
          fontSize: "2rem",
          color: colors.navy,
          lineHeight: 1.05,
          marginTop: 2,
        }}
      >
        {big}
      </div>
      <div
        style={{
          fontSize: "0.78rem",
          color: colors.navySoft,
          marginTop: 2,
        }}
      >
        {sub}
      </div>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginTop: 22 }}>
      <h2
        style={{
          fontFamily: fonts.display,
          fontStyle: "italic",
          fontWeight: 900,
          fontSize: "1.3rem",
          color: colors.navy,
          margin: "0 0 4px",
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <div
          style={{
            color: colors.navySoft,
            fontSize: "0.82rem",
            marginBottom: 8,
          }}
        >
          {subtitle}
        </div>
      )}
      <div
        style={{
          background: "#fff",
          border: `3px solid ${colors.navy}`,
          borderRadius: 12,
          padding: "12px 16px",
          boxShadow: stickerShadow,
        }}
      >
        {children}
      </div>
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: fonts.script,
        fontSize: "1rem",
        color: colors.navySoft,
        textAlign: "center",
        padding: 16,
      }}
    >
      {children}
    </div>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const today = new Date().toISOString().slice(0, 10);

function Loading() {
  return (
    <div style={{ padding: "60px 20px", textAlign: "center" }}>
      <div style={{ fontSize: "2rem" }}>📋</div>
      <p style={{ color: colors.navySoft, marginTop: 12 }}>loading...</p>
    </div>
  );
}

function ErrorView({ error }: { error: string | null }) {
  return (
    <div style={{ padding: "60px 20px", textAlign: "center" }}>
      <p style={{ color: colors.coral }}>oops — {error || "no data"}</p>
    </div>
  );
}
