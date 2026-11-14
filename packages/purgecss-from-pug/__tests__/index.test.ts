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
          values: ["true", "false", "card", "active", "card active", "main"],
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
      ).toEqual([
        "true",
        "false",
        "It's",
        "a",
        "cat",
        "It's a cat",
        "say",
        '"hi"',
        'say "hi"',
      ]);
    });

    it("reads the escape sequences of a string", () => {
      expect(
        purgeCSSFromPug(String.raw`div(class='it\'s' title="a\tb")`),
      ).toEqual({
        attributes: {
          names: ["class", "id", "title"],
          values: ["true", "false", "it's", "a", "b", "a\tb"],
        },
        classes: ["it's"],
        ids: [],
        tags: ["div"],
        undetermined: [],
      });
    });
  });

  describe("expressions", () => {
    it("finds the strings of a conditional expression", () => {
      expect(purgeCSSFromPug(`div(class=active ? "is-on" : 'is-off')`)).toEqual(
        {
          attributes: {
            names: ["class", "id"],
            values: ["true", "false", "is-on", "is-off"],
          },
          classes: ["is-on", "is-off"],
          ids: [],
          tags: ["div"],
          undetermined: [],
        },
      );
    });

    it("finds the classes of a class array", () => {
      expect(purgeCSSFromPug(`div(class=['foo', 'bar'])`)).toEqual({
        attributes: {
          names: ["class", "id"],
          values: ["true", "false", "foo", "bar"],
        },
        classes: ["foo", "bar"],
        ids: [],
        tags: ["div"],
        undetermined: [],
      });
    });

    it("finds the classes of a class object", () => {
      expect(
        purgeCSSFromPug(`div(class={active: isActive, 'is-open': open})`),
      ).toEqual({
        attributes: {
          names: ["class", "id"],
          values: ["true", "false", "active", "is-open"],
        },
        classes: ["active", "is-open"],
        ids: [],
        tags: ["div"],
        undetermined: [],
      });
    });

    it("finds the classes of nested arrays, objects and conditions", () => {
      expect(
        purgeCSSFromPug(
          `div(class=['btn', {'btn-primary': primary, disabled}, size && 'btn-lg'])`,
        ).classes,
      ).toEqual(["btn", "btn-primary", "disabled", "btn-lg"]);
    });

    it("doesn't use the keys of an object as values of other attributes", () => {
      expect(
        purgeCSSFromPug(`div(style={color: 'red'} data-state={open: "yes"})`)
          .attributes,
      ).toEqual({
        names: ["class", "id", "style", "data-state"],
        values: ["true", "false", "red", "yes"],
      });
    });

    it("finds the strings of a concatenation", () => {
      expect(purgeCSSFromPug(`div(class="a" + ' b')`)).toEqual({
        attributes: {
          names: ["class", "id"],
          values: ["true", "false", "a", "b", " b"],
        },
        classes: ["a", "b"],
        ids: [],
        tags: ["div"],
        undetermined: [],
      });
    });

    it("finds the static parts of a template literal", () => {
      expect(
        purgeCSSFromPug("div(class=`btn btn-${size}` id=`${prefix}`)"),
      ).toEqual({
        attributes: {
          names: ["class", "id"],
          values: ["true", "false", "btn", "btn-", "btn btn-"],
        },
        classes: ["btn", "btn-"],
        ids: [],
        tags: ["div"],
        undetermined: [],
      });
    });

    it("finds numbers", () => {
      expect(
        purgeCSSFromPug(`td(colspan=2 tabindex=-1 data-ratio=1.50)`).attributes,
      ).toEqual({
        names: ["class", "id", "colspan", "tabindex", "data-ratio"],
        values: ["true", "false", "2", "-1", "1.5"],
      });
    });

    it("ignores booleans and null", () => {
      expect(
        purgeCSSFromPug(`input(checked=true hidden=false data-x=null)`)
          .attributes,
      ).toEqual({
        names: ["class", "id", "checked", "hidden", "data-x"],
        values: ["true", "false"],
      });
    });

    it("ignores the names of variables", () => {
      expect(purgeCSSFromPug(`a(class=classes href=url)`)).toEqual({
        attributes: {
          names: ["class", "id", "href"],
          values: ["true", "false"],
        },
        classes: [],
        ids: [],
        tags: ["a"],
        undetermined: [],
      });
    });
  });

  describe("whitespace", () => {
    it("splits a template literal written over several lines", () => {
      expect(purgeCSSFromPug("div(class=`a\n  b`)")).toEqual({
        attributes: {
          names: ["class", "id"],
          values: ["true", "false", "a", "b", "a\n  b"],
        },
        classes: ["a", "b"],
        ids: [],
        tags: ["div"],
        undetermined: [],
      });
    });

    it("drops the empty words between several spaces", () => {
      expect(purgeCSSFromPug(`div(class="a  b" id=" main ")`)).toEqual({
        attributes: {
          names: ["class", "id"],
          values: ["true", "false", "a", "b", "a  b", "main", " main "],
        },
        classes: ["a", "b"],
        ids: ["main"],
        tags: ["div"],
        undetermined: [],
      });
    });

    it("splits on tabs, form feeds and carriage returns", () => {
      expect(purgeCSSFromPug("div(class=`a\tb\fc\rd`)").classes).toEqual([
        "a",
        "b",
        "c",
        "d",
      ]);
    });

    it("doesn't split on a no-break space", () => {
      expect(purgeCSSFromPug(`div(class="a\u00a0b c")`).classes).toEqual([
        "a\u00a0b",
        "c",
      ]);
    });
  });

  describe("whole attribute values", () => {
    it("keeps the whole value of an attribute with several words", () => {
      expect(purgeCSSFromPug(`div(title="hello world")`)).toEqual({
        attributes: {
          names: ["class", "id", "title"],
          values: ["true", "false", "hello", "world", "hello world"],
        },
        classes: [],
        ids: [],
        tags: ["div"],
        undetermined: [],
      });
    });

    it("keeps the whole value of a class attribute", () => {
      expect(purgeCSSFromPug(`div(class='card active')`)).toEqual({
        attributes: {
          names: ["class", "id"],
          values: ["true", "false", "card", "active", "card active"],
        },
        classes: ["card", "active"],
        ids: [],
        tags: ["div"],
        undetermined: [],
      });
    });

    it("doesn't repeat a value of one word", () => {
      expect(purgeCSSFromPug(`input(type="text")`).attributes.values).toEqual([
        "true",
        "false",
        "text",
      ]);
    });

    it("keeps an empty value", () => {
      expect(
        purgeCSSFromPug("div(data-foo=\"\" data-bar='' data-baz=``)"),
      ).toEqual({
        attributes: {
          names: ["class", "id", "data-foo", "data-bar", "data-baz"],
          values: ["true", "false", "", "", ""],
        },
        classes: [],
        ids: [],
        tags: ["div"],
        undetermined: [],
      });
    });

    it("has no value for a boolean attribute", () => {
      expect(purgeCSSFromPug(`input(disabled)`).attributes).toEqual({
        names: ["class", "id", "disabled"],
        values: ["true", "false"],
      });
    });
  });
});
