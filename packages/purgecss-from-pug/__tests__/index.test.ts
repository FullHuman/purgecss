import { purgeCSSFromPug } from "../src/index";

import {
  TEST_1_CONTENT,
  TEST_1_TAG,
  TEST_1_CLASS,
  TEST_1_ID,
  TEST_1_ATTRIBUTE_NAMES,
  TEST_1_ATTRIBUTE_VALUES,
} from "./data";

describe("purgeCSSFromPug", () => {
  describe("from a normal html document", () => {
    it("finds tag selectors", () => {
      const received = purgeCSSFromPug(TEST_1_CONTENT);
      for (const item of TEST_1_TAG) {
        expect(received.tags.includes(item)).toBe(true);
      }
    });

    it("finds classes selectors", () => {
      const received = purgeCSSFromPug(TEST_1_CONTENT);
      for (const item of TEST_1_CLASS) {
        expect(received.classes.includes(item)).toBe(true);
      }
    });

    it("finds id selectors", () => {
      const received = purgeCSSFromPug(TEST_1_CONTENT);
      for (const item of TEST_1_ID) {
        expect(received.ids.includes(item)).toBe(true);
      }
    });

    it("finds attributes names", () => {
      const received = purgeCSSFromPug(TEST_1_CONTENT);
      for (const item of TEST_1_ATTRIBUTE_NAMES) {
        expect(received.attributes.names.includes(item)).toBe(true);
      }
    });

    it("finds attributes values", () => {
      const received = purgeCSSFromPug(TEST_1_CONTENT);
      for (const item of TEST_1_ATTRIBUTE_VALUES) {
        expect(received.attributes.values.includes(item)).toBe(true);
      }
    });
  });
});
