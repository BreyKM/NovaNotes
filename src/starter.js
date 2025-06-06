import "./app.css";
import App from "./App.svelte";
import Starter from "./lib/Components/StarterWindow/Starter.svelte";
import { mount } from "svelte";

const app = mount(Starter, { target: document.getElementById("starter") });

export default starter;