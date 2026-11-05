import { fetchCount } from "./todos.js";

const output = document.querySelector("#count");
const error = document.querySelector("#error");

try {
  output.textContent = String(await fetchCount());
} catch (e) {
  output.textContent = "–";
  error.textContent = e.message;
  error.hidden = false;
}
