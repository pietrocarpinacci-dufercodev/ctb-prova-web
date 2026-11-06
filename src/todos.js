// Logica senza DOM, testabile con node --test.

export const API_BASE = globalThis.CTB_API_BASE ?? "http://localhost:5000";

export function normalizeTitle(title) {
  return (title ?? "").trim();
}

export const PRIORITIES = ["high", "medium", "low"];

// Senza priorità (null) in fondo: indexOf dà -1, quindi lo mando oltre l'ultimo valore.
const rank = (p) => (PRIORITIES.includes(p) ? PRIORITIES.indexOf(p) : PRIORITIES.length);

export function sortTodos(todos) {
  return [...todos].sort(
    (a, b) => Number(a.done) - Number(b.done) || rank(a.priority) - rank(b.priority) || a.id - b.id,
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

// L'API vuole sempre tutti i campi in POST: priority è sempre inviata, null se assente.
export async function addTodo(title, priority, fetchImpl = fetch) {
  const clean = normalizeTitle(title);
  if (!clean) {
    throw new Error("Il titolo è obbligatorio.");
  }
  const response = await fetchImpl(`${API_BASE}/api/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: clean, priority: priority ?? null }),
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

// PATCH parziale: invia solo la priorità; null la rimuove.
export async function setPriority(id, priority, fetchImpl = fetch) {
  const response = await fetchImpl(`${API_BASE}/api/todos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ priority }),
  });
  if (!response.ok) {
    throw new Error(`errore ${response.status}`);
  }
  return response.json();
}
