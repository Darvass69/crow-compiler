import { makeSourceTest } from "../../utils/integration";

// comments
//		already done by tokens, just make sure that they are filtered out

// Add _ to Identifiers
//		already done by tokens

// Type Definitions in Variable Declarations
//		explicit: `var x: int = 123;`
//		No type annotation + no inference `var x; x = 5; print x`
//		type mismatch `var x: int = true`

// Functions
//		function def inside block (fn, if, while, etc)
//		name resolution for params:
//			parameters are resolved properly
//			variables can't have same name as param
//			params can be shadowed in child context
//			shadowing global in function?
//TODO  forward declaration? maybe with special syntax or smt so we can remove it when we do hoisting
//		control flow inside function (especially loop to test br)
//		return type inference/check
//		missing return
//		call
//			correct args
//			incorrect args
//			too many/few args
//			undeclared fn
//			recursion? detect recursion? do we even care?

//TODO		compare fns (fn1 == fn2)

describe.phase(3, "integration", () => {
  it(
    "comments are filtered out",
    makeSourceTest(
      [5],
      `var /* comment */ a /* = 10 */ = 5;`,
      `print a;`,
    ),
  );

  describe("type definitions in variable declarations", () => {
    it(
      "explicit",
      makeSourceTest(
        [123],
        `var x: int32 = 123;`,
        `print x;`,
      ),
    );

    it(
      "no type annotation or inference",
      //TODO eventually we will have usage type inference that won't make an error? or `var x: infer;`?
      makeSourceTest(
        [NaN],
        `var x; x = 5; print x;`,
      ),
    );

    it(
      "type mismatch",
      makeSourceTest(
        [NaN],
        `var x: int = true; print x;`,
      ),
    );
  });

  describe("functions", () => {
    describe("function definition inside block context", () => {
      it(
        "inside function",
        makeSourceTest(
          [NaN],
          `function fn1() {`,
          `  function fn2() {`,
          `    print 1;`,
          `  }`,
          `  fn2();`,
          `}`,
        ),
      );

      it(
        "inside if",
        makeSourceTest(
          [NaN],
          `if (true) {`,
          `  function fn2() {`,
          `    print 1;`,
          `  }`,
          `  fn2();`,
          `}`,
        ),
      );

      it(
        "inside while",
        makeSourceTest(
          [NaN],
          `var i = 0;`,
          `while (i < 10) {`,
          `  function fn2() {`,
          `    print 1;`,
          `  }`,
          `  fn2();`,
          `  i = i + 1;`,
          `}`,
        ),
      );
    });

    describe("parameter name resolution", () => {
      it(
        "parameters are resolved properly",
        makeSourceTest(
          [69],
          `function fn1(a: int32) {`,
          `  print a;`,
          `}`,
          `fn1(69);`,
        ),
      );

      it(
        "variables can't have same name as param",
        makeSourceTest(
          [NaN],
          `function fn1(a: int32) {`,
          `  var a = 42;`,
          `  print a;`,
          `}`,
          `fn1(69);`,
        ),
      );

      it(
        "params can be shadowed in child context",
        makeSourceTest(
          [5, 69],
          `function fn1(a: int32) {`,
          `  if (a < 100) {`,
          `    var a = 5;`,
          `    print a;`,
          `  }`,
          `  print a;`,
          `}`,
          `fn1(69);`,
        ),
      );

      it(
        "shadowing global in function",
        makeSourceTest(
          [4, 5, 69, 42],
          `var a = 69;`,
          `var b = 42;`,
          `function fn1(a: int32) {`,
          `    var b = 5;`,
          `    print a;`,
          `    print b;`,
          `}`,
          `fn1(4);`,
          `print a;`,
          `print b;`,
        ),
      );
    });

    it(
      "control flow inside function",
      makeSourceTest(
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        `function fn1() {`,
        `  var i = 0;`,
        `  while (i < 10) {`,
        `    print i;`,
        `    i = i + 1;`,
        `  }`,
        `}`,
        `fn1();`,
      ),
    );

    it.todo(
      "return type inference",
      //TODO
      makeSourceTest(
        [],
        ``,
      ),
    );

    it(
      "return value",
      makeSourceTest(
        [42],
        `function fn1(): int32 {`,
        `  return 42;`,
        `}`,
        `print fn1();`,
      ),
    );

    it(
      "return void is handled well",
      makeSourceTest(
        [NaN],
        `function fn1(a: int32, b: int32) {`,
        `  print a;`,
        `  print b;`,
        `}`,
        `print fn1(42, 69);`,
      ),
    );

    it(
      "return type check",
      makeSourceTest(
        [NaN],
        `function fn1(): int32 {`,
        `  return true;`,
        `}`,
        `print fn1();`,
      ),
    );

    it(
      "missing return",
      makeSourceTest(
        [NaN],
        `function fn1(): int32 {`,
        `  print 5;`,
        `}`,
        `print fn1();`,
      ),
    );

    describe("call", () => {
      it(
        "correct args",
        makeSourceTest(
          [42, 69],
          `function fn1(a: int32, b: int32) {`,
          `  print a;`,
          `  print b;`,
          `}`,
          `fn1(42, 69);`,
        ),
      );

      it(
        "incorrect args",
        makeSourceTest(
          [NaN],
          `function fn1(a: int32) {`,
          `  print a;`,
          `}`,
          `print fn1(true);`,
        ),
      );

      it(
        "too few args",
        makeSourceTest(
          [NaN],
          `function fn1(a: int32) {`,
          `  print a;`,
          `}`,
          `print fn1();`,
        ),
      );

      it(
        "too many args",
        makeSourceTest(
          [NaN],
          `function fn1(a: int32) {`,
          `  print a;`,
          `}`,
          `print fn1(69,42);`,
        ),
      );

      it(
        "undeclared function",
        makeSourceTest(
          [NaN],
          `print fn1();`,
        ),
      );
    });
  });
});
