import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    silent: false,
    environment: "node",
    setupFiles: ["./test/utils/vitest.setup.ts"],
    include: ["src/**/*.{test,spec}.ts", "test/**/*.{test,spec}.ts"],
    maxConcurrency: 1,
  },
});
