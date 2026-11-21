import * as ts from "typescript";
import purgeTsx from "../src/index";

import { TEST_1_CONTENT, TEST_1_TAG, TEST_1_CLASS, TEST_1_ID } from "./data";

const plugin = purgeTsx();

describe("purgeFromTsx", () => {
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

  it("strips the TypeScript syntax of a className expression", () => {
    expect(plugin(`const a = <div className={"cast" as string} />;`)).toEqual([
      "div",
      "class",
      "cast",
    ]);
    expect(
      plugin(`const a = <div className={"checked" satisfies string} />;`),
    ).toEqual(["div", "class", "checked"]);
    expect(
      plugin(`const a = <List<string> className="generic" items={[]} />;`),
    ).toEqual(["List", "class", "generic", "items"]);
  });

  it("parses the ES modules emitted with the module option", () => {
    const received = purgeTsx({ tsOptions: { module: ts.ModuleKind.ESNext } })(
      TEST_1_CONTENT,
    );
    expect(received).toEqual(plugin(TEST_1_CONTENT));
  });
});
