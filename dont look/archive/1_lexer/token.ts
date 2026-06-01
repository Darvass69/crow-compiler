export enum TokenType {
  //~ Primitives
  // Null,
  // Boolean,
  Number,
  // String,
  Identifier,

  //~ Operators

  // Prefix
  // LogicalNot, // !
  BitwiseNot, // ~
  // Await, // await

  // State
  // PlusPlus, // ++
  // MinusMinus, // --

  // Logical
  // LogicalOr, // ||
  // LogicalAnd, // &&

  // Bitwise
  BitwiseOr, // |
  BitwiseXor, // ^
  BitwiseAnd, // &

  // Equality
  Equals, // ==
  NotEqual, // !=

  // Comparison
  Smaller, // <
  Greater, // >
  SmallerEqual, // <=
  GreaterEqual, // >=

  // Bit shift
  // BitShiftLeft, // <<
  // BitShiftRight, // >>
  // BitShiftUnsignedRight, // >>>

  // Additive
  Add, // +
  Minus, // -

  // Multiplicative
  Multiply, // *
  Divide, // /
  Modulo, // %

  // Exponent
  // Exponent, // **

  //~ Other
  // Assignment
  Assignment, // =, Don't forget combined assignment

  // Keywords
  // Const, // const
  Var, // var

  // Async, // async
  // Function, // function
  // Arrow, // =>
  // Return, // return

  // If, // if
  // Else, // else

  // For, // for
  // While, // while
  // Break, // break

  // Struct,

  // Delete, // delete

  // Import, // import
  // Export, // export

  // Super, // super
  // This, // this
  // Class, // class or className
  // New, // new

  // Punctuation
  // Dot, // .
  // Comma, // ,
  // Spread, // ...
  Colon, // :
  // Question, // ?

  // OpenBracket, // [
  // CloseBracket, // ]
  // OpenCurly, // {
  // CloseCurly, // }
  // OpenParen, // (
  // CloseParen, // )

  // Spaces
  WhiteSpace, // " "
  LineBreak, // \n
  Tab, // \t

  // End of statement
  EndOfStatement, // ;

  // End of file
  EOF,
  // Misc
  Comment,
  // NumTokenTypes,
  // All,
  // None,
}

export type Token = {
  type: TokenType;
  location: { /*file: string;*/ line: number; column: number };
  value: string;
  //TODO add more info on the token
};

export const reservedKeywords = {
  // "null": TokenType.Null,
  // "true": TokenType.Boolean,
  // "false": TokenType.Boolean,
  // "const": TokenType.Const,
  "var": TokenType.Var,
  // "async": TokenType.Async,
  // "function": TokenType.Function,
  // "return": TokenType.Return,
  // "if": TokenType.If,
  // "else": TokenType.Else,
  // "for": TokenType.For,
  // "while": TokenType.While,
  // "break": TokenType.Break,
  // "struct": TokenType.Struct,
  // "import": TokenType.Import,
  // "export": TokenType.Export,
};

export function TokenTypeToString(type: TokenType) {
  return TokenType[type];
}

export function tokenListToStringJson(key: any, value: any) {
  if (key === "type") {
    return TokenType[value];
  }
  return value;
}
