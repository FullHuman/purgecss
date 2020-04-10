import purgehtml from "./../src/index";

import { TEST_1_CONTENT, TEST_1_TAG, TEST_1_CLASS, TEST_1_ID } from "./data";
import { TEST_2_CONTENT, TEST_2_TAG, TEST_2_CLASS, TEST_2_ID } from "./data";

describe("purgehtml", () => {
  describe("from a normal html document", () => {
    it("finds tag selectors", () => {
      const received = purgehtml(TEST_1_CONTENT);
      for (const item of TEST_1_TAG) {
        expect(received.includes(item)).toBe(true);
      }
    });

    it("finds classes selectors", () => {
      const received = purgehtml(TEST_1_CONTENT);
      for (const item of TEST_1_CLASS) {
        expect(received.includes(item)).toBe(true);
      }
    });

    it("finds id selectors", () => {
      const received = purgehtml(TEST_1_CONTENT);
      for (const item of TEST_1_ID) {
        expect(received.includes(item)).toBe(true);
      }
    });

    it("finds all selectors", () => {
      const received = purgehtml(TEST_1_CONTENT);
      const selectors = [...TEST_1_TAG, ...TEST_1_CLASS, ...TEST_1_ID];
      for (const item of selectors) {
        expect(received.includes(item)).toBe(true);
      }
    });
  });

  describe("from a template tag", () => {
    it("finds tag selectors", () => {
      const received = purgehtml(TEST_2_CONTENT);
      for (const item of TEST_2_TAG) {
        expect(received.includes(item)).toBe(true);
      }
    });

    it("finds classes selectors", () => {
      const received = purgehtml(TEST_2_CONTENT);
      for (const item of TEST_2_CLASS) {
        expect(received.includes(item)).toBe(true);
      }
    });

    it("finds id selectors", () => {
      const received = purgehtml(TEST_2_CONTENT);
      for (const item of TEST_2_ID) {
        expect(received.includes(item)).toBe(true);
      }
    });

    it("finds all selectors", () => {
      const received = purgehtml(TEST_2_CONTENT);
      const selectors = [...TEST_2_TAG, ...TEST_2_CLASS, ...TEST_2_ID];
      for (const item of selectors) {
        expect(received.includes(item)).toBe(true);
      }
    });
  });
});
