import { test } from "node:test";
import assert from "node:assert/strict";
import { addTodo, deleteTodo, normalizeTitle, sortTodos, summary } from "../src/todos.js";

test("deleteTodo invia DELETE e restituisce l'elemento rimosso", async () => {
  let sent;
  const fakeFetch = async (url, options) => {
    sent = { url, method: options.method };
    return { ok: true, status: 200, json: async () => ({ id: 4, title: "pane", done: false }) };
  };
  const todo = await deleteTodo(4, fakeFetch);
  assert.equal(sent.method, "DELETE");
  assert.match(sent.url, /\/api\/todos\/4$/);
  assert.equal(todo.id, 4);
});

test("deleteTodo segnala il 404 con un messaggio leggibile", async () => {
  const fakeFetch = async () => ({ ok: false, status: 404 });
  await assert.rejects(deleteTodo(4, fakeFetch), (e) => e.status === 404 && /non esiste più/.test(e.message));
});

test("deleteTodo segnala gli altri errori con lo stato", async () => {
  const fakeFetch = async () => ({ ok: false, status: 500 });
  await assert.rejects(deleteTodo(4, fakeFetch), (e) => e.status === 500 && e.message === "errore 500");
});

test("deleteTodo segnala l'API non raggiungibile", async () => {
  const fakeFetch = async () => {
    throw new TypeError("fetch failed");
  };
  await assert.rejects(deleteTodo(4, fakeFetch), /API non raggiungibile/);
});

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
  await assert.rejects(addTodo("   ", fakeFetch), /obbligatorio/);
  assert.equal(called, false);
});

test("addTodo invia il titolo ripulito", async () => {
  let sent;
  const fakeFetch = async (url, options) => {
    sent = { url, body: JSON.parse(options.body) };
    return { ok: true, json: async () => ({ id: 1, title: "pane", done: false }) };
  };
  const todo = await addTodo("  pane ", fakeFetch);
  assert.equal(sent.body.title, "pane");
  assert.match(sent.url, /\/api\/todos$/);
  assert.equal(todo.id, 1);
});
