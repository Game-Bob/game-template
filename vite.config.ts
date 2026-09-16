import { defineConfig } from "vite";

export default defineConfig({
    base: "./",
    build: {
        assetsDir: "_games",
        emptyOutDir: true,
    },
});
