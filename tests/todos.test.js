import { test } from "node:test";
import assert from "node:assert/strict";
import { addTodo, normalizeTitle, PRIORITIES, sortTodos, summary } from "../src/todos.js";

test("normalizeTitle toglie gli spazi e gestisce null", () => {
  assert.equal(normalizeTitle("  pane  "), "pane");
  assert.equal(normalizeTitle(null), "");
});

test("sortTodos mette prima le cose da fare, poi per priorità alta → bassa, poi per id", () => {
  const sorted = sortTodos([
    { id: 2, title: "b", done: true, priority: "alta" },
    { id: 3, title: "c", done: false, priority: "media" },
    { id: 1, title: "a", done: false, priority: "media" },
    { id: 4, title: "d", done: false, priority: "bassa" },
    { id: 5, title: "e", done: false, priority: "alta" },
    { id: 6, title: "f", done: true, priority: "bassa" },
  ]);
  assert.deepEqual(sorted.map((t) => t.id), [5, 1, 3, 4, 2, 6]);
});

test("PRIORITIES elenca i tre valori ammessi", () => {
  assert.deepEqual(PRIORITIES, ["bassa", "media", "alta"]);
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

test("addTodo rifiuta una priorità non valida senza chiamare l'API", async () => {
  let called = false;
  const fakeFetch = async () => {
    called = true;
  };
  await assert.rejects(addTodo("pane", "Alta", fakeFetch), /priority/i);
  assert.equal(called, false);
});

test("addTodo invia il titolo ripulito e la priorità", async () => {
  let sent;
  const fakeFetch = async (url, options) => {
    sent = { url, body: JSON.parse(options.body) };
    return { ok: true, json: async () => ({ id: 1, title: "pane", done: false, priority: "alta" }) };
  };
  const todo = await addTodo("  pane ", "alta", fakeFetch);
  assert.equal(sent.body.title, "pane");
  assert.equal(sent.body.priority, "alta");
  assert.match(sent.url, /\/api\/todos$/);
  assert.equal(todo.id, 1);
});
