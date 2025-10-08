/** @type {import("jest").Config} **/
module.exports = {
  /**
   * Sets up JSDOM as the test environment for browser-like DOM in React tests.
   */
  testEnvironment: "jsdom",
  
  /**
   * Transform TypeScript and TSX files with ts-jest
   */
  preset: "ts-jest",
  
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react-jsx", // ← Use new JSX transform (React 17+)
          esModuleInterop: true,
        },
      },
    ],
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
