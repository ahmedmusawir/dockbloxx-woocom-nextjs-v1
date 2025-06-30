const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  /**
   * Sets up JSDOM as the test environment for browser-like DOM in React tests.
   * Can be overridden for Node.js-only tests.
   */
  testEnvironment: "jsdom",
  transform: {
    ...tsJestTransformCfg,
  },

  /**
   * Maps path aliases (e.g., `@/`) for consistent module resolution with Next.js.
   * Update '<rootDir>/src/$1' if your source path differs.
   */
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  /**
   * Includes global test setup and custom matchers before tests execute.
   */
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};
