import { test } from "node:test";
import assert from "node:assert/strict";
import { addTodo, normalizeTitle, setPriority, sortTodos, summary } from "../src/todos.js";

test("normalizeTitle toglie gli spazi e gestisce null", () => {
  assert.equal(normalizeTitle("  pane  "), "pane");
  assert.equal(normalizeTitle(null), "");
});

test("sortTodos: non fatte prima, poi high, medium, low, senza priorità, poi id", () => {
  const sorted = sortTodos([
    { id: 1, done: true, priority: "high" },
    { id: 2, done: false, priority: null },
    { id: 3, done: false, priority: "low" },
    { id: 4, done: false, priority: "high" },
    { id: 5, done: false, priority: "medium" },
    { id: 6, done: false, priority: "high" },
    { id: 7, done: true, priority: null },
    { id: 8, done: true, priority: "low" },
  ]);
  assert.deepEqual(sorted.map((t) => t.id), [4, 6, 5, 3, 2, 1, 8, 7]);
});

test("summary conta le cose ancora da fare", () => {
  assert.equal(summary([{ done: false }, { done: true }]), "1 da fare su 2");
});

test("addTodo rifiuta un titolo vuoto senza chiamare l'API", async () => {
  let called = false;
  const fakeFetch = async () => {
    called = true;
  };
  await assert.rejects(addTodo("   ", "high", fakeFetch), /obbligatorio/);
  assert.equal(called, false);
});

test("addTodo invia titolo ripulito e priorità", async () => {
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

test("addTodo invia sempre priority, anche null", async () => {
  let sent;
  const fakeFetch = async (url, options) => {
    sent = JSON.parse(options.body);
    return { ok: true, json: async () => ({}) };
  };
  await addTodo("pane", null, fakeFetch);
  assert.deepEqual(sent, { title: "pane", priority: null });
  await addTodo("pane", undefined, fakeFetch);
  assert.deepEqual(sent, { title: "pane", priority: null });
});

test("setPriority fa PATCH con solo la priorità, anche null", async () => {
  const calls = [];
  const fakeFetch = async (url, options) => {
    calls.push({ url, method: options.method, body: JSON.parse(options.body) });
    return { ok: true, json: async () => ({ id: 7 }) };
  };
  await setPriority(7, "low", fakeFetch);
  await setPriority(7, null, fakeFetch);
  assert.match(calls[0].url, /\/api\/todos\/7$/);
  assert.equal(calls[0].method, "PATCH");
  assert.deepEqual(calls[0].body, { priority: "low" });
  assert.deepEqual(calls[1].body, { priority: null });
});

test("setPriority segnala l'errore dell'API", async () => {
  const fakeFetch = async () => ({ ok: false, status: 400 });
  await assert.rejects(setPriority(7, "x", fakeFetch), /errore 400/);
});
