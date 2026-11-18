// Logica senza DOM, testabile con node --test.

export const API_BASE = globalThis.CTB_API_BASE ?? "http://localhost:5000";

export function normalizeTitle(title) {
  return (title ?? "").trim();
}

export const PRIORITIES = { low: "Bassa", medium: "Media", high: "Alta" };

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

export function priorityLabel(priority) {
  return PRIORITIES[priority] ?? priority;
}

export function sortTodos(todos) {
  return [...todos].sort(
    (a, b) =>
      Number(a.done) - Number(b.done) ||
      (PRIORITY_RANK[a.priority] ?? 1) - (PRIORITY_RANK[b.priority] ?? 1) ||
      a.id - b.id,
  );
}

export function summary(todos) {
  const open = todos.filter((t) => !t.done).length;
  return `${open} da fare su ${todos.length}`;
}

export async function fetchTodos(fetchImpl = fetch) {
  const response = await fetchImpl(`${API_BASE}/api/todos`);
  if (!response.ok) {
    throw new Error(`errore ${response.status}`);
  }
  return response.json();
}

export async function addTodo(title, priority, fetchImpl = fetch) {
  const clean = normalizeTitle(title);
  if (!clean) {
    throw new Error("Il titolo è obbligatorio.");
  }
  const response = await fetchImpl(`${API_BASE}/api/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: clean, priority }),
  });
  if (!response.ok) {
    throw new Error(`errore ${response.status}`);
  }
  return response.json();
}

export async function markDone(id, fetchImpl = fetch) {
  const response = await fetchImpl(`${API_BASE}/api/todos/${id}/done`, { method: "POST" });
  if (!response.ok) {
    throw new Error(`errore ${response.status}`);
  }
  return response.json();
}
