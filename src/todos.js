// Logica senza DOM, testabile con node --test.

export const API_BASE = globalThis.CTB_API_BASE ?? "http://localhost:5000";

export function normalizeTitle(title) {
  return (title ?? "").trim();
}

// Dal più urgente al meno urgente; i valori sono quelli del contratto API.
export const PRIORITIES = ["alta", "media", "bassa"];
export const DEFAULT_PRIORITY = "media";

export function priorityOf(todo) {
  return PRIORITIES.includes(todo.priority) ? todo.priority : DEFAULT_PRIORITY;
}

export function sortTodos(todos) {
  return [...todos].sort(
    (a, b) =>
      Number(a.done) - Number(b.done) ||
      PRIORITIES.indexOf(priorityOf(a)) - PRIORITIES.indexOf(priorityOf(b)) ||
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

export async function addTodo(title, priority = DEFAULT_PRIORITY, fetchImpl = fetch) {
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
