declare module "pug-lexer";

declare module "pug-lexer" {
  interface LexerOptions {
    filename: string;
    plugins: string;
  }

  type TokenType =
    | "tag"
    | "attribute"
    | "eos"
    | "text"
    | "newline"
    | "class"
    | "id";


  interface Token {
    name: string;
    mustEscape: boolean;
    type: TokenType;
    line: number;
    val: string;
    selfClosing: boolean;
  }

  function lex(str: string, options?: LexerOptions): Token[];
  export = lex;
}
