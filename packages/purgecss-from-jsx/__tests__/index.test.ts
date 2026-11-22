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

describe("purgeFromJsx", () => {
  it("splits class names on any whitespace", () => {
    const received = plugin(`const a = <div className="flex
      items-center	gap-2" />;`);
    expect(received).toEqual([
      "div",
      "class",
      "flex",
      "items-center",
      "gap-2",
      "flex\n      items-center\tgap-2",
    ]);
  });

  it("finds every string of a className expression", () => {
    expect(
      plugin(`const a = <div className={on ? "is-on" : "is-off"} />;`),
    ).toEqual(["div", "class", "is-on", "is-off"]);
    expect(
      plugin(`const a = <div className={clsx("btn", "btn-primary")} />;`),
    ).toEqual(["div", "class", "btn", "btn-primary"]);
  });

  it("finds the static parts of a template literal", () => {
    const received = plugin(
      'const a = <div className={`card ${active ? "active" : ""}`} />;',
    );
    expect(received).toEqual(["div", "class", "card", "card ", "active", ""]);
  });

  it("finds the JSX elements in the value of other attributes", () => {
    expect(
      plugin(`const a = <Button icon={<Icon className="icon-star" />} />;`),
    ).toEqual(["Button", "icon", "Icon", "class", "icon-star"]);
    expect(
      plugin(`const a = <Route render={() => <Page id="page" />} />;`),
    ).toEqual(["Route", "render", "Page", "id", "page"]);
  });

  it("finds the names and the values of other attributes", () => {
    const received = plugin(
      `const a = <a href="#top" title="Back to top" className="link" />;`,
    );
    expect(received).toEqual([
      "a",
      "href",
      "#top",
      "title",
      "Back to top",
      "class",
      "link",
    ]);
  });

  it("finds the attributes without a value", () => {
    const received = plugin(`const a = <input type="checkbox" disabled />;`);
    expect(received).toEqual(["input", "type", "checkbox", "disabled"]);
  });

  it("finds every string of an attribute expression", () => {
    const received = plugin(
      `const a = <div data-state={open ? "open" : "closed"} aria-label={\`Go to \${page}\`} />;`,
    );
    expect(received).toEqual([
      "div",
      "data-state",
      "open",
      "closed",
      "aria-label",
      "Go to ",
    ]);
  });

  it("finds the names of the attributes in the HTML", () => {
    expect(plugin(`const a = <label htmlFor="email" tabIndex={0} />;`)).toEqual(
      ["label", "for", "email", "tabIndex", "tabindex"],
    );
    expect(plugin(`const a = <svg viewBox="0 0 24 24" />;`)).toEqual([
      "svg",
      "viewBox",
      "viewbox",
      "0 0 24 24",
    ]);
  });

  it("finds the class names of the class attribute", () => {
    const received = plugin(
      `const a = <div class={["card active", { "is-open": open }]} />;`,
    );
    expect(received).toEqual([
      "div",
      "class",
      "card",
      "active",
      "card active",
      "is-open",
    ]);
  });

  it("finds namespaced element and attribute names", () => {
    const received = plugin(`const a = <svg:rect xlink:href="#shape" />;`);
    expect(received).toEqual(["svg:rect", "xlink:href", "#shape"]);
  });

  it("finds the object keys of a className expression", () => {
    const received = plugin(
      `const a = <div className={clsx("btn", { active: isActive, loading, "btn-lg btn-block": large, [styles.x]: y })} />;`,
    );
    expect(received).toEqual([
      "div",
      "class",
      "btn",
      "active",
      "loading",
      "btn-lg",
      "btn-block",
      "btn-lg btn-block",
    ]);
  });

  it("ignores the object keys of other attributes", () => {
    const received = plugin(
      `const a = <div style={{ color: "red" }} data={{ active: 1 }} className="x" />;`,
    );
    expect(received).toEqual(["div", "style", "red", "data", "class", "x"]);
  });

  it("returns each selector once", () => {
    const received = plugin(
      `const a = <ul className="list"><li className="item" /><li className="item" /></ul>;`,
    );
    expect(received).toEqual(["ul", "class", "list", "li", "item"]);
  });
});

describe("purgeFromJsx with the default options", () => {
  const defaultPlugin = purgeJsx();

  it("parses ES modules", () => {
    expect(defaultPlugin(TEST_1_CONTENT)).toEqual(
      purgeJsx({ ecmaVersion: "latest", sourceType: "module" })(TEST_1_CONTENT),
    );
    const received = defaultPlugin(`import { lazy } from "react";
export * from "./components";
const url = import.meta.url;
const data = await fetch(url);
export const Page = () => <main className="page" />;`);
    expect(received).toEqual(["main", "class", "page"]);
  });

  it("parses scripts", () => {
    const received = defaultPlugin(`const React = require("react");
with (React) {
  module.exports = () => <div className="legacy" />;
}`);
    expect(received).toEqual(["div", "class", "legacy"]);
  });
});
