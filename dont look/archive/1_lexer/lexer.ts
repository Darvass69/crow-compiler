import { reservedKeywords, Token, TokenType } from "./token";

/*
Every handler that can parse the current char should have a go
longest match takes precedence
then we hav tie breakers (if as identifier vs keyword)

this means:
  check the result of each handler
  each handle needs to have a tie breaker priority so we can disambiguate
*/

export class Lexer {
  private tokens: Token[] = [];
  private source: string;
  public position: number = 0;

  constructor(source: string) {
    this.source = source;
  }

  public tokenize(): Token[] {
    while (!this.atEOF()) {
      let matched = false;

      for (const handler of handlers) {
        const token = handler[1](this);
        if (token != null) {
          matched = true;
          break;
        }
      }

      if (!matched) {
        throw new Error(`lexer error: unrecognized token near '${this.remainder()}'`);
      }
    }

    this.push({ type: TokenType.EOF, value: "EOF" });
    return this.tokens;
  }

  public advanceN(n: number = 1) {
    this.position += n;
  }

  public getCurrent() {
    return this.source[this.position];
  }

  public remainder() {
    return this.source.slice(this.position);
  }

  public push(token: Token) {
    this.tokens.push(token);
  }

  public atEOF() {
    return this.position >= this.source.length;
  }

  public test(regex: RegExp) {
    return (regex.exec(this.remainder()) ?? [])[0] ?? "";
  }
}

enum Priority {
  Comment,
  Keyword,
  Other,
}

type Handler = (lex: Lexer) => [Token, Priority];

const handlers: Handler[] = [];

/* -------------------------------------------------------------------------- */
function defaultHandler(type: TokenType, value: string) {
  return (lex: Lexer, regex: RegExp) => {
    lex.advanceN(value.length);
    lex.push({ type, value });
  };
}

// function stringHandler(lex: Lexer, regex: RegExp) {
//   const value = lex.test(regex);
//   lex.push({ type: TokenType.String, value });
//   lex.advanceN(value.length);
// }

function numberHandler(lex: Lexer, regex: RegExp) {
  const value = lex.test(regex);
  lex.push({ type: TokenType.Number, value });
  lex.advanceN(value.length);
}

function symbolHandler(lex: Lexer, regex: RegExp) {
  const value = lex.test(regex);

  if (value in reservedKeywords) {
    lex.push({ type: reservedKeywords[value as keyof typeof reservedKeywords], value });
  } else {
    lex.push({ type: TokenType.Identifier, value });
  }

  lex.advanceN(value.length);
}

function skipHandler(lex: Lexer, regex: RegExp) {
  const value = lex.test(regex);
  lex.advanceN(value.length);
}

function commentHandler(lex: Lexer, regex: RegExp) {
  const value = lex.test(regex);
  lex.advanceN(value.length);
}

const patterns: [RegExp, any][] = [
  [/^\s+/, skipHandler],
  [/^\/\/.*/, commentHandler],
  // [/^"[^"]*"/, stringHandler],
  [/^[0-9]+(\.[0-9]+)?/, numberHandler],
  [/^[a-zA-Z_][a-zA-Z0-9_]*/, symbolHandler],

  // Multi-character operators (longest first)
  // [/^\.\.\./, defaultHandler(TokenType.Spread, "...")],
  [/^==/, defaultHandler(TokenType.Equals, "==")],
  [/^!=/, defaultHandler(TokenType.NotEqual, "!=")],
  [/^<=/, defaultHandler(TokenType.SmallerEqual, "<=")],
  [/^>=/, defaultHandler(TokenType.GreaterEqual, ">=")],
  // [/^<</, defaultHandler(TokenType.BitShiftLeft, "<<")],
  // [/^>>>/, defaultHandler(TokenType.BitShiftUnsignedRight, ">>>")],
  // [/^>>/, defaultHandler(TokenType.BitShiftRight, ">>")],
  // [/^\*\*/, defaultHandler(TokenType.Exponent, "**")],
  // [/^\+\+/, defaultHandler(TokenType.PlusPlus, "++")],
  // [/^--/, defaultHandler(TokenType.MinusMinus, "--")],
  // [/^\|\|/, defaultHandler(TokenType.LogicalOr, "||")],
  // [/^&&/, defaultHandler(TokenType.LogicalAnd, "&&")],
  // [/^=>/, defaultHandler(TokenType.Arrow, "=>")],

  // Single-character operators & punctuation
  [/^=/, defaultHandler(TokenType.Assignment, "=")],
  // [/^!/, defaultHandler(TokenType.LogicalNot, "!")],
  [/^~/, defaultHandler(TokenType.BitwiseNot, "~")],
  [/^\|/, defaultHandler(TokenType.BitwiseOr, "|")],
  [/^&/, defaultHandler(TokenType.BitwiseAnd, "&")],
  [/^\^/, defaultHandler(TokenType.BitwiseXor, "^")],
  [/^</, defaultHandler(TokenType.Smaller, "<")],
  [/^>/, defaultHandler(TokenType.Greater, ">")],
  [/^\+/, defaultHandler(TokenType.Add, "+")],
  [/^-/, defaultHandler(TokenType.Minus, "-")],
  [/^\*/, defaultHandler(TokenType.Multiply, "*")],
  [/^\//, defaultHandler(TokenType.Divide, "/")],
  [/^%/, defaultHandler(TokenType.Modulo, "%")],

  // [/^\./, defaultHandler(TokenType.Dot, ".")],
  // [/^,/, defaultHandler(TokenType.Comma, ",")],
  [/^:/, defaultHandler(TokenType.Colon, ":")],
  // [/^\?/, defaultHandler(TokenType.Question, "?")],

  // [/^\[/, defaultHandler(TokenType.OpenBracket, "[")],
  // [/^\]/, defaultHandler(TokenType.CloseBracket, "]")],
  // [/^\{/, defaultHandler(TokenType.OpenCurly, "{")],
  // [/^\}/, defaultHandler(TokenType.CloseCurly, "}")],
  // [/^\(/, defaultHandler(TokenType.OpenParen, "(")],
  // [/^\)/, defaultHandler(TokenType.CloseParen, ")")],

  [/^;/, defaultHandler(TokenType.EndOfStatement, ";")],
];
