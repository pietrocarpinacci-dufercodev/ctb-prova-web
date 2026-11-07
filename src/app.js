import { addTodo, fetchTodos, isOverdue, markDone, sortTodos, summary, todayLocal } from "./todos.js";

const list = document.querySelector("#todos");
const form = document.querySelector("#new-todo");
const input = document.querySelector("#title");
const due = document.querySelector("#due");
const error = document.querySelector("#error");

function showError(message) {
  error.textContent = message;
  error.hidden = !message;
}

function render(todos) {
  const today = todayLocal();
  list.replaceChildren(
    ...sortTodos(todos).map((todo) => {
      const item = document.createElement("li");
      item.className = todo.done ? "done" : "";
      const label = document.createElement("span");
      label.textContent = todo.title;
      item.append(label);
      if (todo.dueDate) {
        const date = document.createElement("span");
        date.textContent = todo.dueDate;
        date.className = isOverdue(todo, today) ? "due overdue" : "due";
        item.append(date);
      }
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
    await addTodo(input.value, due.value);
    input.value = "";
    due.value = "";
  });
});

run(async () => {});
