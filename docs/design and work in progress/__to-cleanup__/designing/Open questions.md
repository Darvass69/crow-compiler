This is a list (small description + link to a document where we dive deeper) of problems and questions that we don't have answers for yet.
___

## Blocks as expressions?
We could make all blocks (`{...}`, `if`, ...) return a value, but I don't like implicitly returning the last statement. It doesn't feel very explicit.

## Function and global variable hoisting
If we want a flexible, script like fell to the language, having function declarations be hoisted would massively improve ergonomics, but at the cost of making things very complex with globals. The main error case:
```
var x = foo();
function foo() { return x }
```
We need to catch this and any other similar cases (that could become very complex if they happen cross module)
- A solution would be to make all globals like an `Option<>`, or `T | null`

## Borrowing: How?
I want a borrowing/ownership/lifetime model that is more flexible than Rust that is still mostly memory safe. I don't know how to do it though.

## Metaprogramming
How much of metaprogramming do we want, and what should it look like? Macro? Runtime reflection? Compile time reflection? Compiler plugin?




