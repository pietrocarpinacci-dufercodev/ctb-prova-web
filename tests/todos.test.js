import { test } from "node:test";
import assert from "node:assert/strict";
import { addTodo, normalizeTitle, sortTodos, summary } from "../src/todos.js";

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

test("sortTodos ordina per stato, poi priorità da alta a bassa, poi id", () => {
  const sorted = sortTodos([
    { id: 1, done: false, priority: "bassa" },
    { id: 2, done: true, priority: "alta" },
    { id: 3, done: false, priority: "alta" },
    { id: 4, done: false, priority: "media" },
    { id: 5, done: false, priority: "alta" },
  ]);
  assert.deepEqual(sorted.map((t) => t.id), [3, 5, 4, 1, 2]);
});

test("sortTodos mette in fondo le priorità assenti o sconosciute", () => {
  const sorted = sortTodos([
    { id: 1, done: false },
    { id: 2, done: false, priority: "urgente" },
    { id: 3, done: false, priority: "bassa" },
  ]);
  assert.deepEqual(sorted.map((t) => t.id), [3, 1, 2]);
});

test("summary conta le cose ancora da fare", () => {
  assert.equal(summary([{ done: false }, { done: true }]), "1 da fare su 2");
});

test("addTodo rifiuta un titolo vuoto senza chiamare l'API", async () => {
  let called = false;
  const fakeFetch = async () => {
    called = true;
  };
  await assert.rejects(addTodo("   ", "media", fakeFetch), /obbligatorio/);
  assert.equal(called, false);
});

test("addTodo invia il titolo ripulito e la priorità", async () => {
  let sent;
  const fakeFetch = async (url, options) => {
    sent = { url, body: JSON.parse(options.body) };
    return { ok: true, json: async () => ({ id: 1, title: "pane", done: false }) };
  };
  const todo = await addTodo("  pane ", "alta", fakeFetch);
  assert.equal(sent.body.title, "pane");
  assert.equal(sent.body.priority, "alta");
  assert.match(sent.url, /\/api\/todos$/);
  assert.equal(todo.id, 1);
});
