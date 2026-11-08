import { addTodo, fetchTodos, markDone, sortTodos, summary } from "./todos.js";

const list = document.querySelector("#todos");
const form = document.querySelector("#new-todo");
const input = document.querySelector("#title");
const priority = document.querySelector("#priority");
const error = document.querySelector("#error");

function showError(message) {
  error.textContent = message;
  error.hidden = !message;
}

function render(todos) {
  list.replaceChildren(
    ...sortTodos(todos).map((todo) => {
      const item = document.createElement("li");
      item.className = todo.done ? "done" : "";
      const label = document.createElement("span");
      label.textContent = todo.title;
      const badge = document.createElement("span");
      badge.className = `priority ${todo.priority}`;
      badge.textContent = todo.priority;
      item.append(label, badge);
      if (!todo.done) {
        const button = document.createElement("button");
        button.textContent = "Fatto";
        button.addEventListener("click", () => run(() => markDone(todo.id)));
        item.append(button);
      }
      return item;
    }),
  );
  document.title = `Cose da fare (${summary(todos)})`;
}

async function run(action) {
  try {
    showError("");
    await action();
    render(await fetchTodos());
  } catch (e) {
    showError(e.message);
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  run(async () => {
    await addTodo(input.value, priority.value);
    input.value = "";
  });
});

run(async () => {});
