import purgePug from "../src/index";

import { TEST_1_CONTENT, TEST_1_TAG, TEST_1_CLASS, TEST_1_ID } from "./data";

describe("purgePug", () => {
  describe("from a normal html document", () => {
    it("finds tag selectors", () => {
      const received = purgePug(TEST_1_CONTENT);
      for (let item of TEST_1_TAG) {
        expect(received.includes(item)).toBe(true);
      }
    });

    it("finds classes selectors", () => {
      const received = purgePug(TEST_1_CONTENT);
      for (let item of TEST_1_CLASS) {
        expect(received.includes(item)).toBe(true);
      }
    });

    it("finds id selectors", () => {
      const received = purgePug(TEST_1_CONTENT);
      for (let item of TEST_1_ID) {
        expect(received.includes(item)).toBe(true);
      }
    });

    it("finds all selectors", () => {
      const received = purgePug(TEST_1_CONTENT);
      const selectors = [...TEST_1_TAG, ...TEST_1_CLASS, ...TEST_1_ID];
      for (let item of selectors) {
        expect(received.includes(item)).toBe(true);
      }
    });
  });
});
