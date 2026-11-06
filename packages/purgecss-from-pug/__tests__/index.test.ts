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

  describe("attribute values", () => {
    it("removes single quotes", () => {
      expect(purgeCSSFromPug(`div(class='card active' id='main')`)).toEqual({
        attributes: {
          names: ["class", "id"],
          values: ["true", "false", "card", "active", "main"],
        },
        classes: ["card", "active"],
        ids: ["main"],
        tags: ["div"],
        undetermined: [],
      });
    });

    it("removes the quotes of unescaped attributes", () => {
      const received = purgeCSSFromPug(
        `a(class!="button" id!='link' data-state!="open")`,
      );
      expect(received.classes).toEqual(["button"]);
      expect(received.ids).toEqual(["link"]);
      expect(received.attributes.values).toEqual([
        "true",
        "false",
        "button",
        "link",
        "open",
      ]);
    });

    it("removes the backticks of template literals", () => {
      expect(purgeCSSFromPug("div(class=`card active`)").classes).toEqual([
        "card",
        "active",
      ]);
    });

    it("keeps quotes inside a string", () => {
      expect(
        purgeCSSFromPug(`img(alt="It's a cat" title='say "hi"')`).attributes
          .values,
      ).toEqual(["true", "false", "It's", "a", "cat", "say", '"hi"']);
    });

    it("finds the strings of an expression", () => {
      expect(
        purgeCSSFromPug(`div(class=active ? "is-on" : 'is-off')`).classes,
      ).toEqual(["active", "?", "is-on", ":", "is-off"]);
    });
  });
});
