import type { JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
  preset: "ts-jest",
  coverageDirectory: "coverage",
  // `projectRoot` writes the lcov `SF:` paths relative to the repository root
  // (packages/<name>/src/...) instead of relative to each package (src/...),
  // so that Coveralls attributes the coverage to the files of each package
  coverageReporters: ["html", ["lcov", { projectRoot: __dirname }], "text"],
  collectCoverageFrom: ["<rootDir>/src/**/*.ts"],
  moduleFileExtensions: ["ts", "tsx", "js", "json"],
  moduleNameMapper: {
    "^purgecss-from-html$": "<rootDir>/../purgecss-from-html/src",
  },
  testMatch: ["<rootDir>/__tests__/**/*test.ts"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {}],
    "node_modules/(parse5|parse5-htmlparser2-tree-adapter|entities|domhandler|domelementtype|commander|through2)/.+\\.js$":
      ["ts-jest", { useESM: false }],
  },
  // `\\.pnpm` keeps pnpm's virtual store (node_modules/.pnpm/<pkg>@<version>/node_modules/<pkg>)
  // from being ignored before the package name can be matched
  transformIgnorePatterns: [
    "node_modules/(?!(\\.pnpm|parse5|parse5-htmlparser2-tree-adapter|entities|domhandler|domelementtype|commander|through2)/)",
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
