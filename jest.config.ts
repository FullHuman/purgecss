import type { InitialOptionsTsJest } from "ts-jest";

const config: InitialOptionsTsJest = {
  preset: "ts-jest",
  coverageDirectory: "coverage",
  coverageReporters: ["html", "lcov", "text"],
  collectCoverageFrom: ["<rootDir>/src/**/*.ts"],
  moduleFileExtensions: ["ts", "tsx", "js", "json"],
  moduleNameMapper: {
    "^purgecss-from-html$": "<rootDir>/../purgecss-from-html/src",
  },
  testMatch: ["<rootDir>/__tests__/**/*test.ts"],
  globals: {
    "ts-jest": {
      tsconfig: {
        types: ["jest"],
      },
    },
  },
};

export function createConfig(
  rootDir: string,
  displayName: string
): InitialOptionsTsJest {
  return {
    ...config,
    rootDir,
    displayName,
  };
}

export default config;
