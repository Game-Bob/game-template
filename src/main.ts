import { Game } from "./game";
import { createPlatform } from "./platform";
import "./style.css";

const root = document.querySelector<HTMLElement>("#game-root");
if (!root) throw new Error("Missing #game-root element");

const platform = createPlatform();
const game = new Game({ root, platform });

window.addEventListener("beforeunload", () => game.destroy(), { once: true });
