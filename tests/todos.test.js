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

test("sortTodos ordina i non fatti per priorità decrescente, poi id; fatti in fondo", () => {
  const sorted = sortTodos([
    { id: 1, done: false, priority: "bassa" },
    { id: 2, done: false, priority: "alta" },
    { id: 3, done: true, priority: "alta" },
    { id: 4, done: false, priority: "media" },
    { id: 5, done: false, priority: "alta" },
    { id: 6, done: false },
  ]);
  assert.deepEqual(sorted.map((t) => t.id), [2, 5, 4, 1, 6, 3]);
});

test("addTodo invia la priorità scelta, default media", async () => {
  const bodies = [];
  const fakeFetch = async (url, options) => {
    bodies.push(JSON.parse(options.body));
    return { ok: true, json: async () => ({}) };
  };
  await addTodo("a", "alta", fakeFetch);
  await addTodo("b", undefined, fakeFetch);
  assert.equal(bodies[0].priority, "alta");
  assert.equal(bodies[1].priority, "media");
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

test("addTodo invia il titolo ripulito", async () => {
  let sent;
  const fakeFetch = async (url, options) => {
    sent = { url, body: JSON.parse(options.body) };
    return { ok: true, json: async () => ({ id: 1, title: "pane", done: false }) };
  };
  const todo = await addTodo("  pane ", "media", fakeFetch);
  assert.equal(sent.body.title, "pane");
  assert.match(sent.url, /\/api\/todos$/);
  assert.equal(todo.id, 1);
});
