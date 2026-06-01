# Best Script
A high-level application language compiled to WebAssembly that aims to be easy to prototype in while supporting increasingly precise typing and control over program behavior.

## Goals
TODO 3-5 goals to give an idea of the language

[Vision and goals](./docs/wip/00-Vision.md)

## Status
Early development.
The compiler currently supports basic expressions, control flow, and functions and the only types are bool and int32.

[Current specs](./docs/wip/03-Current%20language%20spec.md)

## Example

TODO simple example

## Getting started
TODO
instal node,ts, ...
run compiler (npm run ...)
run wasm binary (...)

<!-- maybe explain a little bit how it works? Or link? -->

<!-- TODO make it into a real compiler, or at least something a bit better than just running the current main. -->

<!-- ## Compiler flags -->




<!-- how to contribute -->

<!-- License?? -->

<!-- star history -->


TODO add to github description
> A high-level programming language compiled to WebAssembly, combining a simple core syntax with an expressive type system for modeling data, state, and side effects.

This is a high-level programming language that compiles to WebAssembly, designed for application development with a focus on the web. It combines a simple, familiar core syntax with a powerful type system that can express complex relationships in data, track state, and control side effects. The goal is to make it easy to prototype quickly while still allowing developers to progressively add strong guarantees and correctness through types.

This language is a WebAssembly-targeted application language built around a simple core and a highly expressive type system. It aims to bridge the gap between fast prototyping and strong correctness by allowing developers to start with minimal structure and gradually introduce precise types that capture invariants, state transitions, and side effects. Rather than enforcing strict rules upfront, the language lets complexity emerge where it is needed, with the type system providing the tools to make that complexity explicit and safe.



> go to overview

The language compiles to WebAssembly through a multi-stage pipeline (AST → HIR → MIR → LIR → WASM) and is designed to balance simplicity and expressiveness. Its core syntax remains intentionally minimal, while more advanced features—such as state tracking, refined types, and side-effect control—are handled by the type system.

The type system is a central feature of the language. It is intended to model not only the shape of data, but also its validity, state, and access constraints. For example, types can encode whether data is safe to access under a lock, or whether a value has passed validation (such as a formatted string). This allows many runtime checks to be enforced or eliminated at compile time.

The language also aims to support predictable performance, explicit error handling, and eventual advanced features such as typed metaprogramming, safe concurrency, and strong tooling support.





## Getting started

TODO
how to install stuff
how to run compiler
how to use compiled code (+ framework or something?)

intermediate stages
<command --emit-ast>
<command --emit-hir>
<command --emit-mir>
<command --emit-lir>


## Example

small up to date example




## known limitations/bugs




## Note
This project is very early in its development. Syntax and features will change quite quickly ...





This is a language compiled to WASM.


## TODO
- how do we handle errors? We want to pretty print errors + language server eventually.
- where and when should we do our type checking? With the AST? The HIR?