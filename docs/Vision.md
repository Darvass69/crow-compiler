Most languages force a tradeoff: either code is easy to write but weakly checked, or code is safe and precise but hard to iterate. This language aims to remove that compromise by letting programs evolve from simple and flexible to precise and constrained, without needing to rewrite everything. The language is general-purpose and suitable for a wide range of applications. It has a lightweight and predictable runtime, strong compile-time guarantees, and an expressive type system capable of modeling program state and relationships. This allows prototypes to grow into precise, high-performance programs without rewriting or switching languages.
# Philosophy
- Prefer clear, general features over many overlapping special cases.
- Reward clarity over cleverness.
- Prefer rules that are consistent and easy to explain.
- Prefer practical designs over theoretical purity. We're not making Haskell.
- Keep the runtime simple; push as much complexity as possible into compile time.
- Abstractions should be transparent, inspectable, and close to runtime behavior. We don't want to add the the horrible abstraction tower of doom that is the web.
- Be willing to make breaking changes early if they improve the language long term.
# Goals
+ The language should allow code to start simple and become more precise over time, without requiring rewrites or paradigm shifts.
+ The type system should be expressive enough to model program state, constraints, and relationships when needed.
+ The runtime should remain simple, explicit, and easy to inspect. (Low in overhead and abstractions. Basically like C)
+ Compilation, tooling, and project configuration should be simple and integrated into the language.
# Non-goals
- The language is not designed for manual-only workflows without tooling support. (Sorry to the one person that uses notepad to write code)
- The language is not trying to hide behavior behind implicit rules or complex abstractions. (I love JavaScript's implicit conversions. They are so good and never caused any problem.)
- The language is not aiming for theoretical completeness at the cost of usability.
- The language is not built around a complex or opaque runtime model.
- The language does not assume that all intent can or should be inferred. Explicitness is still necessary. (Proofs are for nerds)