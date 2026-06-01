
+ structs and arrays
+ de-structuring/multi variable declaration
+ hoisting (functions and variables)
+ closure, lambdas and functions inside functions
+ type casting
+ import/export to and from WASM module
+ import/export between files








+ Sum types (tagged enum)
+ Explicit null. All nulls are explicit.
+ Errors as values, but with dedicated syntax (unlike go, why do you not make it easier. I love writing `if (error != nill)` everywhere, its so great! I love wasting time!)



## Future Features

### General features
- [ ] multiple variable declaration / assignment (destructuring?)
- [ ] add multiple file support

### Data structures

### Type system
- [ ] type assertion/casting? alias?
- [ ] ensure each return path returns a value / the right thing

- [ ] type table? Define a TypeTable — a unified registry of all types.
- [ ] Add type aliases and user-defined types
- [ ] Implement type unification/inference (so you can infer let x = add(1, 2) correctly).
- [ ] enum (should also be considered an int so we can use it to index stuff? Or a way to assign a string to each enum so we can easily print it.)
- [ ] Add type comparison rules (so enums and ints can coerce properly).
	- [ ] only coerce up (meaning from A to B where A ⊂ B ), and only when needed.
	- [ ] some coercion with numbers, ex: int / float
	- [ ] runtime cast that returns an Option<>. reinterpret?
	- [ ] explicit cast with `as`
- [ ] Bounds checks on arrays/slices

### Meta

- [ ] warn about unused variables, dead code.
- [ ] handle comments better. We might want to preserve them in the output.
- [ ] environments (in browser vs node. What does the host support). Maybe just a config for the ts project?

### Optimization
- [ ] constant folding
- [ ] dead code elimination
- [ ] simplify jumps/empty blocks.
- [ ] SSA
	- [ ] liveness analysis (needed for SSA & register allocation)
	- [ ] phi nodes for control flow merges
	- [ ] Basic optimizations:
		- [ ] Constant folding
		- [ ] Dead code elimination
		- [ ] Simplify jumps (if (true) → inline body)
- [ ] Alignment (will be important when we will start mixing int8, int32, int64 together)

### STD
- [ ] basic I/O
	- [ ] file system
- [ ] string builder

## Feature ideas

- tuple type (+ a bunch of variations inspired by JS (spread, destructuring, ...))
- define struct inline?
- union, intersection types
- Memory arenas
- Add a way to have highlighting for like SQL or something like that baked in the language itself using the constraints or meta programming.

- Maybe we would want something like `declare const x: int32` so we can have sort of header(or like .d.ts) files?

<!-- https://www.youtube.com/watch?v=WwkuAqObplU -->
- Is it possible to statically analyze the code to find places where we can potentially get cache misses? Or other things for optimization? Does it even matter for WASM?
- is there a way to make optimizations easy with a way to magically transform calling a method on each item in a list of objects into calling a function on the list of objects. (like turning a Update method into a ECS) and do that with very little effort? Might still be a bad idea, but could be interesting to explore.
- Can we detect waste in struct memory and pack them differently? ex: {a: bool; b: string; c: bool} -> { b: string; a: bool; c: bool;} is more memory efficient. Order largest -> smallest

+ green threads
### Metaprogramming
Hook into compiler events (like file open)
Maybe allow types/generics to bring things in from the calling context? Like "pull variable named x". Might not be explicit enough for us (but we could require it when calling the function or have some other syntax that provides it so that we can control what gets pulled in?).
