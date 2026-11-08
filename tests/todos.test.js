import { test } from "node:test";
import assert from "node:assert/strict";
import { addTodo, normalizeTitle, setPriority, sortTodos, summary } from "../src/todos.js";

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
  const todo = await addTodo("  pane ", "alta", fakeFetch);
  assert.equal(sent.body.title, "pane");
  assert.equal(sent.body.priority, "alta");
  assert.match(sent.url, /\/api\/todos$/);
  assert.equal(todo.id, 1);
});

test("addTodo usa la priorità media se non è indicata", async () => {
  let sent;
  const fakeFetch = async (url, options) => {
    sent = JSON.parse(options.body);
    return { ok: true, json: async () => ({}) };
  };
  await addTodo("pane", undefined, fakeFetch);
  assert.equal(sent.priority, "media");
});

test("setPriority invia PATCH all'endpoint della priorità", async () => {
  let sent;
  const fakeFetch = async (url, options) => {
    sent = { url, method: options.method, body: JSON.parse(options.body) };
    return { ok: true, json: async () => ({ id: 4, priority: "bassa" }) };
  };
  const todo = await setPriority(4, "bassa", fakeFetch);
  assert.match(sent.url, /\/api\/todos\/4\/priority$/);
  assert.equal(sent.method, "PATCH");
  assert.deepEqual(sent.body, { priority: "bassa" });
  assert.equal(todo.priority, "bassa");
});

test("setPriority segnala gli errori dell'API", async () => {
  await assert.rejects(setPriority(4, "boh", async () => ({ ok: false, status: 400 })), /400/);
});
