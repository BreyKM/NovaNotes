import "./app.css";
import Starter from "./lib/Components/StarterWindow/Starter.svelte";
import { mount } from "svelte";

const target = document.getElementById("starter");
if (!target) {
  throw new Error("Could not find #starter element to mount the app into.");
}

mount(Starter, { target });
