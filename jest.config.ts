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
    "node_modules/(parse5|parse5-htmlparser2-tree-adapter|entities|domhandler|domelementtype)/.+\\.js$":
      ["ts-jest", { useESM: false }],
  },
  // `\\.pnpm` keeps pnpm's virtual store (node_modules/.pnpm/<pkg>@<version>/node_modules/<pkg>)
  // from being ignored before the package name can be matched
  transformIgnorePatterns: [
    "node_modules/(?!(\\.pnpm|parse5|parse5-htmlparser2-tree-adapter|entities|domhandler|domelementtype)/)",
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
