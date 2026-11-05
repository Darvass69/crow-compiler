I think this is the full list of anything I might consider adding to the language. I think the list is exhaustive, but I might have missed some stuff.

TODO: clean up the list into priority, and start to make decisions.

## Core
- Variables, Constants, Assignments
- Blocks, Statements, Expressions
- Lexical scope, dynamic scope (variables are scoped from the call stack/what calls the function can add to the scope, a bit like what happens if you use macros to inject code (the scope of the surrounding of the macro call is used inside the context of the macro))
- namespaces, modules, nested modules, packages
- import/export/re-export, 
	- visibility of elements (internal, external)
	- how to refer to elements, alias them
- translation units? headers?
## Types
- Static, dynamic, gradual, optional typing
- Nominal, structural, duck typing
- Type inference (local, global)
- Primitive, composite, recursive types
- Nullable, non-nullable, optional types
- Union, intersection, variant, algebraic data types
- Opaque types, newtypes, type aliases
- Generics, associated types, higher-kinded types
- Variance, constraints, bounded polymorphism
- Refinement, dependent, existential types
- Runtime type information and reflection metadata

## Data structures and values
+ Arrays, lists, vectors, slices, ranges, views
+ Tuples, records, structs, objects
+ Maps, dictionaries, sets
+ Enums, tagged unions, variants
+ Immutable and persistent collections
+ Properties, computed properties, indexers
+ Symbols, atoms, interned values
## Functions and Abstractions
+ functions, methods, procedures
+ closures, lambdas, anonymous functions
+ Higher-order functions (functions that takes functions as parameters)
+ currying, partial application, function composition
+ function overloading, operator overloading, dispatch system
	+ static dispatch, dynamic dispatch, multiple dispatch (reflection on the type at runtime to select the function to call)
	+ ? User-defined operators?
	+ Extension methods (a way in c# to add methods to existing classes)

## Objects
+ ? inheritance (do we even care about it?), or do we favor heavily composition?
+ interface, traits
+ constructor, destructor, factory

## Functional
+ immutability (by default?)
+ Pure functions
+ everything as expression?
+ ? pattern matching?, Exhaustiveness checking (in switch case, check that every value of a sum type/enum/union is dealt with, could be expanded for ifs in general)
+ ? Guards and destructuring
+ Lazy evaluation, streams, lazy lists, infinite sequences
+ Typeclasses, Monads, Applicatives, Functors
+ Algebraic effects and effect handlers

## Control flow
+ if, switch, match
+ loops, iteration constructs
+ Break, continue, labels
+ Ternary and pipe operators
+ Coroutines, generators, iterators
+ Continuations (not sure I understand them, but it might be useful)
+ Deferred execution and cleanup blocks
+ Tail-call optimization

## Memory and Resource Management
- Manual memory management
- Garbage collection
- Reference counting
- Ownership, borrowing, lifetimes
- Move and copy semantics
- Stack, heap, arena, region allocation
- Escape analysis
- Weak references and interior mutability
- Deterministic destruction and RAII
- Unsafe memory access

## Systems Programming
- Pointers and smart pointers
- Pointer arithmetic
- Bitwise operations and bit fields
- Memory layout, alignment, packed structures
- Fixed-width numeric types
- SIMD and vector operations
- Inline assembly
- Foreign function interfaces
- ABI and calling convention control
- Memory-mapped and volatile access

## Concurrency and Parallelism
+ Threads, green threads, fibers
+ Tasks, futures, promises
+ Async/await
+ Coroutines
+ Channels and message passing
+ Actor systems and supervision trees.
+ Structured concurrency
+ Cancellation and timeouts
+ Atomics, locks, semaphores, monitors
+ Transactional memory
+ Parallel collections and computations
+ Data-race prevention

## Error Handling and Correctness
+ Result and option types
+ Error codes and status values
+ Panic and recovery mechanisms
+ Contracts, preconditions, postconditions
+ Invariants and assertions
+ Static verification and compile-time checks

## Metaprogramming
+ Macros (textual, hygienic, procedural)
+ Code generation
+ Compile-time evaluation
- Compile-time and runtime reflection
- AST manipulation
- Template metaprogramming
- Decorators and annotations
- Compiler plugins and extensions
- Derivation systems and auto-generated implementations

## Runtime and Execution
- Hot reloading and live patching
- Capability-based runtimes
- Embeddable runtimes

## Text and String Processing
- Unicode and encoding support
- Raw and multiline strings
- String interpolation and templates
- Regular-expression literals
- Compile-time regex validation

## Mathematics and Numerics
- Fixed-point, floating-point, arbitrary-precision arithmetic
- Rational and complex numbers
- Units of measure and dimensional analysis
- Currency-aware values
- Significant-figure and uncertainty tracking
- Statistical and probabilistic values

## Time and Temporal Logic
- Durations and timestamps
- Monotonic and wall-clock time
- Time zones and calendars
- Temporal validity and expiration
- Event chronology tracking
- Temporal assertions
- Replayable execution


## Security and Trust
- Capability systems
- Permission systems
- Authority delegation and revocation
- Information-flow control
- Secret and tainted data types
- Data classification levels
- ? Audit and compliance annotations
- Cryptographic identities

## State and Persistence
- State machines and verified transitions
- Snapshots and checkpoints
- Event sourcing
- Transactional state
- Persistent data structures
- Replay logs

## Data Systems and APIs
- Schema definitions
- Migrations and versioned data models
- Serialization and deserialization
- Embedded query languages
- Compile-time query validation
- REST, RPC, and service definitions
- Client and server code generation

## Observability
- Structured logging
- Metrics
- Tracing
- Telemetry
- Event streams
- Dependency tracking

## Testing and Verification
- Unit, integration, and benchmark tests
- Property-based testing
- Fuzz testing
- Executable documentation
- Formal verification hooks
- Proof annotations

## Tooling and Ecosystem
- Package management
- Dependency resolution
- Reproducible builds
- Lockfiles
- Feature flags
- Build profiles
- Cross compilation
- Compiler diagnostics
- Refactoring support
- Interactive REPLs
- Notebook execution
- Documentation generation
- Language-server integration

## Constraint and Logic Programming
- Constraints and constraint solving
- Logic variables
- Unification
- Rules and facts
- Relational queries
- Declarative inference
- Backtracking
## Domain-Specific Primitives
- GUI systems
- Game-engine primitives
- Workflow and task graphs
- Parser and grammar definitions
- Statecharts
- Audio primitives
- Vector, matrix, geometry, and color types
- Scientific-computing primitives
- Machine-learning and tensor primitives
- Data-pipeline primitives
## Meta-Level Language Features
- Syntax extension
- Language versioning
- Feature gates
- Compiler-enforced formatting
- Compile-time asset embedding
- Compile-time resource generation
- Semantic-version compatibility checking
- Self-hosting and compiler extensibility