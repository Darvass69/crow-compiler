# Crow

Crow is an application programming language that combines the flexibility of dynamic languages with the safety, control, and performance of static languages.

It aims to provide:
+ High level features with low level control.
+ Consistent rules and behavior.
+ Good performance with no hidden cost.
+ Good user experience and fast compilation.
+ A compiler and language that is easy to customize and extend.

Take a look at the [homepage](Homepage.md) for a map of the documentation or read the [vision document](Vision.md) for a better look at what Crow is trying to do.
# Getting started
<!-- 
Getting started: install + example (hello world or other simple program) + tooling + create project. Don't go into details, just an overview easy to follow. [Getting started -WIP-](Getting%20started%20-WIP-.md) for a better guide?
-->
The compiler cannot be used standalone yet.
3 options are available:
1. Run the compiler directly using `npm run main -- ${crow file}`
2. Run the tests using `npm run test`
3. Use it as a library in another node project. (add the dependency in `package.json` using `"crow-compiler": "file:../crow-compiler"`  or some other path)

You can use [obsidian](https://obsidian.md/) to view the documentation. Open the folder as a vault and make sure to enable community plugins and CSS snippets.

# Current status
<!-- 
Talk about what is and isn't done, what is stable, what is WIP, what is production ready, restrictions.
-->

> [!warning]
> The whole compiler is currently being re-written to be easier to develop and integrate into a language server. It might not currently be in a working state.

This project is very early in its development. Syntax and features will change quite quickly, and the compiler API is unstable. It currently only compiles to WASM, but other targets are planned.

Only the most basic features work: 
+ control flow (if, else if, else, while)
+ variables
+ functions (no forward declaration, and no recursion)
+ basic arithmetic, comparison and logical operators
+ int32 and bool types
# Known issues


# Roadmap
Incomplete list of features and tasks. The order roughly reflect their priority and their dependencies. Not all features are fully designed yet.

- [x] Produce a basic program (WASM binary with fixed imports and exports)
- [~] (partial) Integration tests
- [~] (partial) Basic language features and simple type system (simple nominal type system with primitive types, structs and arrays and basic features like control flow)

- [ ] Unit and fuzz testing
- [ ] Add debugging symbols, source mapping and full introspection into the compiler.
- [ ] Compiler as a library (with stable API and a build system/build library)
- [ ] LSP/CLI tool

- [ ] Implement the core of the type system (refinements/typestate).
- [ ] Generate TS types from exports + typescript integration
- [ ] Add type inference
- [ ] Full type system (add all features, like borrow checking and bounds checking)

- [ ] Full FFI with Typescript
- [ ] Release mode and optimization (change back end to QBE? LLVM? so we don't have to implement all the optimizations?)
- [ ] Standard library

- [ ] Bootstrap the compiler
- [ ] Test framework
- [ ] Web framework
- [ ] Documentation website
- [ ] FFI with C, C++, C#?, Java, Python, Rust?

# Contributing
Feedback, issues, bug reports and contributions are welcome.

#TODO License

> [!important] AI usage disclosure
> > - No agentic AI was used.
> > - AI was used very sparingly for code, and only to help solve specific problems.
> > - AI was sometimes used for troubleshooting and research.
> > - Some AI was used in the past for documentation, but it was completely edited or removed.

---
Documentation inspiration:
+ [Coda](https://github.com/gingrspacecadet/coda)
+ [Lumina](https://docs.luminalang.com)
+ [Zig](https://github.com/ziglang/zig/tree/e112818e25b710199f5c757c17717499356d516e)
+ [Rust](https://github.com/brson/rust/blob/3d6f5100aff24aa97275dc92ade728caac605560/src/doc/complement-project-faq.md#1)