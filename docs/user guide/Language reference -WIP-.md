#TODO This document is to explain the syntax and elements of the language in a way that makes it easy for users to learn the language.





---

# Old docs

# Current language spec
This document contains the current behavior of the language.
We are currently implementing phase 4 of the roadmap.
## Notes
The following phase 4 features are not implemented yet:
- const variable
- for, break, continue
## Limitations and bugs
This is henry:🦗


## Primitive types
+ `int32`
+ `bool`

## Operators
+ Arithmetic: `+`, `-`, `*`, `/`, `%`
+ Comparison: `==`, `!=`, `<`, `>`, `<=`, `>=`
+ Logical: `||`, `&&`,
+ Bitwise: `|`, `&`,  `^`
## Variables
Variables are declared with `var` and constants are declared with `const:
+ Variables are block-scoped
+ Variables must be declared before use
+ Reassignment is allowed for `var`
+ `const` values cannot be reassigned after initialization
+ Both `var` and `const` support type annotations. If no type is provided, it is inferred from the value provided.

```
var x = 10;
var y: int32 = 5;
const limit = 100;
```

## Control flow
The language supports standard structured control flow:
- `if`, `else if`, `else`
- `while`, `for`
- `break`, `continue`

```
for (var i = 0; i < 10; i = i + 1) {
  if (i % 2 == 0) {
    continue;
  } else if (i > 7) {
    break;
  }

  print i;
}
```

The test condition in `if`, `while` and `for` statements needs to be a boolean and cannot be an int. Only one expression can be used in the update block of a `for` loop. You can use a block `{...}` if you need more than one.

## Functions
Functions are declared with `function`.
- Parameters are locally scoped
- Parameters require type annotations
- Return types are optional if no value is returned
- `return` exits the function immediately
- There are currently no way of forward declaring functions and thus recursive functions are impossible.

```
function max(a: int32, b: int32): int32 {
  if (a > b) {
    return a;
  }
  return b;
}
```

## Built-in print
You can use the `print` keyword to print the value of the expression that comes after.
```
var a = 5;
print 1;
print a;
```

## Examples

### Fizz Buzz
```
const Fizz = 70 /*F*/ + 105 /*i*/ + 121 * 2* /*zz*/;
const Buzz = 66 /*B*/ + 117 /*u*/ + 121 * 2* /*zz*/;

const n = 15;
for (var i = 1; i < 15; i = i + 1) {
	if (i % 3 == 0 && i % 5 == 0) {
		print Fizz + Buzz;
	} else if (i % 3 == 0) {
		print Fizz;
	} else if (i % 5 == 0) {
		print Buzz;
	} else {
		print i;
	}
}

```



