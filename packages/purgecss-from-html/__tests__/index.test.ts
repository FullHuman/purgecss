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
        "card\n    active\tshadow",
        "main",
      ]);
    });

    it("ignores leading, trailing and repeated whitespace", () => {
      const received = purgehtml(`<p class="  lead\n\n  muted  "></p>`);
      expect(received.classes).toEqual(["lead", "muted"]);
      expect(received.attributes.values).toEqual([
        "lead",
        "muted",
        "  lead\n\n  muted  ",
      ]);
    });

    it("splits on form feeds and carriage returns", () => {
      const received = purgehtml(`<p class="lead\r\nmuted\fsmall"></p>`);
      expect(received.classes).toEqual(["lead", "muted", "small"]);
    });

    it("does not split on a no-break space", () => {
      const received = purgehtml(`<p class="lead\u00a0muted small"></p>`);
      expect(received.classes).toEqual(["lead\u00a0muted", "small"]);
    });

    it("keeps an empty attribute value", () => {
      const received = purgehtml(`<img alt="" src="a.png"><input disabled>`);
      expect(received.attributes.names).toEqual(["alt", "src", "disabled"]);
      expect(received.attributes.values).toEqual(["", "a.png", ""]);
    });

    it("does not add an empty class or id", () => {
      const received = purgehtml(`<p class="" id=""></p>`);
      expect(received.classes).toEqual([]);
      expect(received.ids).toEqual([]);
    });

    it("keeps the whole value of an attribute with several words", () => {
      const received = purgehtml(
        `<a title="hello world" class="card active" href="#">a</a>`,
      );
      expect(received.classes).toEqual(["card", "active"]);
      expect(received.attributes.values).toEqual([
        "hello",
        "world",
        "hello world",
        "card",
        "active",
        "card active",
        "#",
      ]);
    });

    it("adds the value of an attribute with one word once", () => {
      const received = purgehtml(`<a title="hello" href="#">a</a>`);
      expect(received.attributes.values).toEqual(["hello", "#"]);
    });
  });
});
