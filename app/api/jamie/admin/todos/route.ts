import { NextRequest, NextResponse } from "next/server";
import { getTodos, setTodos, appendActivity } from "@/lib/jamie/kv";
import type { Todo } from "@/lib/jamie/types";

const ADMIN_PW = "Admin-July2026";

function checkAuth(req: NextRequest) {
  return req.headers.get("x-admin-pw") === ADMIN_PW;
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as { todo: Omit<Todo, "id" | "createdAt">; actor: "hannah" | "ellie" };
  const todos = await getTodos();
  const newTodo: Todo = {
    id: `todo-${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...body.todo,
  };
  await setTodos([...todos, newTodo]);
  await appendActivity({ who: body.actor, what: `added todo "${newTodo.title}"`, when: new Date().toISOString() });
  return NextResponse.json({ ok: true, todo: newTodo });
}

export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as { id: string; patch: Partial<Todo>; actor: "hannah" | "ellie" };
  const todos = await getTodos();
  const idx = todos.findIndex((t) => t.id === body.id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const before = todos[idx];
  const after = { ...before, ...body.patch };
  todos[idx] = after;
  await setTodos(todos);
  if (body.patch.done !== undefined && body.patch.done !== before.done) {
    await appendActivity({
      who: body.actor,
      what: body.patch.done ? `✅ checked off "${after.title}"` : `unchecked "${after.title}"`,
      when: new Date().toISOString(),
    });
  }
  return NextResponse.json({ ok: true, todo: after });
}

export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as { id: string; actor: "hannah" | "ellie" };
  const todos = await getTodos();
  const todo = todos.find((t) => t.id === body.id);
  if (!todo) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await setTodos(todos.filter((t) => t.id !== body.id));
  await appendActivity({ who: body.actor, what: `🗑 deleted todo "${todo.title}"`, when: new Date().toISOString() });
  return NextResponse.json({ ok: true });
}
