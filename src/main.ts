import "./app.css";
import { loadTheme } from "./store/theme";
import App from "./App.svelte";
import { mount } from "svelte";

loadTheme();

const target = document.getElementById("app");
if (!target) {
  throw new Error("Could not find #app element to mount the app into.");
}

mount(App, { target });
