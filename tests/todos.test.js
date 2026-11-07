import { test } from "node:test";
import assert from "node:assert/strict";
import { addTodo, isOverdue, normalizeTitle, sortTodos, summary, todayLocal } from "../src/todos.js";

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
  await assert.rejects(addTodo("   ", "", fakeFetch), /obbligatorio/);
  assert.equal(called, false);
});

test("addTodo invia il titolo ripulito", async () => {
  let sent;
  const fakeFetch = async (url, options) => {
    sent = { url, body: JSON.parse(options.body) };
    return { ok: true, json: async () => ({ id: 1, title: "pane", done: false }) };
  };
  const todo = await addTodo("  pane ", "", fakeFetch);
  assert.equal(sent.body.title, "pane");
  assert.match(sent.url, /\/api\/todos$/);
  assert.equal(todo.id, 1);
});

test("isOverdue: scaduto solo se aperto e con data precedente a oggi", () => {
  assert.equal(isOverdue({ done: false, dueDate: "2031-06-14" }, "2031-06-15"), true);
  assert.equal(isOverdue({ done: false, dueDate: "2031-06-15" }, "2031-06-15"), false);
  assert.equal(isOverdue({ done: false, dueDate: null }, "2031-06-15"), false);
  assert.equal(isOverdue({ done: true, dueDate: "2031-06-14" }, "2031-06-15"), false);
});

test("todayLocal usa la data locale e non UTC", () => {
  assert.equal(todayLocal(new Date(2031, 0, 5, 0, 30)), "2031-01-05");
});

test("addTodo invia dueDate solo se valorizzata", async () => {
  const bodies = [];
  const fakeFetch = async (url, options) => {
    bodies.push(JSON.parse(options.body));
    return { ok: true, json: async () => ({}) };
  };
  await addTodo("pane", "2031-06-15", fakeFetch);
  await addTodo("latte", "", fakeFetch);
  assert.deepEqual(bodies, [{ title: "pane", dueDate: "2031-06-15" }, { title: "latte" }]);
});
