import { tokenize } from "./lexer";
import { LexerError, LexerErrorCode } from "./lexerErrors";
import { Token, TokenType } from "./token";
import { CURRENT_PHASE } from "../../../test/test.env";
import { diagnostics } from "../../diagnostics/diagnostics";

//TODO only include it in test files

//TODO figure out all potential edge cases that we need to worry about
//TODO test failure modes

let expectNoError = true;
afterEach(() => {
  try {
    if (expectNoError) {
      expect(diagnostics.lexerDiagnostics).toEqual([]);
    }
  } finally {
    diagnostics.reset();
    expectNoError = true;
  }
});

describe("should parse simple tokens", () => {
  describe.phase(1, "", () => {
    it.each([
      ["|", TokenType.BitwiseOr],
      ["^", TokenType.BitwiseXor],
      ["&", TokenType.BitwiseAnd],
      ["+", TokenType.Add],
      ["-", TokenType.Sub],
      ["*", TokenType.Multiply],
      ["/", TokenType.Divide],
      ["%", TokenType.Modulo],
      ["var", TokenType.Var],
      ["=", TokenType.Assignment],
      ["(", TokenType.OpenParen],
      [")", TokenType.CloseParen],

      [";", TokenType.EndOfStatement],
      ["print", TokenType.Print],
    ])("%s", (token, type) => testBasicToken(token, type));
  });

  describe.phase(2, "", () => {
    it.each([
      ["true", TokenType.Boolean],
      ["false", TokenType.Boolean],
      ["||", TokenType.LogicalOr],
      ["&&", TokenType.LogicalAnd],
      ["==", TokenType.Equal],
      ["!=", TokenType.NotEqual],
      ["<", TokenType.Smaller],
      [">", TokenType.Greater],
      ["<=", TokenType.SmallerEqual],
      [">=", TokenType.GreaterEqual],
      ["if", TokenType.If],
      ["else", TokenType.Else],
      ["while", TokenType.While],

      ["{", TokenType.OpenCurly],
      ["}", TokenType.CloseCurly],
    ])("%s", (token, type) => testBasicToken(token, type));
  });

  describe.phase(3, "", () => {
    it.each([
      ["function", TokenType.Function],
      ["return", TokenType.Return],
      [":", TokenType.Colon],
      [",", TokenType.Comma],
    ])("%s", (token, type) => testBasicToken(token, type));
  });

  describe.phase(4, "", () => {
    it.each([])("%s", (token, type) => testBasicToken(token, type));
  });

  describe.phase(Infinity, "", () => {
    it.each([
      // ["!", TokenType.LogicalNot],
      // ["~", TokenType.BitwiseNot],
      // ["<<", TokenType.BitShiftLeft],
      // [">>", TokenType.BitShiftRight],
      // [">>>", TokenType.BitShiftUnsignedRight],
      // ["++", TokenType.Increment],
      // ["--", TokenType.Decrement],
      // ["...", TokenType.Ellipsis],
    ])("%s", (token, type) => testBasicToken(token, type));
  });
});

describe("numbers", () => {
  //TODO Huge numbers (overflow) or boundary values

  describe.phase(1, "simple numbers", () => {
    it("should parse integer", () => {
      testBasicToken("123", TokenType.Number);
    });

    it("numbers and alpha", () => {
      //? maybe we shouldn't allow this
      const tokens = tokenize("123abc");

      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toBeToken(TokenType.Number, "123");
      expect(tokens[1]).toBeToken(TokenType.Identifier, "abc");
    });
  });

  describe.phase(Infinity, "should parse decimal numbers", () => {
    it("normal decimal", () => {
      testBasicToken("123.456", TokenType.Number);
    });

    it("trailing dot", () => {
      const tokens = tokenize("123.");

      expect(tokens).toHaveLength(1);
      //? Do we truncate the trailing dot?
      expect(tokens[0]).toBeToken(TokenType.Number, "123");
    });

    it("leading dot", () => {
      const tokens = tokenize(".123");

      expect(tokens).toHaveLength(1);
      //? Do we append a 0?
      expect(tokens[0]).toBeToken(TokenType.Number, "0.123");
    });

    // 1.2.3
  });

  describe.phase(Infinity, "should parse hexadecimal (0x) and binary (0b) numbers", () => {
    // Hex with invalid digit: 0x1G5
    // Binary: 0b101101
  });

  describe.phase(Infinity, "should parse exponential notation (ex: 5e3)", () => {
    // Decimal with exponent: 1e10, 1.5e-3, 5.0E+4
    // Missing exponent parts: 1e, 1e+, 1.e3, .e3
  });

  describe.phase(Infinity, "should parse numbers with underscore (1_000_000)?", () => {
  });
});

describe("identifiers", () => {
  describe.phase(1, "should parse identifiers (alpha/num)", () => {
    it("simple identifier", () => {
      testBasicToken("abc", TokenType.Identifier);
    });

    it("identifier with number", () => {
      testBasicToken("abc123", TokenType.Identifier);
    });

    it("identifier with single character", () => {
      testBasicToken("x", TokenType.Identifier);
    });

    it("identifier with capital letter", () => {
      testBasicToken("AbCD", TokenType.Identifier);
    });

    it("identifier close to keywords", () => {
      testBasicToken("if1", TokenType.Identifier);
      testBasicToken("if_", TokenType.Identifier);
    });
  });

  describe.phase(3, "should parse identifiers (alpha/num and underscore)", () => {
    it("identifier with number and underscore", () => {
      const tokens = tokenize("my_var2");

      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toBeToken(TokenType.Identifier, "my_var2");
    });

    it("can start with underscore", () => {
      const tokens = tokenize("_temp");

      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toBeToken(TokenType.Identifier, "_temp");
    });

    it("_", () => {
      const tokens = tokenize("_");

      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toBeToken(TokenType.Identifier, "_");
    });
  });

  describe.phase(Infinity, "should parse identifiers (all unicode)", () => {
    // π = 3.14
    // \u03C0 = 3.14
    // naïve, über, 变量, привет
    // á
    // emoji
    // a\u200C

    // Zero-width characters inside identifiers (ZWNJ, ZERO WIDTH SPACE)
  });
});

describe.phase(3, "comments", () => {
  it("should parse single line comments", () => {
    const tokens = tokenize("// This is a comment\n");

    expect(tokens).toHaveLength(1);
    expect(tokens[0]).toBeToken(TokenType.Comment, "// This is a comment");
  });

  it("should parse comment with end of file", () => {
    const tokens = tokenize("// This is a comment");

    expect(tokens).toHaveLength(1);
    expect(tokens[0]).toBeToken(TokenType.Comment, "// This is a comment");
  });

  it("should parse multi-line comments", () => {
    const tokens = tokenize("/* multi\nline comment */");

    expect(tokens).toHaveLength(1);
    expect(tokens[0]).toBeToken(TokenType.Comment, "/* multi\nline comment */");
  });

  it("should parse unterminated multi-line comments and emit an error", () => {
    const tokens = tokenize("/* multi\nline comment");
    expectNoError = false;

    expect(tokens).toHaveLength(1);
    expect(tokens[0]).toBeToken(TokenType.Comment, "/* multi\nline comment");

    expect(tokens[0].errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining<Partial<LexerError>>({
          errorCode: LexerErrorCode.UnterminatedComment,
        }),
      ]),
    );
  });

  it("should handle tricky symbols", () => {
    const tokens = tokenize("/* * / * /* */");

    expect(tokens).toHaveLength(1);
    expect(tokens[0]).toBeToken(TokenType.Comment, "/* * / * /* */");
  });

  it("should handle empty comments", () => {
    const tokens = tokenize("/**/");

    expect(tokens).toHaveLength(1);
    expect(tokens[0]).toBeToken(TokenType.Comment, "/**/");

    const tokens2 = tokenize("/*  \t \r\n\n\r\t */");

    expect(tokens2).toHaveLength(1);
    expect(tokens2[0]).toBeToken(TokenType.Comment, "/*  \t \r\n\n\r\t */");
  });

  describe("comments in the middle of the file", () => {
    it("comment then code", () => {
      const tokens = tokenize("/* block comment */ foo");

      compareTokenList(tokens, [
        { type: TokenType.Comment, value: "/* block comment */" },
        { type: TokenType.Identifier, value: "foo" },
      ], simpleTokenComparator);
    });

    it("comment mixed with code", () => {
      const tokens = tokenize("foo /* comment */ bar /* another */ baz");

      compareTokenList(tokens, [
        { type: TokenType.Identifier, value: "foo" },
        { type: TokenType.Comment, value: "/* comment */" },
        { type: TokenType.Identifier, value: "bar" },
        { type: TokenType.Comment, value: "/* another */" },
        { type: TokenType.Identifier, value: "baz" },
      ], simpleTokenComparator);
    });
  });

  it.todo("not comments in strings");

  it("strings in comments", () => {
    const tokens = tokenize('/* "hello" 123 */');

    expect(tokens).toHaveLength(1);
    expect(tokens[0]).toBeToken(TokenType.Comment, '/* "hello" 123 */');
  });
});

describe("empty tokens", () => {
  it("should return an empty array if the input is empty", () => {
    expect(tokenize("")).toHaveLength(0);
  });

  it("should return an empty array if the input is whitespace characters", () => {
    expect(tokenize("   \t\n\r")).toHaveLength(0);
  });

  it.todo("should return an empty array if the input is control characters", () => {
    //TODO add more interesting characters we should skip
    expect(tokenize("\0")).toHaveLength(0);
  });
});

//TODO length priority
describe("symbol priority", () => {
  // == vs =
  // "= == === =" -> '=' '==' '==' '=' '='?
  // "+ ++ += +" -> '+' '++' '+=' '+'
  // "- --> -> -= -" -> '-' '--' '>' '->' '-=' '-'
  // "& && &= &" -> '&' '&&' '&=' '&'

  // "< <= << <<= <" -> '<' '<=' '<<' '<<=' '<'
  // "! = != !" -> '!' '=' '!=' '!'
});

describe("unknown characters", () => {
  it.phase(1, "non-alpha ascii should emit an error", () => {
    const tokens = tokenize("@\u0007\u0019");
    expectNoError = false;

    expect(tokens).toHaveLength(3);
    expect(tokens[0]).toBeToken(TokenType.InvalidToken, "@");
    expect(tokens[1]).toBeToken(TokenType.InvalidToken, "\u0007");
    expect(tokens[2]).toBeToken(TokenType.InvalidToken, "\u0019");
  });

  {
    // These are all kind of spaces, so we might want to handle them differently
    // const tokens = tokenize("\u00A0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000");

    const sample = "\u03C6\u21D5";
    if (CURRENT_PHASE >= Infinity) {
      //TODO Full unicode
    } else {
      it.phase(3, "non-alpha unicode should emit an error", () => {
        const tokens = tokenize(sample);
        expectNoError = false;

        expect(tokens).toHaveLength(2);

        expect(tokens[0]).toBeToken(TokenType.InvalidToken, "\u03C6");
        expect(tokens[1]).toBeToken(TokenType.InvalidToken, "\u21D5");
      });
    }
  }
});

describe("multi-token expressions", () => {
  describe("simple cases", () => {
    it.phase(1, "= =", () => {
      const tokens = tokenize("= =");
      compareTokenList(tokens, [
        { type: TokenType.Assignment, value: "=" },
        { type: TokenType.Assignment, value: "=" },
      ], simpleTokenComparator);
    });

    it.phase(1, "+ =", () => {
      const tokens = tokenize("+ =");
      compareTokenList(tokens, [
        { type: TokenType.Add, value: "+" },
        { type: TokenType.Assignment, value: "=" },
      ], simpleTokenComparator);
    });

    it.phase(1, "=+", () => {
      const tokens = tokenize("= +");
      compareTokenList(tokens, [
        { type: TokenType.Assignment, value: "=" },
        { type: TokenType.Add, value: "+" },
      ], simpleTokenComparator);
    });
  });

  it.phase(1, "mixed whitespace", () => {
    const tokens = tokenize("var\tx =   3+ 42\n  ;");
    compareTokenList(tokens, [
      { type: TokenType.Var, value: "var" },
      { type: TokenType.Identifier, value: "x" },
      { type: TokenType.Assignment, value: "=" },
      { type: TokenType.Number, value: "3" },
      { type: TokenType.Add, value: "+" },
      { type: TokenType.Number, value: "42" },
      { type: TokenType.EndOfStatement, value: ";" },
    ], simpleTokenComparator);
  });

  describe("spaces and lack of spaces", () => {
    it.phase(1, "compact", () => {
      const tokens = tokenize("a=1+2;");

      compareTokenList(tokens, [
        { type: TokenType.Identifier, value: "a" },
        { type: TokenType.Assignment, value: "=" },
        { type: TokenType.Number, value: "1" },
        { type: TokenType.Add, value: "+" },
        { type: TokenType.Number, value: "2" },
        { type: TokenType.EndOfStatement, value: ";" },
      ], simpleTokenComparator);
    });

    describe.phase(2, "if else", () => {
      it("should parse ifelse as an identifier", () => {
        testBasicToken("ifelse", TokenType.Identifier);
      });

      it("should parse if else as 2 tokens", () => {
        const tokens = tokenize("if else");

        expect(tokens).toHaveLength(2);
        expect(tokens[0]).toBeToken(TokenType.If, "if");
        expect(tokens[1]).toBeToken(TokenType.Else, "else");
      });
    });
  });
});

//TODO ambiguous parse (i don't think our syntax has any, but we could hardcode something to test if we detect it?)

//TODO line counting (for when we have that)
describe("positions and ranges", () => {
  //TODO check starting and ending line and characters
  //TODO check range length?
  it.phase(4, "token position and length", () => {
    const tokens = tokenize("something here");

    expect(tokens).toHaveLength(2);
    expect(tokens[0]).toBeToken(TokenType.Identifier, "something");
    expect(tokens[0].location).toEqual(expect.objectContaining({ start: { line: 0, character: 0 }, end: { line: 0, character: 9 } }));

    expect(tokens[1]).toBeToken(TokenType.Identifier, "here");
    expect(tokens[1].location).toEqual(expect.objectContaining({ start: { line: 0, character: 10 }, end: { line: 0, character: 14 } }));
  });

  it.phase(4, "multiple lines", () => {
    const tokens = tokenize("a\nb\nc");

    expect(tokens).toHaveLength(3);
    expect(tokens[0]).toBeToken(TokenType.Identifier, "a");
    expect(tokens[0].location).toEqual(expect.objectContaining({ start: { line: 0, character: 0 }, end: { line: 0, character: 1 } }));
    expect(tokens[1]).toBeToken(TokenType.Identifier, "b");
    expect(tokens[1].location).toEqual(expect.objectContaining({ start: { line: 1, character: 0 }, end: { line: 1, character: 1 } }));
    expect(tokens[2]).toBeToken(TokenType.Identifier, "c");
    expect(tokens[2].location).toEqual(expect.objectContaining({ start: { line: 2, character: 0 }, end: { line: 2, character: 1 } }));
  });

  it.phase(4, "empty lines", () => {
    const tokens = tokenize("a\n\nb\n\n\nend");

    expect(tokens).toHaveLength(3);
    expect(tokens[0]).toBeToken(TokenType.Identifier, "a");
    expect(tokens[0].location).toEqual(expect.objectContaining({ start: { line: 0, character: 0 }, end: { line: 0, character: 1 } }));
    expect(tokens[1]).toBeToken(TokenType.Identifier, "b");
    expect(tokens[1].location).toEqual(expect.objectContaining({ start: { line: 2, character: 0 }, end: { line: 2, character: 1 } }));
    expect(tokens[2]).toBeToken(TokenType.Identifier, "end");
    expect(tokens[2].location).toEqual(expect.objectContaining({ start: { line: 5, character: 0 }, end: { line: 5, character: 3 } }));
  });

  it.phase(4, "leading and trailing spaces", () => {
    const tokens = tokenize("   a  b   c   ");

    expect(tokens).toHaveLength(3);
    expect(tokens[0]).toBeToken(TokenType.Identifier, "a");
    expect(tokens[0].location).toEqual(expect.objectContaining({ start: { line: 0, character: 3 }, end: { line: 0, character: 4 } }));
    expect(tokens[1]).toBeToken(TokenType.Identifier, "b");
    expect(tokens[1].location).toEqual(expect.objectContaining({ start: { line: 0, character: 6 }, end: { line: 0, character: 7 } }));
    expect(tokens[2]).toBeToken(TokenType.Identifier, "c");
    expect(tokens[2].location).toEqual(expect.objectContaining({ start: { line: 0, character: 10 }, end: { line: 0, character: 11 } }));
  });

  it.phase(4, "mixed tabs and spaces", () => {
    const tokens = tokenize("a\t b\t\tc");
    //TODO we will have to know how many tabs so we can print it correctly

    expect(tokens).toHaveLength(3);
    expect(tokens[0]).toBeToken(TokenType.Identifier, "a");
    expect(tokens[0].location).toEqual(expect.objectContaining({ start: { line: 0, character: 0 }, end: { line: 0, character: 1 } }));
    expect(tokens[1]).toBeToken(TokenType.Identifier, "b");
    expect(tokens[1].location).toEqual(expect.objectContaining({ start: { line: 0, character: 3 }, end: { line: 0, character: 4 } }));
    expect(tokens[2]).toBeToken(TokenType.Identifier, "c");
    expect(tokens[2].location).toEqual(expect.objectContaining({ start: { line: 0, character: 6 }, end: { line: 0, character: 7 } }));
  });

  it.phase(4, "line ending types", () => {
    const tokens = tokenize("a\r\nb\r\nc");

    expect(tokens).toHaveLength(3);
    expect(tokens[0]).toBeToken(TokenType.Identifier, "a");
    expect(tokens[0].location).toEqual(expect.objectContaining({ start: { line: 0, character: 0 }, end: { line: 0, character: 1 } }));
    expect(tokens[1]).toBeToken(TokenType.Identifier, "b");
    expect(tokens[1].location).toEqual(expect.objectContaining({ start: { line: 1, character: 0 }, end: { line: 1, character: 1 } }));
    expect(tokens[2]).toBeToken(TokenType.Identifier, "c");
    expect(tokens[2].location).toEqual(expect.objectContaining({ start: { line: 2, character: 0 }, end: { line: 2, character: 1 } }));

    // const tokens2 = tokenize("a\rb\rc");

    // expect(tokens2).toHaveLength(3);
    // expect(tokens2[0]).toBeToken(TokenType.Identifier, "a");
    // expect(tokens2[0].location).toEqual(expect.objectContaining({ start: { line: 0, character: 0 }, end: { line: 0, character: 1 } }));
    // expect(tokens2[1]).toBeToken(TokenType.Identifier, "b");
    // expect(tokens2[1].location).toEqual(expect.objectContaining({ start: { line: 1, character: 0 }, end: { line: 1, character: 1 } }));
    // expect(tokens2[2]).toBeToken(TokenType.Identifier, "c");
    // expect(tokens2[2].location).toEqual(expect.objectContaining({ start: { line: 2, character: 0 }, end: { line: 2, character: 1 } }));

    const tokens3 = tokenize("a\nb\nc");

    expect(tokens3).toHaveLength(3);
    expect(tokens3[0]).toBeToken(TokenType.Identifier, "a");
    expect(tokens3[0].location).toEqual(expect.objectContaining({ start: { line: 0, character: 0 }, end: { line: 0, character: 1 } }));
    expect(tokens3[1]).toBeToken(TokenType.Identifier, "b");
    expect(tokens3[1].location).toEqual(expect.objectContaining({ start: { line: 1, character: 0 }, end: { line: 1, character: 1 } }));
    expect(tokens3[2]).toBeToken(TokenType.Identifier, "c");
    expect(tokens3[2].location).toEqual(expect.objectContaining({ start: { line: 2, character: 0 }, end: { line: 2, character: 1 } }));
  });

  it.phase(Infinity, "counts unicode as a single character", () => {
    const tokens = tokenize("λ π ∑");

    expect(tokens).toHaveLength(3);
    expect(tokens[0]).toBeToken(TokenType.Identifier, "λ");
    expect(tokens[0].location).toEqual(expect.objectContaining({ start: { line: 0, character: 0 }, end: { line: 0, character: 1 } }));
    expect(tokens[1]).toBeToken(TokenType.Identifier, "π");
    expect(tokens[1].location).toEqual(expect.objectContaining({ start: { line: 0, character: 2 }, end: { line: 0, character: 3 } }));
    expect(tokens[2]).toBeToken(TokenType.Identifier, "∑");
    expect(tokens[2].location).toEqual(expect.objectContaining({ start: { line: 0, character: 4 }, end: { line: 0, character: 5 } }));
  });

  it.phase(4, "comments", () => {
    const tokens = tokenize("a // comment\nb /* comment\n */\n c");

    expect(tokens).toHaveLength(5);
    expect(tokens[0]).toBeToken(TokenType.Identifier, "a");
    expect(tokens[0].location).toEqual(expect.objectContaining({ start: { line: 0, character: 0 }, end: { line: 0, character: 1 } }));
    expect(tokens[1]).toBeToken(TokenType.Comment, "// comment");
    expect(tokens[1].location).toEqual(expect.objectContaining({ start: { line: 0, character: 2 }, end: { line: 0, character: 12 } }));
    expect(tokens[2]).toBeToken(TokenType.Identifier, "b");
    expect(tokens[2].location).toEqual(expect.objectContaining({ start: { line: 1, character: 0 }, end: { line: 1, character: 1 } }));
    expect(tokens[3]).toBeToken(TokenType.Comment, "/* comment\n */");
    expect(tokens[3].location).toEqual(expect.objectContaining({ start: { line: 1, character: 2 }, end: { line: 2, character: 3 } }));
    expect(tokens[4]).toBeToken(TokenType.Identifier, "c");
    expect(tokens[4].location).toEqual(expect.objectContaining({ start: { line: 3, character: 1 }, end: { line: 3, character: 2 } }));
  });

  //TODO strings: Multi-Line String, unterminated string, Escaped Characters in Strings ("foo\nbar\tbaz"),

  it.phase(4, "multiple mixed tokens per line", () => {
    const tokens = tokenize("a b\nc d e\nf");

    expect(tokens).toHaveLength(6);
    expect(tokens[0]).toBeToken(TokenType.Identifier, "a");
    expect(tokens[0].location).toEqual(expect.objectContaining({ start: { line: 0, character: 0 }, end: { line: 0, character: 1 } }));
    expect(tokens[1]).toBeToken(TokenType.Identifier, "b");
    expect(tokens[1].location).toEqual(expect.objectContaining({ start: { line: 0, character: 2 }, end: { line: 0, character: 3 } }));
    expect(tokens[2]).toBeToken(TokenType.Identifier, "c");
    expect(tokens[2].location).toEqual(expect.objectContaining({ start: { line: 1, character: 0 }, end: { line: 1, character: 1 } }));
    expect(tokens[3]).toBeToken(TokenType.Identifier, "d");
    expect(tokens[3].location).toEqual(expect.objectContaining({ start: { line: 1, character: 2 }, end: { line: 1, character: 3 } }));
    expect(tokens[4]).toBeToken(TokenType.Identifier, "e");
    expect(tokens[4].location).toEqual(expect.objectContaining({ start: { line: 1, character: 4 }, end: { line: 1, character: 5 } }));
    expect(tokens[5]).toBeToken(TokenType.Identifier, "f");
    expect(tokens[5].location).toEqual(expect.objectContaining({ start: { line: 2, character: 0 }, end: { line: 2, character: 1 } }));
  });

  it.phase(Infinity, "nightmare case", () => {
    `   α = 1\t // comment\r\n   β="hi\nthere"\rγ = 3`;
  });
});

//? BOM (Byte Order Mark) at start of file (e.g. \uFEFF)?

//? maybe do some fuzzing?

/* --------------------------------- Helpers -------------------------------- */

function testBasicToken(token: string, type: TokenType) {
  const tokens = tokenize(token);

  expect(tokens).toHaveLength(1);
  expect(tokens[0]).toBeToken(type, token);
}

type SimplifiedToken = Pick<Token, "type" | "value">;
function simpleTokenComparator(token: SimplifiedToken, expected: SimplifiedToken) {
  expect(token).toBeToken(expected.type, expected.value);
}

function compareTokenList<T extends Partial<Token>>(
  tokens: T[],
  expected: T[],
  expectCustom: (token: T, expected: T) => void,
) {
  expect(tokens).toHaveLength(expected.length);
  tokens.every((t, i) => expectCustom(t, expected[i]));
}
