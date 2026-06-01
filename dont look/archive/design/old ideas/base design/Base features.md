


we want to be able to:
+ define a memory layout
+ add behavior (methods, static and dynamic) to a memory type
+ add restrictions (intersection types, conditions relative to runtime value (ex list length)) to memory layout and behavior
+ combine multiple memory layouts together (union) and be able to identify which one it is (mapped)
+ track state of memory layout a compile time (type state)
+ use a generic/abstracted representation of some memory layout when we don't need to know exact implementation (interface, generics, other forms of polymorphism)

+ define who owns allocated memory, and who is responsible to deallocate it when not used anymore (track ownership) (memory layouts cleans up the memory they are responsible for when they are deallocated/destroyed).
+ define who can mutate which part of the memory and if it has complete control over it or if its shared (shared is for multithreading)
+ transfer ownership/responsibility from a type to another (move, copy, borrow)
+ mark some values as not able to be copied (or moved?)
+ consume values and make them invalid/uninitialized after being used
+ <font color="#0070c0">? do we need lifetime tracking?</font>
+ <font color="#ffff00">aliasing constraints tracking</font>
	 (<font color="#ffff00">when having a reference/pointer to something, we need to specify what constraints need to keep being true while we are holding the ref)</font>
	+ <font color="#ffff00">unique vs shared</font>
	+ <font color="#ffff00">rules for shared + mutable</font>
	+ <font color="#ffff00">relationships between values (2 values/ref may alias, these 2 are guaranteed to be distinct)</font>
	+ <font color="#ffff00">scope may change exclusivity (shared global, temporarily exclusive in a scope)</font>

+ <font color="#ffff00">some pointers may not have guaranteed location stability (like pointers to a std::vector), the type needs to reflect that.</font>
	+ Do we need a way to tell the values inside the std::vector that they are not allowed to move or they break reference? (kind of the opposite idea, like we say `I have a pointer to this, don't move it`)

+  <font color="#0070c0">? A memory layout can define how it is created (ctor) (and how it can't be? (disallow specific ctors? or default init?))</font>
+ <font color="#0070c0">or just track each field of the struct. until its completely initialized, it can't be used like its initialized</font>
	.<font color="#0070c0">and make static methods to create it</font>

+ <font color="#ffff00">a memory layout can be cast to another (unsafe and lossy explicit cast)</font>

+ <font color="#ffff00">a function's return type can be dependent on its input types (needs to interact with the rest of the type system)</font>
	+ ex: size of result is dictated by input value

+ <font color="#ffff00"> there is a difference between mutating a value (within its type) and mutating a value's type (mutating to a new type). functions need to keep track of both</font>
	- mutation (within type) can be considered mutating a value's type from T to T' so we don't need an extra feature just for that


+ <font color="#ffff00">a function can make and remove promises/guarantees (like that something is const or not)</font>
	+ Those guarantees are propagated through functions that call them, so that we don't silently remove a guarantee

+ <font color="#ffff00">types can be narrowed to specific values (like a specific string or number)</font>

## Other features that may or may not be good
+ Iteration primitives
	Range + iterator model (0..n, or something like python's \[::]?)

+ higher-order types (types of types)
+ Higher-kinded types (F\<T>)
+ type level functions
+  Associated types (a type has other types, like an iterator has an element type)
+ ?Type-level quantification (for all types T, there exists a type T)

+ Overloaded functions and methods

+ Partial type information (unknown / inferred parts)
+ Type-level recursion
+ Derivable traits / behaviors
+ constraints propagation
+ Capability composition/restriction

+ Layout modifiers (packed, aligned, reordered / fixed order)

+ metaprogramming?
	- Compile-time assertions
	- Layout introspection (`size_of(T)`, `align_of(T)`, `offset_of(T.field)`)
    
+ able to make adapters of some sort to make generic functions work with a different (but equivalent) memory layout?
	-  ex: adapting a custom string type to work with all string based operations?
	- ex: something that requires a 2D point (x,y), but make an adapter to make it work with (y,z) instead?

+ type safe SQL
+  json serialization/deserialization

+ inheritance (basic)?

+ Subtyping / coercion rules, (when containers/functions are compatible)

+ pattern matching

+ Structural equality vs Identity equality

+ Unsafe escape hatch (maybe need to explicitly specify what hatch you're trying to escape)

+ Disjointness / exclusivity (ex: 2 enum values cannot be the same)


unions like typescript can't work. You need more restrictions.
    - ex: how do you know which type it is if 2 structs don't have any field in common?
        you need a way to tell them appart (it could be dependent types, but you still need a way to identify which it is)
        and that would just be mapped enum but the enum is outside the value/union
       