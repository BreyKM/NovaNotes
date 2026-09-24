import "./app.css";
import { loadTheme } from "./store/theme";
import Starter from "./lib/Components/StarterWindow/Starter.svelte";
import { mount } from "svelte";

loadTheme();

const target = document.getElementById("starter");
if (!target) {
  throw new Error("Could not find #starter element to mount the app into.");
}

mount(Starter, { target });
