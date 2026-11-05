Current phase: 4

## Phase 1 - First step
- [x] Basic operators
- [x] variable declaration (no checks on the name, we assume each identifier is unique)
- [x] number (int32)
- [x] print

## Phase 2 - Control flow
- [x] Boolean
	- [x] Token
	- [x] AST
	- [x] Type checking
- [x] Comparison operators

- [x] Blocks/context for name resolution
	- [x] tokens
	- [x] AST
	- [x] HIR

- [x] Assignment expression

- [x] Control flow
	- If
	- Loop (while)
	- [x] tokens
	- [x] AST
	- [x] HIR
	- [x] MIR
		- [x] Turn MIR into a CFG form (control flow graph)
		- [x] ~~Do we do dominators here? Or when lowering to LIR? I think its better if we do it here.~~ No, we just mark loop headers and joining blocks when we create the MIR. That way, we don't need to compute it from the MIR, we just remember it from the HIR.
		- [ ] static single assignment?
	- [x] LIR
	- [x] WASM
- [x] shadowing variables

## Phase 3 - Functions and types
- [x] Comments
	- [x] tokens: ignore comments.
- [x] Add '_' to identifiers
- [x] Type definition on variables
	- [x] tokens
		- [x] add `:` token
	- [x] AST
		- [x] Add type definition to variable declaration statement
	- [x] HIR
	 - [x] Check type definition when declaring a variable, then infer. If no inference and no type declaration, error.
- [x] functions
	+ Only at the top level of a file. If we find one inside a context (if, other function, etc) we may or may not make errors (its not worth trying to handle those edge cases because we will change that behavior later anyway).
	+ We might need to do hoisting like JS or declaration like in C. But that will be later.
	- [x] tokens
		- [x] Add `function` token
		- [x] Add `return` token
	- [x] AST
		- [x] parse function declaration statement.
		- [x] parse the parameters and their type definition
		- [x] parse return statement
		- [x] parse function call
	- [x] HIR
		- [x] should be pretty simple. Just handle the new AST nodes.
		- [x] type check the return statement
	- [x] MIR
		- [x] Quite complex. We need to separate the function definition from the rest of the statements in the file.
		- [x] Then, we handle the statements of the file and the contents of the functions (we might need to handle some context here if we allow to use global variables in the functions)
	- [x] LIR

## Phase 4 - Architecture and toolchain
- [x] create compiler tests (and tests for each phases).
- [ ] debug compiler
	- [ ] flags? or just configs for the step to stop at (ex: --emit-mir)
- [ ] debug WASM
- [ ] error codes/actually good errors
	- [ ] Store line/column and file info in every AST node.
	- [ ] Emit colored diagnostics (`error[E001]: unknown type 'foo'`).
	- [ ] Pretty-print the code span with arrows (--> file.my:3:7).
- [ ] lsp + debugger? While we're procrastinating, why not do something useful
- [ ] + vs code extension while we're at it.

- [ ] const variable
- [ ] for, break, continue

## Phase 5 - The rest of the fucking owl
- [ ] function declaration hoisting / recursive functions
- [ ] simple import/export
	+ just add a simple way to import/export functions through WASM (no inter/multi file yet)
	+ `import function add(x: int32, y: bool) {};`
	+ `export function add(x: int32, y: bool) {...};`
	- [ ] tokens
		- [ ] `import`, `export`
	- [ ] AST
		- [ ] Add import/export on function declaration statements (we don't need to add special case for import, we will just not check its body ever.)
	- [ ] HIR
		- [ ] I don't think we have much to do here other than maybe resolving the types
	- [ ] MIR
		- [ ] In the function definition, add a field for import or export.
	- [ ] LIR
		- [ ] Add a way to handle the import/export. Make sure the names are clean (the context might butcher the names)
	- [ ] WASM
		- [ ] Just handle the new stuff from the LIR

- [ ] all basic types (and a better system to define them?): `i8, i16, i32, i64, u8, u16, u32, u64, f32, f64, bool, char?`
- [ ] type casting/conversion
	+ any safe widening can be implicit (ex from int32 to int64 `var a: int32 = 5; var b: int64; print a + b;` a is implicitly cast to int64)
	+ narrowing needs to be done explicitly. `var a: int64 = 5; var b: int32 = a as int32;`
	+ how do we detect how to do our narrowing? ex `i64 -> f32` should we first do i32 then f32?

- [ ] all math operators (and combined assignment)
	+ All types
	- [ ] ==, !=
	+ numeric types (int, float, not bool?)
	- [ ] <, >, <=, >=
	- [ ] +, -, *, /, %
	- [ ] &, |, ^, ~
	- [ ] - (unary), + (? could be an explicit cast to number/int? Like for char, we could do `${+x}` and get the number value instead of the character?)
	- [ ] ++, -- (prefix and suffix)
	- [ ] ** (?)
	+ bool
	- [ ] &&, ||, !
	+ int only
	- [ ] <<, >>, >>> (how do we handle variable number of bit shift? a loop?)
	+ combined assignment
	- [ ] +=, -=, *=, /=, %=
	- [ ] &=, |=, ^=
	+ other
	- [ ] ? (ternary)
	- [ ] , (comma, in for loop init and increment blocks)
	- [ ] ?? (? not useful until we have null)
	- [ ] .. (string concatenation ?)
	- [ ] delete (?)

## Phase 6 - with blackjack and hookers
- [ ] structs and arrays
	- [ ] arrays need the size, structs need their contents
	- [ ] `[]` and `.` operators
	- [ ] inline initialisation (`a = [1,2,3]; b = {a:1,b:2,c:3}`)
		- [ ] how do we handle structs constructors?

- [ ] shadow stack: 4 pages, 256 KiB  for small programs, 16 pages, 1MiB for general dev.
- [ ] raw pointers (for data)
	- [ ] WASM
		- [ ] Need linear memory to do that.
- [ ] heap allocation
- [ ] null / nullable ref (just do like *?int32)
- [ ] function pointer (for traits)
- [ ] slices? (window into an array. contains pointer and size (and max size if we allow them to grow))
- [ ] graceful recovery

## Phase 7
- [ ] traits
- [ ] iterators? 2 ways: 1 flatten loop (for built in types). 2 struct + function. The struct retains the state for each iteration. iter_next is called each iteration.
- [ ] for ... of ... (needs iterator)
- function closure + lambda


