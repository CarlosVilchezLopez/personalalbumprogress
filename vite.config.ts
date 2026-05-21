import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { devBackupPlugin } from "./scripts/devBackupPlugin";

export default defineConfig({
  plugins: [react(), devBackupPlugin()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"]
  }
});
