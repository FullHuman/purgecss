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
    expect(received).toEqual(["div", "flex", "items-center", "gap-2"]);
  });

  it("finds every string of a className expression", () => {
    expect(
      plugin(`const a = <div className={on ? "is-on" : "is-off"} />;`),
    ).toEqual(["div", "is-on", "is-off"]);
    expect(
      plugin(`const a = <div className={clsx("btn", "btn-primary")} />;`),
    ).toEqual(["div", "btn", "btn-primary"]);
  });

  it("finds the static parts of a template literal", () => {
    const received = plugin(
      'const a = <div className={`card ${active ? "active" : ""}`} />;',
    );
    expect(received).toEqual(["div", "card", "active"]);
  });

  it("finds the JSX elements in the value of other attributes", () => {
    expect(
      plugin(`const a = <Button icon={<Icon className="icon-star" />} />;`),
    ).toEqual(["Button", "Icon", "icon-star"]);
    expect(
      plugin(`const a = <Route render={() => <Page id="page" />} />;`),
    ).toEqual(["Route", "Page", "page"]);
  });

  it("ignores the strings of other attributes", () => {
    const received = plugin(
      `const a = <a href="#top" title="Top" className="link" />;`,
    );
    expect(received).toEqual(["a", "link"]);
  });

  it("finds namespaced element names", () => {
    const received = plugin(`const a = <svg:rect xlink:href="#shape" />;`);
    expect(received).toEqual(["svg:rect"]);
  });

  it("finds the object keys of a className expression", () => {
    const received = plugin(
      `const a = <div className={clsx("btn", { active: isActive, loading, "btn-lg btn-block": large, [styles.x]: y })} />;`,
    );
    expect(received).toEqual([
      "div",
      "btn",
      "active",
      "loading",
      "btn-lg",
      "btn-block",
    ]);
  });

  it("ignores the object keys of other attributes", () => {
    const received = plugin(
      `const a = <div style={{ color: "red" }} data={{ active: 1 }} className="x" />;`,
    );
    expect(received).toEqual(["div", "x"]);
  });
});
