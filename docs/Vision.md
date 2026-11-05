Crow is an application programming language designed to combine the flexibility and development experience of high-level dynamic languages with the safety, control, and performance of low-level statically typed languages.

Using Crow feels like using a dynamic language, but everything is statically typed. That way, you don't have to choose between flexibility and control. We use contracts to define guarantees and requirements and bidirectional typing allows to infer most contracts and manually specify the rest. That way, you can gradually introduce specificity exactly when you need it.

Crow is focused on app development (initially for the web, but games and high performance native software will come later). It aims to be easily embeddable and integrate well into existing codebase. It can be used both standalone or embedded in another language.
# Motivation

Not every part of a program needs the same level of detail, precision and control. The core often needs more precision and performance, and the rest needs more flexibility. Existing languages don't handle this very well. They force you to be at around the same level of precision everywhere.

Low-level languages require too many decisions up front to be flexible, discouraging experimentation and making architectural changes hard and expensive. High-level languages don't offer enough precision and they often have fairly high runtime overhead. Dynamically typed languages are even worse, you have almost no control over the execution with a lot of hidden overhead that you can't control, and its almost impossible to refactor safely.

Its why we often see a low level language mixed with a high level scripting language. But even that doesn't solve every issue. You still loose some performance at the boundary between the 2 languages, and you loose information that both languages could use to be more performant. You also need to convert values to the representation that the other language uses, further hurting performance. Lastly, some information that both languages know is lost at the boundary because the boundary is not flexible enough to use that information.

Crow fixes that problem by allowing different parts of the program to have different levels of complexity. The more dynamic parts can define flexible contracts with few constraints and let the compiler infer the rest while the core can define precise contracts with strong guarantees and requirements that allows them to be more performant.
# Design principles
+ Abstractions should be transparent, inspectable, and close to runtime behavior. Zero-cost abstractions should be easy to represent.
+ Explicit, predictable, controllable and transparent cost and behavior. Minimal and transparent runtime.
+ Keep the language and compiler honest (no compiler magic, no magic feature that works with rules outside the usual system, everything should come from basic rules that everyone can use).
+ Do as much as possible at compile time (metaprogramming). The compiler figures out as much as it can at compile time (static analysis)

+ Focus on ergonomics, ease of use and good user experience (fast compile times (< 2 seconds for development feedback, more for a clean build), support interactive development (REPL, hot reload, notebook))
+ Reduce cognitive load and facilitate solving programing problems. (the more you have to remember about the program, the less you can work on the problem)

+ Features should be compatible and interact with each other in a clean and predictable way.
+ Prefer rules that are consistent (same feature/idea works the same accros the language).
+ Language features (like syntax and the type system) should be designed to compose naturally and with very few special cases. When multiple features are conceptually very similar, they should use a syntax and mental model that is very similar and that respect the same rules. For example:
	+ Variable declaration is very similar to parameter declaration. Their syntax and rules should be nearly identical and equally as expressive.
	+ Pattern matching and destructuring have a lot in common and should look similar
+ Be willing to make breaking changes early if they improve the language long term. We do not want to be stuck with a bad decision.

# Goals

+ Embedding
	+ Easy to embed
	+ Easy to integrate into existing codebase gradually. No big-bang migration.
	+ Strong ffi and bidirectional bindings. interact with existing code and ecosystems (JS/TS, C/C++/Rust, JVM, C#, Python). Maybe even be able to use python libraries directly.
	+ Dependency control. You can easily replace a dependency as long as the contract is compatible.
+ Easy to debug and inspect.
+ Errors as values.
+ Easy to learn incrementally.
+ Easy to integrate incrementally in a codebase.
+ Type system
	+ structural typing
	+ tagged union/algebraic data types
	+ refinement types
	+ bidirectional typing
	+ flow-aware bounds checking/typestate
	+ contracts define requirements and guarantees.
	+ borrow checking
+ Tooling
	+ Compiler and build tools as a library. No need for make/cmake, just write a Crow script.
	+ Extending the compiler is easy.
	+ Easy project configuration, integrated in the language. (also a library)
+ Strong metaprogramming features and compile time execution. Code patching.
# Non-goals
+ To be the fastest or safest language in every possible way. We still value performance and safety quite a lot, but we are ready to make tradeoffs
+ To specialize in bare-metal, hard real-time, or kernel development. Crow is primarily an application programming language, although it may still interface with low-level code.
+ To be a formal verification system or prove every program correct.
+ To be used without an IDE. A lot of information is inferred by the compiler, and trying to figure it out manually will not be fun (CLI only workflows might be possible, but it won't be as nice as an IDE).
+ To be portable across every platform or execution environment. Different environments have different restrictions. We will not hide them, but we will make it easy to manage the different capabilities of different environments.
