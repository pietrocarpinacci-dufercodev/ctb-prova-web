import { test } from "node:test";
import assert from "node:assert/strict";
import { addTodo, normalizeTitle, PRIORITIES, priorityLabel, sortTodos, summary } from "../src/todos.js";

test("normalizeTitle toglie gli spazi e gestisce null", () => {
  assert.equal(normalizeTitle("  pane  "), "pane");
  assert.equal(normalizeTitle(null), "");
});

test("sortTodos mette prima le cose da fare, poi per id", () => {
  const sorted = sortTodos([
    { id: 2, title: "b", done: true },
    { id: 3, title: "c", done: false },
    { id: 1, title: "a", done: false },
  ]);
  assert.deepEqual(sorted.map((t) => t.id), [1, 3, 2]);
});

test("sortTodos ordina per fatto, poi priorità da alta a bassa, poi id", () => {
  const sorted = sortTodos([
    { id: 1, done: false, priority: "low" },
    { id: 2, done: true, priority: "high" },
    { id: 3, done: false, priority: "high" },
    { id: 4, done: false, priority: "medium" },
    { id: 5, done: false, priority: "high" },
    { id: 6, done: true, priority: "low" },
  ]);
  assert.deepEqual(sorted.map((t) => t.id), [3, 5, 4, 1, 2, 6]);
});

test("priorityLabel restituisce l'etichetta italiana", () => {
  assert.equal(priorityLabel("low"), "Bassa");
  assert.equal(priorityLabel("medium"), "Media");
  assert.equal(priorityLabel("high"), "Alta");
  assert.deepEqual(Object.keys(PRIORITIES), ["low", "medium", "high"]);
});

test("summary conta le cose ancora da fare", () => {
  assert.equal(summary([{ done: false }, { done: true }]), "1 da fare su 2");
});

test("addTodo rifiuta un titolo vuoto senza chiamare l'API", async () => {
  let called = false;
  const fakeFetch = async () => {
    called = true;
  };
  await assert.rejects(addTodo("   ", "medium", fakeFetch), /obbligatorio/);
  assert.equal(called, false);
});

test("addTodo invia il titolo ripulito e la priorità", async () => {
  let sent;
  const fakeFetch = async (url, options) => {
    sent = { url, body: JSON.parse(options.body) };
    return { ok: true, json: async () => ({ id: 1, title: "pane", done: false, priority: "high" }) };
  };
  const todo = await addTodo("  pane ", "high", fakeFetch);
  assert.deepEqual(sent.body, { title: "pane", priority: "high" });
  assert.match(sent.url, /\/api\/todos$/);
  assert.equal(todo.id, 1);
});
