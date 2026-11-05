<font color="#f79646">Not decided on it</font>
<font color="#c0504d">Needs a lot of design and decisions</font>
<font color="#8064a2">Need to decide on specific rules</font>
<font color="#4bacc6">Could change because of other features</font>
<font color="#9bbb59">Decided/not a complicated design</font>

# Core syntax
- <font color="#9bbb59">Variables, Constants, Assignments</font> #core 
- <font color="#4bacc6">Blocks, Statements, Expressions</font> #core %% (we might move to an expression language eventually, but it won't change the design of the parser until we get there) %%
- <font color="#4bacc6">if/else, switch</font> #core %% switch might be removed once we have pattern matching, if could be an expression %%
- <font color="#f79646">ternary</font> #level1 %% Might need to do ternary differently if we want to use `?` for something else %%
- <font color="#c0504d">pipe operator</font> #level1
- <font color="#f79646">match, exhaustiveness checking</font> #level1 %% Not sure how we'll add pattern matching %%

+ <font color="#9bbb59">for loops, while loops </font> #core
+ <font color="#9bbb59">Break, continue</font> #core %% Not sure about labels, but if we just follow js, its going to be fine %%
+ labels #level1 %% Not sure about labels, but if we just follow js, its going to be fine %%
+ <font color="#8064a2">for ... of, iterators, iterable, iteration constructs</font> #level1 %% not sure how iterators will work %%
+ <font color="#c0504d">generators</font> #level3

- <font color="#9bbb59">functions, closures, lambdas, anonymous functions, Higher-order functions.</font> <font color="#f79646">We might want explicit closure capturing?</font> #core
+ <font color="#4bacc6">partial application of functions (just sugar of `(...p) => foo(x, ...p)` (make a lambda that captures `x` and use it as param of the function))</font> #level1 %% I'm just not sure about the syntax, and it could be influenced by/influence how we do constructors, maybe constructor syntax will allow partial application of any parameter of the function %%

- native data structures
	- <font color="#8064a2">arrays, structs</font> #core %% I have an idea to make structs and arrays work the same, with heavy inference so we can easily do structural typing without having to define types most of the time %%
	- <font color="#c0504d">slices? views? ranges?</font> #core%% not sure how we'll be doing them, are they inherent to the language, or just from the std lib? %%
	- <font color="#c0504d">pointers, ref?</font> #core
	- <font color="#c0504d">smart pointers (native?, std lib?)</font> #level1
		- Reference counting (either with the language semantics directly, or a type that boxes a value)
		- Pointer arithmetic?
	- <font color="#c0504d">Enums</font> #level1
	- <font color="#f79646">computed properties? Not sure, but it could be like getter/setter.</font> #level3
	+ <font color="#8064a2">strings</font> 
		+ <font color="#9bbb59">inline strings</font> #core
		+ <font color="#c0504d">string data type</font> #core 
		- <font color="#f79646">concat operator? shared with array?</font> #level3
		- <font color="#8064a2">Raw and multiline strings</font> #core
		- <font color="#8064a2">String interpolation and templates</font> #level1
		- handle multiple encodings for strings #level2

- Manual memory management
	- <font color="#8064a2">malloc, calloc, etc are from the std lib, but for now, we just use a bump allocator</font> #core
+ <font color="#c0504d">? Panic and recovery mechanisms? (do we want to be able to panic? Or do we always want to handle any error that might happen?)</font> #core

- <font color="#8064a2">namespaces, modules, nested modules, packages</font> #core %% (some of those might be merged into the same concepts, not sure how we'll do ) %%
	- <font color="#8064a2">import/export/re-export, </font>
		- <font color="#8064a2">visibility of elements (internal, external)</font>
		- <font color="#8064a2">alias elements when import and export</font>

+ Deferred execution and cleanup blocks #level1 
+ Tail-call optimization #level1

- Serialization and deserialization, Schema definitions, Migrations and versioned data models #level2

- threading and deferred execution #level2
	+ Threads, green threads, fibers 
	+ Tasks, futures, promises
	+ Async/await
	+ Coroutines
	+ Channels and message passing
	+ Cancellation and timeouts
	+ Parallel collections and computations
	+ Data-race prevention
	+ Atomics, locks, semaphores, monitors
	- <font color="#c0504d">reactivity/signals? (like react, but compiled?)</font> #level2

+ Continuations (not sure I understand them, but it might be useful for the runtime stuff, or to allow some code to run at anytime/pause execution?) #level2

# Type system
+ structural typing #core
	+ might add a way to do nominal in cases where its needed. #level2
+ static typing, but with heavy inference #core
	+ anonymous/inferred struct and array layout (you can make a struct with just names, and it will infer the types of its fields from usage)

+ <font color="#8064a2">algebraic data types (sum and product types)</font> #core
+ <font color="#8064a2">tagged unions / sum types</font> #core
+ <font color="#8064a2">Nullable, non-nullable, optional types</font> #core

+ composite and recursive types, or at least something like more complex types #level2 
+ type aliases and branding (making a type not compatible with another, like an int that can't be used like an int) #level2
+ Generics, higher-kinded types #level2
+ constraints, Refinement, dependent, existential types #level2

+ interface, traits #core

- Ownership, borrowing, lifetimes #level1 

- Move and copy semantics #level2
+ constructor, destructor semantics #level2
	+ A way to specify which param the value goes to?
+ immutability (by default?) #level2
+ Pure functions #level2
+ multiple dispatch (reflection on the type at runtime to select the function to call) #level3 

- Snapshots and checkpoints #level3 
- Transactional state,  Transactional memory #level3 
- Replay, Replayable execution #level3 

+ ? function overloading, operator overloading, dispatch system #core
	+ static dispatch, dynamic dispatch, multiple dispatch (reflection on the type at runtime to select the function to call)
	+ ? User-defined operators? #level2 
	+ ? Extension methods (a way in c# to add methods to existing classes) #level2 

+ Contracts, preconditions, postconditions #core
+ Invariants and assertions #level1 
+ Static verification and compile-time checks #level1 

+ permission tracking (user vs admin), Authority delegation and revocation, Secret and tainted data types %% I think we don't need features specifically for that, I think the other features can be used for most, if not all, the tracking we need (typestate I think will do a lot) %% Capability systems #level3 

+ dynamic scope #level3 %% (variables are scoped from the call stack/what calls the function can add to the scope, a bit like what happens if you use macros to inject code (the scope of the surrounding of the macro call is used inside the context of the macro)) (we could have a system that makes something like that usable, but I don't know how useful it would be) The system could be something like a context. When you need something from the caller, you can get it from the context (`context.foo`), then you can provide the context when calling a function. It could be a way to do more dynamic scope, but it might get really annoying. But it would have one benefit, it would be very easy to change the malloc used to be an arena instead of the default one, and you could just switch arenas whenever you need to %%

# Builds and metaprogramming
- Build profiles/build scripts (or do we just make any code run at comptime? cmake?) #level2 
- Compile-time resource generation #level2
- Compile-time asset embedding? #level2
- Metaprogramming #level2
	+ Macros (textual, hygienic, procedural) 
	+ Code generation
	+ Compile-time evaluation
	- Compile-time and runtime reflection
	- AST manipulation
	- Template metaprogramming
	- Decorators and annotations
	- Compiler plugins and extensions
	- Derivation systems and auto-generated implementations
	- Runtime type information and reflection metadata

# Compiler and runtime
## Runtime
- Hot reloading and live patching #level2
- Interactive REPLs #level2
- Notebook execution #level2

## Compiler/tooling
- Language-server integration, Compiler diagnostics #core
- Package management #level1 
	- Maybe even a way to (easily) patch dependencies to fix issues
- Compiler-enforced formatting, Documentation generation, Refactoring support #core
- Optional semi colon/automatic insertion
- Self-hosting and compiler extensibility, Syntax extension #level1 
- Language versioning, Feature gates, Feature flags #level1

- `.d.ts` equivalent #level1
- maybe ffi with typescript? Read `.d.ts` files? #level2 


# STD lib
- data structures
	-  lists, vectors? (dyn arrays could be native, and lists are just an array of union types?)
	-  Maps, dictionaries, sets
	-  Immutable and persistent collections

- Garbage collection (not by default, but possibility to box a value to be GC managed) #level2 
- Stack, heap, arena, region allocation
- Result and option types
- Bitwise operations and bit fields (bit fields as native type? Like an enum specifically for bit fields? Might be worth it.)
+ Feature flags

- integrated testing framework
	- Unit, integration, and benchmark tests
	- Property-based testing
	- Fuzz testing
	- Executable documentation
	- Formal verification hooks
	- Proof annotations

- raylib bindings #level3
- Audio primitives #level3
- Vector, matrix, geometry, and color types #level3
- science stuff #level3
	- Scientific-computing primitives
	- Rational and complex numbers
	- Units of measure and dimensional analysis, Currency-aware values
	- Significant-figure and uncertainty tracking
	- Statistical and probabilistic values
	- floating point math
	- fixed-point, arbitrary-precision arithmetic (big int)
	- coordinate spaces/rotation (NED, etc.)

- logging and metrics
	- Structured logging
	- Metrics
	- Tracing
	- Telemetry

- time and date
	- Durations and timestamps
	- Monotonic and wall-clock time
	- Time zones and calendars
	- Temporal validity and expiration
	- Event chronology tracking
	- Temporal assertions

- Data Systems and APIs
	- Embedded query languages
	- Compile-time query validation
	- REST, RPC, and service definitions
	- Client and server code generation


















---

- random
	- GUI systems
	- Game-engine primitives
	- Machine-learning and tensor primitives (probably not)
	- Data-pipeline primitives
	- logic programming (not really a space I know or care too much about)
		- Constraints and constraint solving
		- Logic variables
		- Unification
		- Rules and facts
		- Relational queries
		- Declarative inference
		- Backtracking
	- strings
		- Unicode/string encoding tracked in the type system
		- Regular-expression literals
		- Compile-time regex validation



- Functional
	+ everything as expression?
	+ Lazy evaluation, streams, lazy lists, infinite sequences
	+ Typeclasses, Monads, Applicatives, Functors
	+ Algebraic effects and effect handlers

- Memory and Resource Management
	- Escape analysis
	- Weak references and interior mutability
	- Deterministic destruction and RAII
	- Unsafe memory access

- Systems Programming
	- Pointer arithmetic
	- Memory layout, alignment, packed structures
	- Fixed-width numeric types
	- SIMD and vector operations
	- Inline assembly
	- Foreign function interfaces
	- ABI and calling convention control
	- Memory-mapped and volatile access

- Concurrency and Parallelism
	+ Actor systems and supervision trees.
	+ Structured concurrency

- Security and Trust
	- Information-flow control
	- Data classification levels
	- ? Audit and compliance annotations
	- Cryptographic identities

-  State and Persistence
	- State machines and verified transitions
	- Event sourcing
	- Persistent data structures
	- Replay logs

- Observability
	- Event streams
	- Dependency tracking

- compiler
	- Dependency resolution
	- Reproducible builds
	- Feature flags
	- Build profiles
	- Cross compilation
- Capability-based runtimes
- Embeddable runtimes



---
- Memory layout, alignment, packed structures

- SIMD and vector operations

- composite, recursive types

+ iterators/indexers
+ iteration/iterable, so that any type can be in a for of loop.

+  operator overloading
+ ? User-defined operators?
+  Extension methods (a way in c# to add methods to existing classes)

+ Continuations (not sure I understand them, but it might be useful)

- Ownership, borrowing, lifetimes
- Escape analysis
- Weak references and interior mutability
- Deterministic destruction and RAII
- Unsafe memory access

+ maybe we can have special syntax for iteration or operations on iterable? It would help in the cases when we need to iterate over something, like a the keys of a struct. It would just be sugar to call a method on it.
