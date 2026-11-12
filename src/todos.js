// Logica senza DOM, testabile con node --test.

export const API_BASE = globalThis.CTB_API_BASE ?? "http://localhost:5000";

export const PRIORITIES = ["bassa", "media", "alta"];

export function normalizeTitle(title) {
  return (title ?? "").trim();
}

// Valori sconosciuti o assenti danno -1: finiscono dopo "bassa".
const rank = (todo) => PRIORITIES.indexOf(todo.priority);

export function sortTodos(todos) {
  return [...todos].sort(
    (a, b) => Number(a.done) - Number(b.done) || rank(b) - rank(a) || a.id - b.id,
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
