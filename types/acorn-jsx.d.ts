import acorn from "acorn";
declare function jsx(options?: jsx.Options): (BaseParser: typeof acorn.Parser) => typeof acorn.Parser;
export declare namespace jsx {
    interface Options {
        allowNamespaces?: boolean;
        allowNamespacedObjects?: boolean;
    }
}
export default jsx;
