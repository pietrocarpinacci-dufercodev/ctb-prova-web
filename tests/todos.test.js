import { test } from "node:test";
import assert from "node:assert/strict";
import { PRIORITIES, addTodo, normalizeTitle, sortTodos, summary } from "../src/todos.js";

test("normalizeTitle toglie gli spazi e gestisce null", () => {
  assert.equal(normalizeTitle("  pane  "), "pane");
  assert.equal(normalizeTitle(null), "");
});

test("PRIORITIES elenca i valori ammessi dall'API", () => {
  assert.deepEqual(PRIORITIES, ["bassa", "media", "alta"]);
});

test("sortTodos mette prima le cose da fare, poi per id", () => {
  const sorted = sortTodos([
    { id: 2, title: "b", done: true },
    { id: 3, title: "c", done: false },
    { id: 1, title: "a", done: false },
  ]);
  assert.deepEqual(sorted.map((t) => t.id), [1, 3, 2]);
});

test("sortTodos ordina per priorità alta, media, bassa dentro fatti e non fatti, poi per id", () => {
  const sorted = sortTodos([
    { id: 1, done: false, priority: "bassa" },
    { id: 2, done: true, priority: "alta" },
    { id: 3, done: false, priority: "media" },
    { id: 4, done: false, priority: "alta" },
    { id: 5, done: false },
    { id: 6, done: true, priority: "bassa" },
    { id: 7, done: false, priority: "alta" },
  ]);
  assert.deepEqual(sorted.map((t) => t.id), [4, 7, 3, 5, 1, 2, 6]);
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
    return { ok: true, json: async () => ({ id: 1, title: "pane", done: false, priority: "alta" }) };
  };
  const todo = await addTodo("  pane ", "alta", fakeFetch);
  assert.deepEqual(sent.body, { title: "pane", priority: "alta" });
  assert.match(sent.url, /\/api\/todos$/);
  assert.equal(todo.id, 1);
});
