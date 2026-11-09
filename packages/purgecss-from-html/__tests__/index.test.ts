import purgehtml from "./../src/index";

import {
  TEST_1_CONTENT,
  TEST_1_TAG,
  TEST_1_CLASS,
  TEST_1_ID,
  TEST_1_ATTRIBUTES,
} from "./data";
import { TEST_2_CONTENT, TEST_2_TAG, TEST_2_CLASS, TEST_2_ID } from "./data";

describe("purgehtml", () => {
  const resultTest1 = purgehtml(TEST_1_CONTENT);

  describe("from a normal html document", () => {
    it("finds tag selectors", () => {
      for (const item of TEST_1_TAG) {
        expect(resultTest1.tags.includes(item)).toBe(true);
      }
    });

    it("finds classes selectors", () => {
      for (const item of TEST_1_CLASS) {
        expect(resultTest1.classes.includes(item)).toBe(true);
      }
    });

    it("finds id selectors", () => {
      for (const item of TEST_1_ID) {
        expect(resultTest1.ids.includes(item)).toBe(true);
      }
    });

    it("finds attributes names", () => {
      for (const item of TEST_1_ATTRIBUTES.NAMES) {
        expect(resultTest1.attributes.names.includes(item)).toBe(true);
      }
    });

    it("finds attributes values", () => {
      for (const item of TEST_1_ATTRIBUTES.VALUES) {
        expect(resultTest1.attributes.values.includes(item)).toBe(true);
      }
    });
  });

  const resultTest2 = purgehtml(TEST_2_CONTENT);

  describe("from a template tag", () => {
    it("finds tag selectors", () => {
      for (const item of TEST_2_TAG) {
        expect(resultTest2.tags.includes(item)).toBe(true);
      }
    });

    it("finds classes selectors", () => {
      for (const item of TEST_2_CLASS) {
        expect(resultTest2.classes.includes(item)).toBe(true);
      }
    });

    it("finds id selectors", () => {
      for (const item of TEST_2_ID) {
        expect(resultTest2.ids.includes(item)).toBe(true);
      }
    });

    it("finds all selectors", () => {
      const selectors = [...TEST_2_TAG, ...TEST_2_CLASS, ...TEST_2_ID];
      for (const item of selectors) {
        expect(
          [
            ...resultTest2.classes,
            ...resultTest2.ids,
            ...resultTest2.tags,
          ].includes(item),
        ).toBe(true);
      }
    });
  });

  describe("whitespace in attribute values", () => {
    it("splits on new lines and tabs", () => {
      const received = purgehtml(
        `<div class="card\n    active\tshadow" id="main"></div>`,
      );
      expect(received.classes).toEqual(["card", "active", "shadow"]);
      expect(received.ids).toEqual(["main"]);
      expect(received.attributes.values).toEqual([
        "card",
        "active",
        "shadow",
        "main",
      ]);
    });

    it("ignores leading, trailing and repeated whitespace", () => {
      const received = purgehtml(`<p class="  lead\n\n  muted  "></p>`);
      expect(received.classes).toEqual(["lead", "muted"]);
      expect(received.attributes.values).toEqual(["lead", "muted"]);
    });
  });
});
