
# Ideas
Ideas for features that will come latter. Some of them don't make any sense, just ignore those.


## Web stuff
Yes, I want this language to be used for web pages. I know its a bad idea. Fight me.
+ JSX like syntax, either as a native feature or a compiler plugin
+ Signals/reactivity tracking, so we don't have to pass a dependency array to effects. Try to track all of them at compile time.
+ Good data transformation, especially JSON. We want to be able to manipulate JSON very easily.
+ Good concurrency/async support. We can leverage the type system to protect against race conditions, deadlocks and other problems in threads.
+ Good testing, maybe even a testing framework inside the std, and leveraging language features when testing to make tests easier (like testing types themselves).
+ if we want to make it feel like a scripting language, we could add a type that acts like javascript, python or lua object with enough syntactic sugar to make it nice

## Type system
> TODO break down next point into sub points
+ Use strong type inference to a low-ish level language to make it feel a lot higher level than it actually is (more of an aspirational goal). Or (more likely), make a high level language that can dip down to a lower level when needed by having a lot of granularity on which rule is active at any point (through compiler settings/rules that can be changed for lines, functions, files, ...  ). And to make it easy to turn higher level code into a lower level (progressively add new rules, have different levels that can be used so its not all or nothing. Start simple, add precision over time, Let the programmer choose the level of control).


+ A strong type system allows to express relationships between different parts of data (something that has maybe: type state + refinement/dependent types + an ownership/borrow/lifetime system similar but different from rust)



## Environment
+ good ffi with both javascript (easy because of WASM) and other languages (C like API), whether it's in the browser environment or standalone.
+ Integrate in a lot of environments (web (WASM), native, JVM)
+ Interop with a lot of languages (js/ts, C ABI (for C, C++, Rust), Python, all JVM based languages)
+ Easy way to define the current running context (web, specific WASM VM, native, JVM, ...) and what feature is available in it. And be able to have different files in different contexts. Would be useful for back end vs front end.

## Meta-programming
+ strong meta-programming, or at least something easy and clear. (no messy macros like C)


## Random ideas
+ adding multiple language variants for different level of control and syntactic sugar, but all compatible (they use the same type system, but the types they use by default are different)
	+ scripting language: all objects are dicts (like js or python). You can freely add keys at runtime. Very free and easy to use, but poor performance.
	+ application language: pointers are garbage collected by default, less freedom than the scripting language, but also more performant and with more control. More like Go or C#.
	+ low level/system language: manipulate the memory itself with very little abstraction and high safety, a lot closer to something like C or Rust.

+ A way to represent that a pointer is from the hosting context, or something similar