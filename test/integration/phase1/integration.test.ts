import { makeFileTest, makeSourceTest } from "../../utils/integration";

//TODO test error cases

// 000 Structure
// 100 Variable Declarations
// 200 Operator Precedence and Associativity
// 300 division and unary
// 400 complex expressions

// 800 stress test
// 900 comprehensive

describe.phase(1, "integration", () => {
  describe("000: structure", () => {
    // TODO more structure checks, like checking statements vs expression and stuff like that. And missing parts (like identifiers)

    it(
      "001: missing semi colon",
      //Not an error after feature auto insert
      makeSourceTest(
        [NaN],
        `var x = 1`,
        `print x;`,
      ),
    );

    //TODO infinite loop?
    it.skip(
      "051: bad operator",
      makeSourceTest(
        [NaN],
        `print 1 = 2;`,
      ),
    );
  });

  describe("100: variable declaration", () => {
    it(
      "101: simple assignment",
      makeSourceTest(
        [5],
        `var x = 5;`,
        `print x;`,
      ),
    );

    it(
      "102: multiple declaration",
      makeSourceTest(
        [3],
        `var a = 1;`,
        `var b = 2;`,
        `print a + b;`,
      ),
    );

    it(
      "103: chained usage",
      makeSourceTest(
        [20],
        `var a = 3;`,
        `var b = a + 2;`,
        `var c = b * 4;`,
        `print c;`,
      ),
    );

    it(
      "151: redeclaration",
      makeSourceTest(
        [NaN],
        `var a = 1;`,
        `var a = 2;`,
        `print a;`,
      ),
    );

    it("152: uninitialized", makeSourceTest([NaN], `print x;`));

    it(
      "153: assignment before declaration",
      makeSourceTest(
        [NaN],
        `x = 10;`,
        `print x;`,
      ),
    );
  });

  describe("200: operator precedence, associativity and grouping", () => {
    it(
      "201: basic precedence",
      makeSourceTest(
        [14, 20, 5],
        `print 2 + 3 * 4;`,
        `print (2 + 3) * 4;`,
        `print 10 - 3 - 2;`,
      ),
    );

    //TODO handle errors
    it("251: unbalanced parentheses", makeSourceTest([NaN], `print (1 + 2;`));
  });

  describe("300: division and unary", () => {
    it("301: integer division", makeSourceTest([3], `print 7 / 2;`));

    it("302: unary", makeSourceTest([-8], `print -5 + -3;`));
  });

  describe("400: complex expression", () => {
    it(
      "401",
      makeSourceTest(
        [23, 14, 141],
        `var x = (2 + (3 * (4 + 5))) - 6;`,
        `print x;`,
        ``,
        `print 10 + 2 * 3 - 4 / 2;`,
        ``,
        `print 1 + 2 * 3 + 4 * 5 + 6 * 7 + 8 * 9;`,
      ),
    );
  });

  describe("800: stress test", () => {
    it(
      "801: variable declaration",
      makeSourceTest(
        [15],
        `var a=1;var b=2;var c=3;var d=4;var e=5;`,
        `print a+b+c+d+e;`,
      ),
    );

    it(
      "802: long line",
      makeSourceTest(
        [30],
        `print 1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1;`,
      ),
    );

    it(
      "803: parentheses",
      makeSourceTest(
        [3],
        `print (((((((((((((((((((1+2)))))))))))))))))));`,
      ),
    );

    it("804: reuse variables", makeSourceTest([3], `var a=1; a=a+1; a=a*2; a=a-1; print a;`));
  });

  describe("900: sample programs", () => {
    it("901", makeFileTest(__dirname, 901, [15]));
    it("902", makeFileTest(__dirname, 902, [8]));
    it("903", makeFileTest(__dirname, 903, [20]));
    it("904", makeFileTest(__dirname, 904, [47]));
    it("905", makeFileTest(__dirname, 905, [249]));
  });
});
