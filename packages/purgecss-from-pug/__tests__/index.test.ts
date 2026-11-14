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

  describe("&attributes", () => {
    it("finds the attributes of an object", () => {
      expect(
        purgeCSSFromPug(
          `div&attributes({class: 'foo bar', id: 'main', title: 'hello world'})`,
        ),
      ).toEqual({
        attributes: {
          names: ["class", "id", "title"],
          values: [
            "true",
            "false",
            "foo",
            "bar",
            "foo bar",
            "main",
            "hello",
            "world",
            "hello world",
          ],
        },
        classes: ["foo", "bar"],
        ids: ["main"],
        tags: ["div"],
        undetermined: [],
      });
    });

    it("finds the classes of a class array and a class object", () => {
      expect(
        purgeCSSFromPug(
          `div&attributes({class: ['card', {active: isActive}, open ? 'is-open' : 'is-closed']})`,
        ),
      ).toEqual({
        attributes: {
          names: ["class", "id"],
          values: ["true", "false", "card", "active", "is-open", "is-closed"],
        },
        classes: ["card", "active", "is-open", "is-closed"],
        ids: [],
        tags: ["div"],
        undetermined: [],
      });
    });

    it("finds quoted names, numbers, booleans and empty values", () => {
      expect(
        purgeCSSFromPug(
          `input&attributes({'data-state': "open", "aria-label": \`\`, tabindex: -1, 2: 'two', disabled: true})`,
        ),
      ).toEqual({
        attributes: {
          names: [
            "class",
            "id",
            "data-state",
            "aria-label",
            "tabindex",
            "2",
            "disabled",
          ],
          values: ["true", "false", "open", "", "-1", "two"],
        },
        classes: [],
        ids: [],
        tags: ["input"],
        undetermined: [],
      });
    });

    it("splits on whitespace and doesn't use the keys of an object as values of other attributes", () => {
      expect(
        purgeCSSFromPug(
          "div&attributes({class: `card\n  active`, style: {color: 'red'}})",
        ),
      ).toEqual({
        attributes: {
          names: ["class", "id", "style"],
          values: ["true", "false", "card", "active", "card\n  active", "red"],
        },
        classes: ["card", "active"],
        ids: [],
        tags: ["div"],
        undetermined: [],
      });
    });

    it("adds to the attributes in parentheses", () => {
      expect(
        purgeCSSFromPug(`a.btn(href='/')&attributes({class: 'active'})`),
      ).toEqual({
        attributes: {
          names: ["class", "id", "href"],
          values: ["true", "false", "btn", "/", "active"],
        },
        classes: ["btn", "active"],
        ids: [],
        tags: ["a"],
        undetermined: [],
      });
    });

    it("has the name but no value for a variable", () => {
      expect(
        purgeCSSFromPug(
          `div&attributes({class: classes, title, hidden: isHidden})`,
        ),
      ).toEqual({
        attributes: {
          names: ["class", "id", "title", "hidden"],
          values: ["true", "false"],
        },
        classes: [],
        ids: [],
        tags: ["div"],
        undetermined: [],
      });
    });

    it("ignores spread objects and computed names", () => {
      expect(
        purgeCSSFromPug(
          `div&attributes({...rest, [name]: 'foo', ['data-' + key]: 'bar', id: 'main'})`,
        ),
      ).toEqual({
        attributes: {
          names: ["class", "id"],
          values: ["true", "false", "main"],
        },
        classes: [],
        ids: ["main"],
        tags: ["div"],
        undetermined: [],
      });
    });

    it("finds nothing when the argument isn't an object literal", () => {
      const expected = {
        attributes: {
          names: ["class", "id"],
          values: ["true", "false"],
        },
        classes: [],
        ids: [],
        tags: ["div"],
        undetermined: [],
      };
      expect(purgeCSSFromPug(`div&attributes(attributes)`)).toEqual(expected);
      expect(
        purgeCSSFromPug(`div&attributes(merge({class: 'foo'}, attrs))`),
      ).toEqual(expected);
      expect(
        purgeCSSFromPug(
          `div&attributes(isOn ? {class: 'on'} : {class: 'off'})`,
        ),
      ).toEqual(expected);
    });

    it("finds nothing when the argument isn't an expression", () => {
      // pug-lexer doesn't check it, Pug fails when it compiles the template
      expect(purgeCSSFromPug(`div&attributes({class: 'foo' 'bar'})`)).toEqual({
        attributes: {
          names: ["class", "id"],
          values: ["true", "false"],
        },
        classes: [],
        ids: [],
        tags: ["div"],
        undetermined: [],
      });
    });
  });

  describe("code", () => {
    it("finds the strings of unbuffered code", () => {
      expect(
        purgeCSSFromPug(`- var classes = ['foo', 'bar']\ndiv(class=classes)`),
      ).toEqual({
        attributes: {
          names: ["class", "id"],
          values: ["true", "false"],
        },
        classes: [],
        ids: [],
        tags: ["div"],
        undetermined: ["foo", "bar"],
      });
    });

    it("finds the strings of buffered code", () => {
      expect(
        purgeCSSFromPug(
          `p= isOn ? 'on' : "off"\np!= '<b class="bold">' + text + '</b>'`,
        ),
      ).toEqual({
        attributes: {
          names: ["class", "id"],
          values: ["true", "false"],
        },
        classes: [],
        ids: [],
        tags: ["p", "p"],
        undetermined: [
          "on",
          "off",
          "<b",
          'class="bold">',
          '<b class="bold">',
          "</b>",
        ],
      });
    });

    it("splits on whitespace and keeps the whole string", () => {
      expect(
        purgeCSSFromPug(
          `- var title = 'hello  world', label = "", cell = "a\\tb"\ndiv(title=title)`,
        ).undetermined,
      ).toEqual(["hello", "world", "hello  world", "", "a", "b", "a\tb"]);
    });

    it("finds the static parts of a template literal", () => {
      expect(
        purgeCSSFromPug(
          "- var button = `btn btn-${size} ${isOn ? 'on' : `off-${level}`}`, empty = ``",
        ).undetermined,
      ).toEqual(["btn", "btn-", "btn btn-", " ", "on", "off-", ""]);
    });

    it("finds the strings of statements that aren't complete", () => {
      expect(
        purgeCSSFromPug(
          [
            "- if (theme === 'dark') {",
            "  p(class=theme)",
            "- } else if (theme === 'light') {",
            "  p",
            "- }",
            "- for (const size of ['sm', 'lg'])",
            "  div(class=size)",
            "- else",
            "  div",
          ].join("\n"),
        ),
      ).toEqual({
        attributes: {
          names: ["class", "id"],
          values: ["true", "false"],
        },
        classes: [],
        ids: [],
        tags: ["p", "p", "div", "div"],
        undetermined: ["dark", "light", "sm", "lg"],
      });
    });

    it("finds the strings of block code", () => {
      expect(
        purgeCSSFromPug(
          [
            "-",
            `  var list = ["uno", "dos",`,
            `      "tres"]`,
            "",
            "  var text = `multi",
            "    line`",
            "ul(class=list)",
            "  li 'text'",
          ].join("\n"),
        ),
      ).toEqual({
        attributes: {
          names: ["class", "id"],
          values: ["true", "false"],
        },
        classes: [],
        ids: [],
        tags: ["ul", "li"],
        undetermined: ["uno", "dos", "tres", "multi", "line", "multi\n  line"],
      });
    });

    it("ignores names, numbers, regular expressions and comments", () => {
      expect(
        purgeCSSFromPug(
          [
            "- var count = 3, isOn = /it's/.test(text), options = {active: isOn}",
            "- // it's a 'comment'",
            "- count += 1 /* 'comment' */",
            "p= count",
          ].join("\n"),
        ).undetermined,
      ).toEqual([]);
    });

    it("keeps the strings before a string that isn't closed", () => {
      // pug-lexer doesn't check unbuffered code
      expect(
        purgeCSSFromPug(`- var a = 'foo', b = 'bar\ndiv`).undetermined,
      ).toEqual(["foo"]);
    });

    it("doesn't read text as code", () => {
      expect(
        purgeCSSFromPug(
          [
            "p 'text'",
            "p.",
            "  var a = 'text'",
            "script.",
            "  var b = 'script'",
            "-",
            "p 'text'",
          ].join("\n"),
        ),
      ).toEqual({
        attributes: {
          names: ["class", "id"],
          values: ["true", "false"],
        },
        classes: [],
        ids: [],
        tags: ["p", "p", "script", "p"],
        undetermined: [],
      });
    });
  });

  describe("each", () => {
    it("finds the strings of the list", () => {
      expect(
        purgeCSSFromPug(`each size in ['sm', 'lg']\n  div(class=size)`),
      ).toEqual({
        attributes: {
          names: ["class", "id"],
          values: ["true", "false"],
        },
        classes: [],
        ids: [],
        tags: ["div"],
        undetermined: ["sm", "lg"],
      });
    });

    it("finds the strings of an object, of for and of each of", () => {
      expect(
        purgeCSSFromPug(
          [
            "each val, key in {a: 'one', b: 'two three'}",
            "  div(class=val)",
            "else",
            "  p",
            "for size in [`md`, `size-${n}`]",
            "  div(class=size)",
            "each [key, val] of new Map([['k', 'v']])",
            "  div(class=val)",
          ].join("\n"),
        ),
      ).toEqual({
        attributes: {
          names: ["class", "id"],
          values: ["true", "false"],
        },
        classes: [],
        ids: [],
        tags: ["div", "p", "div", "div"],
        undetermined: [
          "one",
          "two",
          "three",
          "two three",
          "md",
          "size-",
          "k",
          "v",
        ],
      });
    });
  });

  describe("mixins", () => {
    it("finds the strings of the arguments of a call", () => {
      expect(
        purgeCSSFromPug(
          `mixin button(cls)\n  button(class=cls)\n+button('btn-primary')`,
        ),
      ).toEqual({
        attributes: {
          names: ["class", "id"],
          values: ["true", "false"],
        },
        classes: [],
        ids: [],
        tags: ["button"],
        undetermined: ["btn-primary"],
      });
    });

    it("finds the strings of every argument, before the attributes", () => {
      expect(
        purgeCSSFromPug(
          "+button('btn btn-primary', `btn-${size}`, {icon: 'plus'})(class='x' title='y')&attributes({id: 'z'})",
        ),
      ).toEqual({
        attributes: {
          names: ["class", "id", "title"],
          values: ["true", "false", "x", "y", "z"],
        },
        classes: ["x"],
        ids: ["z"],
        tags: [],
        undetermined: ["btn", "btn-primary", "btn btn-primary", "btn-", "plus"],
      });
    });

    it("finds the strings of the default arguments", () => {
      expect(
        purgeCSSFromPug(
          "mixin button(cls = 'btn-default', size = `md`, ...rest)\n  button(class=[cls, size])",
        ),
      ).toEqual({
        attributes: {
          names: ["class", "id"],
          values: ["true", "false"],
        },
        classes: [],
        ids: [],
        tags: ["button"],
        undetermined: ["btn-default", "md"],
      });
    });
  });

  describe("interpolations", () => {
    it("finds the strings of escaped and unescaped interpolations", () => {
      expect(
        purgeCSSFromPug(
          `p #{isOn ? 'on' : 'off'} and !{'<b class="bold">' + text + '</b>'}`,
        ),
      ).toEqual({
        attributes: {
          names: ["class", "id"],
          values: ["true", "false"],
        },
        classes: [],
        ids: [],
        tags: ["p"],
        undetermined: [
          "on",
          "off",
          "<b",
          'class="bold">',
          '<b class="bold">',
          "</b>",
        ],
      });
    });

    it("finds the strings of the interpolations of every text", () => {
      expect(
        purgeCSSFromPug(
          [
            "| #{'piped'} text",
            "p.",
            "  text of a #{'block'}",
            "p text with a #[span(class='inner') #{'nested'} tag]",
          ].join("\n"),
        ),
      ).toEqual({
        attributes: {
          names: ["class", "id"],
          values: ["true", "false", "inner"],
        },
        classes: ["inner"],
        ids: [],
        tags: ["p", "p", "span"],
        undetermined: ["piped", "block", "nested"],
      });
    });

    it("finds the strings of an interpolation in a line of HTML", () => {
      expect(
        purgeCSSFromPug(`<div class="#{isOn ? 'on' : 'off'}">text</div>`),
      ).toEqual({
        attributes: {
          names: ["class", "id"],
          values: ["true", "false"],
        },
        classes: [],
        ids: [],
        tags: [],
        undetermined: ["on", "off"],
      });
    });

    it("finds the strings of an interpolated tag", () => {
      expect(purgeCSSFromPug(`#{isMain ? 'main' : 'section'}.foo`)).toEqual({
        attributes: {
          names: ["class", "id"],
          values: ["true", "false", "foo"],
        },
        classes: ["foo"],
        ids: [],
        tags: [],
        undetermined: ["main", "section"],
      });
    });
  });

  describe("conditions", () => {
    it("finds the strings of if, else if and unless", () => {
      expect(
        purgeCSSFromPug(
          [
            "if theme === 'dark'",
            "  p(class=theme)",
            "else if theme === 'light'",
            "  p(class=theme)",
            "else",
            "  p",
            "unless size === 'sm'",
            "  p(class=size)",
          ].join("\n"),
        ),
      ).toEqual({
        attributes: {
          names: ["class", "id"],
          values: ["true", "false"],
        },
        classes: [],
        ids: [],
        tags: ["p", "p", "p", "p"],
        undetermined: ["dark", "light", "sm"],
      });
    });

    it("finds the strings of while", () => {
      expect(
        purgeCSSFromPug(`while (cls = ['a', 'b'][n++])\n  p(class=cls)`),
      ).toEqual({
        attributes: {
          names: ["class", "id"],
          values: ["true", "false"],
        },
        classes: [],
        ids: [],
        tags: ["p"],
        undetermined: ["a", "b"],
      });
    });

    it("finds the strings of case and when", () => {
      expect(
        purgeCSSFromPug(
          [
            "case kind || 'info'",
            "  when 'warning'",
            "  when 'error': p(class=kind)",
            "  when `note`",
            "    p(class=kind)",
            "  default",
            "    p",
          ].join("\n"),
        ),
      ).toEqual({
        attributes: {
          names: ["class", "id"],
          values: ["true", "false"],
        },
        classes: [],
        ids: [],
        tags: ["p", "p", "p"],
        undetermined: ["info", "warning", "error", "note"],
      });
    });
  });

  describe("JavaScript without strings", () => {
    it("finds nothing in names, numbers and the name of a mixin", () => {
      expect(
        purgeCSSFromPug(
          [
            "mixin button(cls, ...rest)",
            "  button(class=cls)",
            "+button(type, 2)",
            "+button",
            // the name of a mixin isn't in the HTML
            "+#{'but' + 'ton'}(type)",
            "each size, index in sizes",
            "  p #{size} !{index}",
            "each size of sizes",
            "  #{tagName}",
            "if isOn",
            "  p",
            "else if count > 1",
            "  p",
            "while n < 3",
            "  p= n++",
            "case n",
            "  when 0",
            "    p",
          ].join("\n"),
        ),
      ).toEqual({
        attributes: {
          names: ["class", "id"],
          values: ["true", "false"],
        },
        classes: [],
        ids: [],
        tags: ["button", "p", "p", "p", "p", "p"],
        undetermined: [],
      });
    });
  });
});
