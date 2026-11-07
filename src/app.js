import { addTodo, deleteTodo, fetchTodos, markDone, sortTodos, summary } from "./todos.js";

const list = document.querySelector("#todos");
const form = document.querySelector("#new-todo");
const input = document.querySelector("#title");
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
      item.append(label);
      if (!todo.done) {
        const button = document.createElement("button");
        button.textContent = "Fatto";
        button.addEventListener("click", () => run(() => markDone(todo.id)));
        item.append(button);
      }
      const remove = document.createElement("button");
      remove.textContent = "Elimina";
      remove.addEventListener("click", () => {
        if (confirm(`Eliminare "${todo.title}"?`)) {
          run(() => deleteTodo(todo.id));
        }
      });
      item.append(remove);
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
    await addTodo(input.value);
    input.value = "";
  });
});

run(async () => {});
