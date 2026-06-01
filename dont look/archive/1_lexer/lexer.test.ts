// Unit tests

import { Lexer } from "./lexer";
import { tokenListToStringJson } from "./token";

describe("patterns", () => {
  //TODO check each pattern to make sure that the regex is right.
});

//TODO check each handler to make sure it works like it should
test.todo("defaultHandler");
test.todo("stringHandler");
test.todo("numberHandler");
test.todo("symbolHandler");
test.todo("skipHandler");
test.todo("commentHandler");

//TODO test lexer
describe("Lexer", () => {
  test.todo("advanceN");
  test.todo("getCurrent");
  test.todo("remainder");
  test.todo("push");
  test.todo("atEOF");
  test.todo("test");

  describe("tokenize", () => {
  });
});

// Regression tests
describe("Lexer regression", () => {
  describe("Simple syntax", () => {
    test("Test 1", () => {
      const program = "const x = 10;";
      const lexer = new Lexer(program);
      const tokens = lexer.tokenize();
      expect(JSON.stringify(tokens, tokenListToStringJson)).toMatchInlineSnapshot(
        `"[{"type":"Const","value":"const"},{"type":"Identifier","value":"x"},{"type":"Assignment","value":"="},{"type":"Number","value":"10"},{"type":"EndOfStatement","value":";"},{"type":"EOF","value":"EOF"}]"`,
      );
    });
    test("Test 2", () => {
      const program = `const x = 10;
var y = 20;
var sum = 0;

if (x == y) {
	y = 1;
} else if (x == 10) {
	y = 2;
} else {
	y = 3;
};

for (var i = 0; i < y; i = i + 1) {
	sum = sum + y * i;
}

for (true) {
	break;
}
`;
      const lexer = new Lexer(program);
      const tokens = lexer.tokenize();
      expect(JSON.stringify(tokens, tokenListToStringJson)).toMatchInlineSnapshot(
        `"[{"type":"Const","value":"const"},{"type":"Identifier","value":"x"},{"type":"Assignment","value":"="},{"type":"Number","value":"10"},{"type":"EndOfStatement","value":";"},{"type":"Var","value":"var"},{"type":"Identifier","value":"y"},{"type":"Assignment","value":"="},{"type":"Number","value":"20"},{"type":"EndOfStatement","value":";"},{"type":"Var","value":"var"},{"type":"Identifier","value":"sum"},{"type":"Assignment","value":"="},{"type":"Number","value":"0"},{"type":"EndOfStatement","value":";"},{"type":"If","value":"if"},{"type":"OpenParen","value":"("},{"type":"Identifier","value":"x"},{"type":"Equals","value":"=="},{"type":"Identifier","value":"y"},{"type":"CloseParen","value":")"},{"type":"OpenCurly","value":"{"},{"type":"Identifier","value":"y"},{"type":"Assignment","value":"="},{"type":"Number","value":"1"},{"type":"EndOfStatement","value":";"},{"type":"CloseCurly","value":"}"},{"type":"Else","value":"else"},{"type":"If","value":"if"},{"type":"OpenParen","value":"("},{"type":"Identifier","value":"x"},{"type":"Equals","value":"=="},{"type":"Number","value":"10"},{"type":"CloseParen","value":")"},{"type":"OpenCurly","value":"{"},{"type":"Identifier","value":"y"},{"type":"Assignment","value":"="},{"type":"Number","value":"2"},{"type":"EndOfStatement","value":";"},{"type":"CloseCurly","value":"}"},{"type":"Else","value":"else"},{"type":"OpenCurly","value":"{"},{"type":"Identifier","value":"y"},{"type":"Assignment","value":"="},{"type":"Number","value":"3"},{"type":"EndOfStatement","value":";"},{"type":"CloseCurly","value":"}"},{"type":"EndOfStatement","value":";"},{"type":"For","value":"for"},{"type":"OpenParen","value":"("},{"type":"Var","value":"var"},{"type":"Identifier","value":"i"},{"type":"Assignment","value":"="},{"type":"Number","value":"0"},{"type":"EndOfStatement","value":";"},{"type":"Identifier","value":"i"},{"type":"Smaller","value":"<"},{"type":"Identifier","value":"y"},{"type":"EndOfStatement","value":";"},{"type":"Identifier","value":"i"},{"type":"Assignment","value":"="},{"type":"Identifier","value":"i"},{"type":"Add","value":"+"},{"type":"Number","value":"1"},{"type":"CloseParen","value":")"},{"type":"OpenCurly","value":"{"},{"type":"Identifier","value":"sum"},{"type":"Assignment","value":"="},{"type":"Identifier","value":"sum"},{"type":"Add","value":"+"},{"type":"Identifier","value":"y"},{"type":"Multiply","value":"*"},{"type":"Identifier","value":"i"},{"type":"EndOfStatement","value":";"},{"type":"CloseCurly","value":"}"},{"type":"For","value":"for"},{"type":"OpenParen","value":"("},{"type":"Identifier","value":"true"},{"type":"CloseParen","value":")"},{"type":"OpenCurly","value":"{"},{"type":"Break","value":"break"},{"type":"EndOfStatement","value":";"},{"type":"CloseCurly","value":"}"},{"type":"EOF","value":"EOF"}]"`,
      );
    });
  });
});
