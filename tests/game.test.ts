import { describe, expect, it } from "vitest";
import { GAME_CONFIG } from "../src/game/game-config";

describe("game template", () => {
    it("exposes an itch-safe slug", () => {
        expect(GAME_CONFIG.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    });

    it("keeps the native app id namespaced", () => {
        expect(GAME_CONFIG.appId).toMatch(/^com\.gamebob\./);
    });
});
