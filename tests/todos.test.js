import { test } from "node:test";
import assert from "node:assert/strict";
import { addTodo, DEFAULT_PRIORITY, normalizeTitle, PRIORITIES, setPriority, sortTodos, summary } from "../src/todos.js";

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

test("le priorità sono bassa, media e alta, con default media", () => {
  assert.deepEqual(PRIORITIES, ["bassa", "media", "alta"]);
  assert.equal(DEFAULT_PRIORITY, "media");
});

test("addTodo senza priorità invia quella di default", async () => {
  let body;
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    body = JSON.parse(options.body);
    return { ok: true, json: async () => ({}) };
  };
  try {
    await addTodo("pane");
  } finally {
    globalThis.fetch = realFetch;
  }
  assert.equal(body.priority, "media");
});

test("setPriority chiama PUT /api/todos/{id}/priority con la priorità", async () => {
  let sent;
  const fakeFetch = async (url, options) => {
    sent = { url, method: options.method, body: JSON.parse(options.body) };
    return { ok: true, json: async () => ({ id: 7, priority: "bassa" }) };
  };
  const todo = await setPriority(7, "bassa", fakeFetch);
  assert.match(sent.url, /\/api\/todos\/7\/priority$/);
  assert.equal(sent.method, "PUT");
  assert.deepEqual(sent.body, { priority: "bassa" });
  assert.equal(todo.priority, "bassa");
});

test("setPriority solleva un errore se la risposta non è ok", async () => {
  const fakeFetch = async () => ({ ok: false, status: 404 });
  await assert.rejects(setPriority(9999, "alta", fakeFetch), /404/);
});

test("addTodo solleva un errore se l'API rifiuta la priorità", async () => {
  let body;
  const fakeFetch = async (url, options) => {
    body = JSON.parse(options.body);
    return { ok: false, status: 400 };
  };
  await assert.rejects(addTodo("pane", "urgente", fakeFetch), /400/);
  assert.equal(body.priority, "urgente");
});
