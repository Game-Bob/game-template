import type { GamePlatform } from "../platform";
import { GAME_CONFIG } from "./game-config";

export interface GameOptions {
    root: HTMLElement;
    platform: GamePlatform;
}

interface Point {
    x: number;
    y: number;
}

const SAVE_KEY = `${GAME_CONFIG.id}:best-score`;

export class Game {
    private readonly root: HTMLElement;
    private readonly platform: GamePlatform;
    private readonly canvas: HTMLCanvasElement;
    private readonly context: CanvasRenderingContext2D;
    private readonly scoreElement: HTMLElement;
    private readonly bestElement: HTMLElement;
    private readonly startButton: HTMLButtonElement;
    private readonly resizeObserver: ResizeObserver;
    private animationFrame = 0;
    private lastTime = 0;
    private running = false;
    private score = 0;
    private bestScore: number;
    private player: Point = { x: 0, y: 0 };
    private target: Point = { x: 0, y: 0 };
    private readonly pointer = { active: false, x: 0, y: 0 };

    constructor({ root, platform }: GameOptions) {
        this.root = root;
        this.platform = platform;
        this.bestScore = platform.load<number>(SAVE_KEY) ?? 0;
        this.canvas = document.createElement("canvas");
        this.canvas.className = "game-canvas";
        this.canvas.setAttribute("aria-label", "Playable game area");
        this.context = this.canvas.getContext("2d")!;
        this.startButton = document.createElement("button");
        this.startButton.className = "game-start-button";
        this.startButton.type = "button";
        this.startButton.textContent = "Start run";
        const header = this.createHeader();
        this.root.replaceChildren(header, this.canvas, this.startButton);
        this.scoreElement = header.querySelector<HTMLElement>("#game-score")!;
        this.bestElement = header.querySelector<HTMLElement>("#game-best")!;
        this.resizeObserver = new ResizeObserver(() => this.resize());
        this.resizeObserver.observe(this.root);
        this.bindInput();
        this.resize();
        this.reset();
    }

    start(): void {
        if (this.running) return;
        this.running = true;
        this.startButton.textContent = "Restart run";
        this.score = 0;
        this.lastTime = performance.now();
        this.placeTarget();
        this.platform.vibrate(15);
        this.animationFrame = requestAnimationFrame(this.tick);
    }

    destroy(): void {
        cancelAnimationFrame(this.animationFrame);
        this.resizeObserver.disconnect();
        this.root.replaceChildren();
    }

    private createHeader(): HTMLElement {
        const header = document.createElement("header");
        header.className = "game-hud";
        header.innerHTML = `<div><span>Score</span><strong id="game-score">0</strong></div><div><span>Best</span><strong id="game-best">0</strong></div>`;
        return header;
    }

    private bindInput(): void {
        this.startButton.addEventListener("click", () => this.start());
        this.canvas.addEventListener("pointermove", this.onPointerMove);
        this.canvas.addEventListener("pointerdown", this.onPointerDown);
        this.canvas.addEventListener("pointerup", this.onPointerUp);
        window.addEventListener("keydown", this.onKeyDown);
    }

    private readonly onPointerMove = (event: PointerEvent): void => {
        const rect = this.canvas.getBoundingClientRect();
        this.pointer.x = event.clientX - rect.left;
        this.pointer.y = event.clientY - rect.top;
    };

    private readonly onPointerDown = (event: PointerEvent): void => {
        this.pointer.active = true;
        this.canvas.setPointerCapture(event.pointerId);
        this.onPointerMove(event);
        if (!this.running) this.start();
    };

    private readonly onPointerUp = (): void => {
        this.pointer.active = false;
    };

    private readonly onKeyDown = (event: KeyboardEvent): void => {
        if (event.key === " " || event.key === "Enter") {
            event.preventDefault();
            this.start();
        }
    };

    private readonly tick = (time: number): void => {
        const delta = Math.min((time - this.lastTime) / 1000, 0.05);
        this.lastTime = time;
        this.update(delta);
        this.draw();
        if (this.running) this.animationFrame = requestAnimationFrame(this.tick);
    };

    private update(delta: number): void {
        const dx = this.target.x - this.player.x;
        const dy = this.target.y - this.player.y;
        const distance = Math.hypot(dx, dy);
        if (distance > 1) {
            const speed = 260 * delta;
            this.player.x += (dx / distance) * Math.min(speed, distance);
            this.player.y += (dy / distance) * Math.min(speed, distance);
        }
        if (distance < 20) {
            this.score += 1;
            this.scoreElement.textContent = String(this.score);
            this.platform.vibrate(10);
            if (this.score > this.bestScore) {
                this.bestScore = this.score;
                this.bestElement.textContent = String(this.bestScore);
                this.platform.save(SAVE_KEY, this.bestScore);
            }
            this.placeTarget();
        }
    }

    private reset(): void {
        this.score = 0;
        this.scoreElement.textContent = "0";
        this.bestElement.textContent = String(this.bestScore);
        this.player = { x: this.canvas.clientWidth / 2, y: this.canvas.clientHeight / 2 };
        this.placeTarget();
        this.draw();
    }

    private placeTarget(): void {
        const padding = 48;
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        this.target = {
            x: padding + Math.random() * Math.max(0, width - padding * 2),
            y: padding + Math.random() * Math.max(0, height - padding * 2),
        };
    }

    private resize(): void {
        const rect = this.root.getBoundingClientRect();
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        this.canvas.width = Math.max(1, Math.floor(rect.width * ratio));
        this.canvas.height = Math.max(1, Math.floor(rect.height * ratio));
        this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
        this.draw();
    }

    private draw(): void {
        const rect = this.root.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        this.context.clearRect(0, 0, width, height);
        this.context.fillStyle = "#0b1824";
        this.context.fillRect(0, 0, width, height);
        this.context.strokeStyle = "rgba(96, 231, 209, 0.08)";
        this.context.lineWidth = 1;
        for (let x = 0; x < width; x += 48) {
            this.context.beginPath();
            this.context.moveTo(x, 0);
            this.context.lineTo(x, height);
            this.context.stroke();
        }
        for (let y = 0; y < height; y += 48) {
            this.context.beginPath();
            this.context.moveTo(0, y);
            this.context.lineTo(width, y);
            this.context.stroke();
        }
        this.context.fillStyle = "#ffcc66";
        this.context.beginPath();
        this.context.arc(this.target.x, this.target.y, 12, 0, Math.PI * 2);
        this.context.fill();
        this.context.fillStyle = "#60e7d1";
        this.context.beginPath();
        this.context.arc(this.player.x, this.player.y, 18, 0, Math.PI * 2);
        this.context.fill();
        this.context.strokeStyle = "rgba(96, 231, 209, 0.5)";
        this.context.lineWidth = 3;
        this.context.stroke();
    }
}
