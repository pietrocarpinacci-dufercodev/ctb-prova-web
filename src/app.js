import { addTodo, fetchTodos, markDone, setPriority, sortTodos, summary } from "./todos.js";

const list = document.querySelector("#todos");
const form = document.querySelector("#new-todo");
const input = document.querySelector("#title");
const prioritySelect = document.querySelector("#priority");
const error = document.querySelector("#error");

const LABELS = { high: "alta", medium: "media", low: "bassa", none: "nessuna" };

// "none" è solo il valore del select: verso l'API diventa null.
const toApi = (value) => (value === "none" ? null : value);

function showError(message) {
  error.textContent = message;
  error.hidden = !message;
}

function prioritySelectFor(todo) {
  const select = document.createElement("select");
  select.setAttribute("aria-label", `Priorità di ${todo.title}`);
  for (const [value, label] of Object.entries(LABELS)) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    select.append(option);
  }
  select.value = todo.priority ?? "none";
  select.addEventListener("change", () => run(() => setPriority(todo.id, toApi(select.value))));
  return select;
}

function render(todos) {
  list.replaceChildren(
    ...sortTodos(todos).map((todo) => {
      const item = document.createElement("li");
      item.className = todo.done ? "done" : "";
      const label = document.createElement("span");
      label.textContent = todo.title;
      item.append(label, prioritySelectFor(todo));
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
    await addTodo(input.value, toApi(prioritySelect.value));
    input.value = "";
    prioritySelect.selectedIndex = 0;
  });
});

run(async () => {});
