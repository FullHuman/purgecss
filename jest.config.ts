import type { JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
  preset: "ts-jest",
  coverageDirectory: "coverage",
  coverageReporters: ["html", "lcov", "text"],
  collectCoverageFrom: ["<rootDir>/src/**/*.ts"],
  moduleFileExtensions: ["ts", "tsx", "js", "json"],
  moduleNameMapper: {
    "^purgecss-from-html$": "<rootDir>/../purgecss-from-html/src",
  },
  testMatch: ["<rootDir>/__tests__/**/*test.ts"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {}],
    "node_modules/(parse5|parse5-htmlparser2-tree-adapter)/.+\\.js$": [
      "ts-jest",
      { useESM: false },
    ],
  },
  transformIgnorePatterns: [
    "node_modules/(?!(parse5|parse5-htmlparser2-tree-adapter)/)",
  ],
};

export function createConfig(
  rootDir: string,
  displayName: string,
): JestConfigWithTsJest {
  return {
    ...config,
    rootDir,
    displayName,
  };
}

export default config;
