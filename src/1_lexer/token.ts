import { SourceRange } from "../diagnostics/diagnostics";
import { LexerError } from "./lexerErrors";

export const TODO_LOCATION = { line: -1, column: -1 };

/** The types the token can have */
export enum TokenType {
  //~ Primitives
  Boolean,
  Number,
  Identifier,

  //~ Operators

  //* Prefix
  // LogicalNot, // !
  // BitwiseNot, // ~

  //* Logical
  LogicalOr, // ||
  LogicalAnd, // &&

  //* Bitwise
  BitwiseOr, // |
  BitwiseXor, // ^
  BitwiseAnd, // &

  //* Comparison
  Equal, // ==
  NotEqual, // !=
  Smaller, // <
  Greater, // >
  SmallerEqual, // <=
  GreaterEqual, // >=

  //* Bitshift
  // BitShiftLeft, // <<
  // BitShiftRight, // >>
  // BitShiftUnsignedRight, // >>>

  //* Arithmetic
  Add,
  Sub,
  Multiply,
  Divide,
  Modulo,

  //~ Assignment
  // Const, // const
  Var, // var
  Assignment, // =

  //~ Control flow
  If, // if
  Else, // else
  // For, // for
  While, // while
  // Break, // break
  // Continue, // continue

  //~ Functions
  Function, // function
  Return, // return

  //~ Punctuation
  Colon, // :
  Comma, // ,

  //~ Block
  OpenCurly, // {
  CloseCurly, // }

  //~ Grouping
  OpenParen, // ()
  CloseParen, // )

  //~
  EndOfStatement, // ;
  Comment, // '//' until new line or '/*' until '*/'

  //~ Meta
  InvalidToken,

  //~ Temp
  Print, // print
}

/** The type of a token. Location will be used later for error messages */
export type Token = {
  //TODO maybe add an id to make diagnostics easier? I don't know how much we really need that if we just keep a ref to the token.
  id: string;
  type: TokenType;
  value: string;
  location: SourceRange;
  isSynthetic?: boolean;
  // hasError?: boolean;
  // We use this to add the errors linked to the token once we have selected the token we want.
  errors: LexerError[];
};

/** Reserved keywords in the language and other symbols that haven a constant representation */
const RESERVED_SYMBOLS = {
  "true": TokenType.Boolean,
  "false": TokenType.Boolean,

  "&&": TokenType.LogicalAnd,
  "||": TokenType.LogicalOr,

  "+": TokenType.Add,
  "-": TokenType.Sub,
  "*": TokenType.Multiply,
  "/": TokenType.Divide,
  "%": TokenType.Modulo,

  "==": TokenType.Equal,
  "!=": TokenType.NotEqual,
  "<": TokenType.Smaller,
  ">": TokenType.Greater,
  "<=": TokenType.SmallerEqual,
  ">=": TokenType.GreaterEqual,

  "|": TokenType.BitwiseOr,
  "^": TokenType.BitwiseXor,
  "&": TokenType.BitwiseAnd,

  "=": TokenType.Assignment,
  "var": TokenType.Var,

  "if": TokenType.If,
  "else": TokenType.Else,
  "while": TokenType.While,

  "function": TokenType.Function,
  "return": TokenType.Return,

  ":": TokenType.Colon,
  ",": TokenType.Comma,

  "{": TokenType.OpenCurly,
  "}": TokenType.CloseCurly,

  "(": TokenType.OpenParen,
  ")": TokenType.CloseParen,

  ";": TokenType.EndOfStatement,

  "print": TokenType.Print,
};

/**
 * Reserved keywords in the language and other symbols that haven a constant representation.
 * Ordered in descending order of length so that longer tokens take precedence.
 */
export const orderedSymbols: [symbol: string, type: TokenType][] = Object.entries(RESERVED_SYMBOLS)
  .sort((a, b) => b[0].length - a[0].length);

export const DECIMAL_SEPARATOR = ".";

/* ---------------------------------- Utils --------------------------------- */
export function tokenToString(token: Token) {
  return JSON.stringify(token, tokenToStringJson, 0);
}

export function tokenToStringJson(key: any, value: any) {
  if (key === "type") {
    return TokenType[value];
  }
  if (key == "location") {
    return undefined;
  }
  if (key == "errors") {
    return undefined;
  }
  return value;
}
