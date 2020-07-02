export const ROOT_TEST_EXAMPLES =
  "./packages/purgecss/__tests__/test_examples/";

export function findInCSS(
  expect: jest.Expect,
  selectors: string[],
  css: string
): void {
  selectors.forEach((selector) => {
    expect(css.includes(selector)).toBe(true);
  });
}

export function notFindInCSS(
  expect: jest.Expect,
  selectors: string[],
  css: string
): void {
  selectors.forEach((selector) => {
    expect(css.includes(selector)).toBe(false);
  });
}
