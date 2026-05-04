"use client";

import { useState, useEffect } from "react";
import AdminGate from "../_components/AdminGate";
import AdminNav from "../_components/AdminNav";
import { useAdminState } from "../_components/useAdminState";
import { colors, fonts, stickerShadow } from "@/lib/jamie/brand";
import type { Todo } from "@/lib/jamie/types";

const ADMIN_PW = "Admin-July2026";

export default function TodosAdminPage() {
  return (
    <AdminGate>
      <AdminNav />
      <Body />
    </AdminGate>
  );
}

function Body() {
  const { state, error, loading, refresh } = useAdminState();
  const [actor, setActor] = useState<"hannah" | "ellie">("hannah");
  const [newTitle, setNewTitle] = useState("");
  const [newOwner, setNewOwner] = useState<"hannah" | "ellie" | "shared">("hannah");
  const [newDue, setNewDue] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("jamie-admin-actor");
    if (stored === "hannah" || stored === "ellie") setActor(stored);
  }, []);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  };

  async function call(method: string, body: object) {
    try {
      const res = await fetch("/api/jamie/admin/todos", {
        method,
        headers: { "content-type": "application/json", "x-admin-pw": ADMIN_PW },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      flash("saved ✿");
      refresh();
    } catch (e) {
      flash(`error: ${e}`);
    }
  }

  const addTodo = () => {
    if (!newTitle.trim()) return;
    call("POST", {
      todo: {
        title: newTitle.trim(),
        owner: newOwner,
        dueDate: newDue || undefined,
        done: false,
      },
      actor,
    });
    setNewTitle("");
    setNewDue("");
  };

  const toggleDone = (t: Todo) =>
    call("PUT", { id: t.id, patch: { done: !t.done }, actor });
  const updateField = (id: string, patch: Partial<Todo>) =>
    call("PUT", { id, patch, actor });
  const removeTodo = (t: Todo) => {
    if (!confirm(`delete "${t.title}"?`)) return;
    call("DELETE", { id: t.id, actor });
  };

  if (loading) return <Loading />;
  if (error || !state) return <ErrorView error={error} />;

  const open = state.todos.filter((t) => !t.done);
  const done = state.todos.filter((t) => t.done);

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "20px 16px 60px" }}>
      <header style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontFamily: fonts.script, fontSize: "1.15rem", color: colors.coral }}>
            shared planning checklist
          </div>
          <h1 style={{ fontFamily: fonts.display, fontStyle: "italic", fontWeight: 900, fontSize: "2rem", color: colors.navy, margin: 0, lineHeight: 1 }}>
            todos
          </h1>
        </div>
        <ActorPicker
          actor={actor}
          setActor={(v) => {
            setActor(v);
            localStorage.setItem("jamie-admin-actor", v);
          }}
        />
      </header>

      {/* New todo form */}
      <div style={{ background: colors.lime, border: `3px solid ${colors.navy}`, borderRadius: 14, padding: 14, boxShadow: stickerShadow, marginBottom: 16, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <input
          placeholder="add a todo..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTodo()}
          style={{ ...inputStyle, flex: 2, minWidth: 200 }}
        />
        <select
          value={newOwner}
          onChange={(e) => setNewOwner(e.target.value as typeof newOwner)}
          style={{ ...inputStyle, flex: 0 }}
        >
          <option value="hannah">hannah</option>
          <option value="ellie">ellie</option>
          <option value="shared">shared</option>
        </select>
        <input
          type="date"
          value={newDue}
          onChange={(e) => setNewDue(e.target.value)}
          style={{ ...inputStyle, flex: 0 }}
        />
        <button
          onClick={addTodo}
          style={{
            padding: "8px 16px",
            background: colors.coral,
            border: `2px solid ${colors.navy}`,
            borderRadius: 999,
            fontFamily: fonts.body,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "2px 2px 0 #1F2A44",
            color: colors.navy,
          }}
        >
          add ✨
        </button>
      </div>

      <Section title="open" count={open.length}>
        {open.length === 0 ? (
          <Empty>everything's done — no notes pending ✨</Empty>
        ) : (
          open.map((t) => (
            <TodoRow
              key={t.id}
              todo={t}
              onToggle={() => toggleDone(t)}
              onUpdate={(patch) => updateField(t.id, patch)}
              onDelete={() => removeTodo(t)}
            />
          ))
        )}
      </Section>

      {done.length > 0 && (
        <Section title="done" count={done.length}>
          {done.map((t) => (
            <TodoRow
              key={t.id}
              todo={t}
              onToggle={() => toggleDone(t)}
              onUpdate={(patch) => updateField(t.id, patch)}
              onDelete={() => removeTodo(t)}
            />
          ))}
        </Section>
      )}

      {toast && <Toast text={toast} />}
    </div>
  );
}

function TodoRow({
  todo,
  onToggle,
  onUpdate,
  onDelete,
}: {
  todo: Todo;
  onToggle: () => void;
  onUpdate: (patch: Partial<Todo>) => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(todo.title);
  useEffect(() => setTitle(todo.title), [todo.title]);
  const today = new Date().toISOString().slice(0, 10);
  const overdue = !todo.done && todo.dueDate && todo.dueDate < today;
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "center",
        padding: "10px 12px",
        borderBottom: `1px solid ${colors.navy}22`,
        opacity: todo.done ? 0.5 : 1,
      }}
    >
      <input
        type="checkbox"
        checked={todo.done}
        onChange={onToggle}
        style={{ width: 20, height: 20, cursor: "pointer", accentColor: colors.coral }}
      />
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => title !== todo.title && onUpdate({ title })}
        style={{
          flex: 1,
          padding: "5px 8px",
          border: "none",
          background: "transparent",
          fontFamily: fonts.body,
          fontSize: "0.95rem",
          color: colors.navy,
          textDecoration: todo.done ? "line-through" : "none",
        }}
      />
      <select
        value={todo.owner}
        onChange={(e) => onUpdate({ owner: e.target.value as Todo["owner"] })}
        style={{
          padding: "4px 8px",
          borderRadius: 999,
          border: `2px solid ${colors.navy}`,
          background: "#fff",
          fontSize: "0.78rem",
          fontWeight: 600,
          fontFamily: fonts.body,
          cursor: "pointer",
        }}
      >
        <option value="hannah">hannah</option>
        <option value="ellie">ellie</option>
        <option value="shared">shared</option>
      </select>
      <input
        type="date"
        value={todo.dueDate || ""}
        onChange={(e) => onUpdate({ dueDate: e.target.value || undefined })}
        style={{
          ...inputStyle,
          padding: "4px 8px",
          fontSize: "0.78rem",
          background: overdue ? colors.coral : "#fff",
          color: overdue ? "#fff" : colors.navy,
        }}
      />
      <button
        onClick={onDelete}
        style={{
          background: "transparent",
          border: "none",
          fontSize: "1rem",
          cursor: "pointer",
          color: colors.navySoft,
        }}
        title="delete"
      >
        🗑
      </button>
    </div>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 18 }}>
      <h2 style={{ fontFamily: fonts.display, fontStyle: "italic", fontWeight: 900, fontSize: "1.3rem", color: colors.navy, margin: "0 0 8px" }}>
        {title} <span style={{ color: colors.navySoft, fontSize: "0.95rem" }}>({count})</span>
      </h2>
      <div style={{ background: "#fff", border: `3px solid ${colors.navy}`, borderRadius: 12, boxShadow: stickerShadow, overflow: "hidden" }}>
        {children}
      </div>
    </section>
  );
}

function ActorPicker({ actor, setActor }: { actor: "hannah" | "ellie"; setActor: (v: "hannah" | "ellie") => void }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <span style={{ fontSize: "0.78rem", color: colors.navySoft }}>you are</span>
      {(["hannah", "ellie"] as const).map((name) => (
        <button
          key={name}
          onClick={() => setActor(name)}
          style={{
            padding: "5px 12px",
            borderRadius: 999,
            border: `2px solid ${colors.navy}`,
            background: actor === name ? colors.coral : "#fff",
            color: colors.navy,
            fontSize: "0.78rem",
            fontWeight: actor === name ? 700 : 600,
            cursor: "pointer",
            boxShadow: actor === name ? "2px 2px 0 #1F2A44" : "none",
          }}
        >
          {name}
        </button>
      ))}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: fonts.script, fontSize: "1rem", color: colors.navySoft, textAlign: "center", padding: 16 }}>
      {children}
    </div>
  );
}

function Toast({ text }: { text: string }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        background: colors.navy,
        color: colors.cream,
        padding: "10px 18px",
        borderRadius: 999,
        fontWeight: 600,
        fontSize: "0.9rem",
        zIndex: 100,
        boxShadow: "4px 4px 0 #00000033",
      }}
    >
      {text}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "7px 10px",
  border: `2px solid ${colors.navy}`,
  borderRadius: 8,
  background: "#fff",
  fontFamily: fonts.body,
  fontSize: "0.88rem",
  color: colors.navy,
  outline: "none",
  boxSizing: "border-box",
};

function Loading() {
  return (
    <div style={{ padding: "60px 20px", textAlign: "center" }}>
      <div style={{ fontSize: "2rem" }}>✅</div>
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
