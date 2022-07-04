import purgeJsx from "../src/index";

import { TEST_1_CONTENT, TEST_1_TAG, TEST_1_CLASS, TEST_1_ID } from "./data";

const plugin = purgeJsx({
  ecmaVersion: "latest",
  sourceType: "module",
});

describe("purgePug", () => {
  describe("from a normal html document", () => {
    it("finds tag selectors", () => {
      const received = plugin(TEST_1_CONTENT);
      for (const item of TEST_1_TAG) {
        expect(received.includes(item)).toBe(true);
      }
    });

    it("finds classes selectors", () => {
      const received = plugin(TEST_1_CONTENT);
      for (const item of TEST_1_CLASS) {
        expect(received.includes(item)).toBe(true);
      }
    });

    it("finds id selectors", () => {
      const received = plugin(TEST_1_CONTENT);
      for (const item of TEST_1_ID) {
        expect(received.includes(item)).toBe(true);
      }
    });

    it("finds all selectors", () => {
      const received = plugin(TEST_1_CONTENT);
      const selectors = [...TEST_1_TAG, ...TEST_1_CLASS, ...TEST_1_ID];
      for (const item of selectors) {
        expect(received.includes(item)).toBe(true);
      }
    });
  });
});
