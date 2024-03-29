import * as path from "path";

export const ROOT_TEST_EXAMPLES = "./__tests__/test_examples/";
export const CLI_TEST_FOLDER = path.resolve(
  __dirname,
  "./test_examples/cli/simple/",
);

export function findInCSS(
  expect: jest.Expect,
  selectors: string[],
  css: string,
): void {
  selectors.forEach((selector) => {
    expect(css.includes(selector)).toBe(true);
  });
}

export function notFindInCSS(
  expect: jest.Expect,
  selectors: string[],
  css: string,
): void {
  selectors.forEach((selector) => {
    expect(css.includes(selector)).toBe(false);
  });
}
