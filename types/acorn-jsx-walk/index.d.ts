declare module "acorn-jsx-walk" {
  import * as walk from "acorn-walk";
  export function extend<T>(base: walk.RecursiveVisitors<T>): void;
}
