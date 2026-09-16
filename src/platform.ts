import { Capacitor } from "@capacitor/core";

export type PlatformKind = "web" | "capacitor" | "electron";

export interface GamePlatform {
    readonly kind: PlatformKind;
    readonly isNative: boolean;
    save(key: string, value: unknown): void;
    load<T>(key: string): T | undefined;
    share(title: string, text: string, url: string): Promise<void>;
    vibrate(pattern?: number | number[]): void;
    requestFullscreen(element: HTMLElement): Promise<void>;
}

interface NativeBridge {
    kind?: PlatformKind;
    save?: (key: string, value: unknown) => void;
    load?: <T>(key: string) => T | undefined;
    share?: (title: string, text: string, url: string) => Promise<void>;
    vibrate?: (pattern?: number | number[]) => void;
}

declare global {
    interface Window {
        gamePlatform?: NativeBridge;
    }
}

const readNativeBridge = (): NativeBridge =>
    typeof window === "undefined" ? {} : (window.gamePlatform ?? {});

export function createPlatform(): GamePlatform {
    const native = readNativeBridge();
    const capacitorKind: PlatformKind = Capacitor.isNativePlatform() ? "capacitor" : "web";
    const kind = native.kind ?? capacitorKind;

    return {
        kind,
        isNative: kind !== "web",
        save(key, value) {
            if (native.save) {
                native.save(key, value);
                return;
            }
            localStorage.setItem(key, JSON.stringify(value));
        },
        load<T>(key: string): T | undefined {
            if (native.load) return native.load<T>(key);
            const stored = localStorage.getItem(key);
            if (!stored) return undefined;
            try {
                return JSON.parse(stored) as T;
            } catch {
                return undefined;
            }
        },
        async share(title, text, url) {
            if (native.share) {
                await native.share(title, text, url);
                return;
            }
            if (navigator.share) {
                await navigator.share({ title, text, url });
                return;
            }
            await navigator.clipboard?.writeText(`${text} ${url}`);
        },
        vibrate(pattern = 20) {
            if (native.vibrate) {
                native.vibrate(pattern);
                return;
            }
            navigator.vibrate?.(pattern);
        },
        async requestFullscreen(element) {
            if (document.fullscreenElement) return;
            await element.requestFullscreen?.();
        },
    };
}
