import { makeFileTest, makeSourceTest } from "../../utils/integration";

//TODO

// bool type checking
//		true false in expressions
//		non-bool in bool context (if (1), while (1)) -> maybe we will change this behavior later
//		(phase 3) assigning non bool to bool `var b: bool = 123;`
//		using bool as a number `var x = true + 1;`

// comparison operators
//		<, ==,  -> gives a bool
// 		true == false
// 		invalid comparison `1 < true`, `fn1 == fn2`
//		Comparison inside complex expression: `print 1 < 2 == true;`

// block
//		variable from parent context `var a = 5; {print a}`
//		variable from child context `{var a = 5} print a;`
//		multiple nested blocks `var a = 5; {var b = 6; {var c = 8; print a + b + c;}}`
//		shadowing `var a = true; {var a = 5; print a} print a;`

// assignment expression
//		assign int to int and bool to bool
//		reassign in child context `var x = 0; {x = 10} print x;`
//		shadowed variable `var x = 0; {var x = 99; x = 42; print x} print x;`
//		wrong type `var b = false; b = 123;`
//		undeclared variable `a = 5; print a;`
//		assignment inside expression `var x = 0; while ((x = x + 1) < 5) {print x}`
//		assignment of not yet shadowed in child `var x = 0; {x = 69; var x = 99; x = 42; print x} print x;`
//				I don't know what we should do here.

// control flow
//		simple blocks `var i = 0; while (i < 10) {if (i % 3 == 0) {print i;} else if (x > 5) {print 2 * i;} else {print 1 - i}}`
//		no variable leakage between arms of if `if (false) {var x = 5;} else {print x;}`
//		nested loops `var x = 0; while (x < 10) {var y = 0; while (y < 10) {print x * 10 + y; y = y + 1} x = x + 1}`

describe.phase(2, "integration", () => {
  describe("bool type checking", () => {
    it(
      "true false in expressions",
      makeSourceTest(
        [],
        ``,
      ),
    );

    it(
      "non-bool in if test",
      makeSourceTest(
        [NaN],
        `if (1) {print 1;}`,
      ),
    );

    it(
      "non-bool in while test",
      makeSourceTest(
        [NaN],
        `while (1) {print 1;}`,
      ),
    );

    it("using bool as a number", makeSourceTest([NaN], `var x = true + 1;`));
  });

  describe("comparison operators", () => {
    it(
      "comparison gives bool",
      makeSourceTest(
        [2],
        `var x = 5 > 6;`,
        `if (x) {print 1;}`,
        `else {print 2;}`,
      ),
    );

    it(
      "bool equality",
      makeSourceTest(
        [2],
        `if (true == false) {print 1;}`,
        `else {print 2;}`,
      ),
    );

    it(
      "invalid comparison between int and bool",
      makeSourceTest(
        [NaN],
        `var x = 1 < true;`,
      ),
    );

    //TODO phase 3
    it(
      "invalid comparison between functions",
      makeSourceTest(
        [NaN],
        ``,
      ),
    );

    it(
      "comparison inside complex expression",
      makeSourceTest(
        [1],
        `print 1 < 2 == true;`,
      ),
    );
  });

  describe("block", () => {
    it(
      "variable from parent context",
      makeSourceTest(
        [5],
        `var a = 5; {print a;}`,
      ),
    );

    it(
      "variable from child context",
      makeSourceTest(
        [NaN],
        `{var a = 5} print a;`,
      ),
    );

    it(
      "multiple nested blocks",
      makeSourceTest(
        [19],
        `var a = 5; {var b = 6; {var c = 8; print a + b + c;}}`,
      ),
    );

    it(
      "shadowing",
      makeSourceTest(
        [5, 1],
        `var a = true; {var a = 5; print a;} print a;`,
      ),
    );
  });

  describe("assignment expression", () => {
    describe("assignment respects types", () => {
      it(
        "int",
        makeSourceTest(
          [10],
          `var a = 1; a = 10; print a;`,
        ),
      );

      it(
        "bool",
        makeSourceTest(
          [0],
          `var a = true; a = false; print a;`,
        ),
      );
    });

    it(
      "reassign in child context",
      makeSourceTest(
        [10],
        `var x = 0; {x = 10;} print x;`,
      ),
    );

    it(
      "shadowed variable",
      makeSourceTest(
        [42, 0],
        `var x = 0; {var x = 99; x = 42; print x;} print x;`,
      ),
    );

    it(
      "wrong type",
      makeSourceTest(
        [NaN],
        `var b = false; b = 123; print b;`,
      ),
    );

    it(
      "undeclared variable",
      makeSourceTest([NaN], `a = 5; print a;`),
    );

    it(
      "assignment inside expression",
      makeSourceTest(
        [1, 2, 3, 4],
        `var x = 0;`,
        `while ((x = x + 1) < 5) {`,
        `    print x;`,
        `}`,
      ),
    );

    it(
      "assignment of not yet shadowed in child",
      //TODO I don't know what we should do here.
      // what happens if we do: "var a = 5; {print a; var a = 10;}". Do we want to tell the user that it might be a mistake?
      makeSourceTest(
        [42, 69],
        `var x = 0;`,
        `{`,
        `  x = 69; `,
        `  var x = 99; `,
        `  x = 42; `,
        `  print x;`,
        `}`,
        `print x;`,
      ),
    );
  });

  describe("control flow", () => {
    it(
      "simple blocks",
      makeSourceTest(
        [0, 0, -1, 3, -3, -4, 6, 14, 16, 9, 10],
        `var i = 0;`,
        `while (i < 10) {`,
        `  if (i % 3 == 0) {`,
        `    print i;`,
        `  } else if (i > 5) {`,
        `    print 2 * i;`,
        `  } else {`,
        `    print 1 - i;`,
        `  }`,
        `  i = i + 1;`,
        `}`,
      ),
    );

    it(
      "no variable leakage between arms of if",
      makeSourceTest(
        [NaN],
        `if (false) {var x = 5;} else {print x;}`,
      ),
    );

    it(
      "nested loops",
      makeSourceTest(
        [0, 1, 2, 3, 10, 11, 12, 13, 20, 21, 22, 23, 30, 31, 32, 33],
        `var x = 0;`,
        `while (x < 4) {`,
        `  var y = 0;`,
        `  while (y < 4) {`,
        `    print x * 10 + y;`,
        `    y = y + 1;`,
        `  }`,
        `  x = x + 1;`,
        `}`,
      ),
    );
  });
});
