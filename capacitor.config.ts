import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
    appId: "com.gamebob.game",
    appName: "Game Template",
    webDir: "dist",
    server: {
        androidScheme: "https",
    },
};

export default config;
