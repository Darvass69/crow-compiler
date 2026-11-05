The core language is the base that we will use for everything else.
Its the most basic stuff that we will always use and need.

[feature set](selected%20feature%20set.md)

## Syntax
- <font color="#9bbb59">Variables, Constants, Assignments</font> #core 
```
var a = 5;
const b = 8;
a = 7;
if ((a = 6) == 6) {}

```
- <font color="#4bacc6">Blocks, Statements, Expressions</font> #core %% (we might move to an expression language eventually, but it won't change the design of the parser until we get there) %%
- <font color="#4bacc6">if/else, switch</font> #core %% switch might be removed once we have pattern matching, if could be an expression, we could use a keyword for returning a value from a bloc, like `produce`, `exit`, `out`, `<<`, `<|`,`@`, `$`. I don't think its really useful. Not important for now %%
```
{
	// this is a block
}

if (<cond>) {
	<...>
} else {
}

var foo = if <expr> then <expr> else <expr>;

switch (<cond>) {
	case 1: <expr>
	case 2: {
		// needs to explicitelly continue to fall through.
		// you can still break to exit early.
		if (false) {
			break;
		}
		continue;
	}
	case _: {
		//default case
	}
}
```
+ <font color="#9bbb59">for loops, while loops </font> #core
+ <font color="#9bbb59">Break, continue</font> #core 
```
// Can we init multiple variables in the init section of the loop?
for (;;) {
}

do {

} while ();
```
- <font color="#9bbb59">functions, closures, lambdas, anonymous functions, Higher-order functions.</font> <font color="#f79646">We might want explicit closure capturing?</font> #core
	- should closures capture values or references? 
+ <font color="#4bacc6">partial application of functions (just sugar of `(...p) => foo(x, ...p)` (make a lambda that captures `x` and use it as param of the function))</font> #level1 %% I'm just not sure about the syntax, and it could be influenced by/influence how we do constructors, maybe constructor syntax will allow partial application of any parameter of the function %%
```
fun foo() {
	fun bar() {
		return n;
	}
	var n = 5;
	// How do we create the closure? I think we just track what variables it uses, and at the point that you use the function name/alias, we capture the closure. I don't know what languages do usually, like do they use the value when exiting the function, or the value when the funtion pointer was created? And what if we had another function inside?
	//TODO
	return bar;
}

//TODO later we'll add/change the syntax for functions to make anonymous/lambdas better
var x = fn () {}; 

// TODO maybe closures are better represented with callable objects?
```

- Manual memory management
	- <font color="#8064a2">malloc, calloc, etc are from the std lib, but for now, we just use a bump allocator</font> #core
		TODO: make bump allocator
	- memcopy
- <font color="#c0504d">? Panic and recovery mechanisms? (do we want to be able to panic? Or do we always want to handle any error that might happen?)</font> #level1
	- I think we might be able to get away with only errors, and unrecoverable panic when doing something like a seg fault.
```
fun makesAnError() -> int | Error {
	if (true) {
		return new Error("some error");
	}
	return 5;
}
//TODO: design what the error contains, and how to create it. It might get quite complex if we want nice error 
```
+ Deferred execution and cleanup blocks #level1 
```
// called just before function exit. in reverse order? Maybe an anotation for order?
defer cleanup();
```

- <font color="#8064a2">namespaces, modules, nested modules, packages</font> #core %% (some of those might be merged into the same concepts, not sure how we'll do ) %%
	- <font color="#8064a2">import/export/re-export, </font>
		- <font color="#8064a2">visibility of elements (internal, external)</font>
		- <font color="#8064a2">alias elements when import and export</font>
	- extern for external (imported and exported) functions/values
```
// use same syntax as destructuring
// so its recursive, and you can alias individual names
import {foo, bar} as Namespace from "file/Path";

export Foo;
export {
	Bar, Baz;
}

// namespace is just an object
// We need a way to say that its a constexpr + other quality of life stuff, like every fn inside the object/namespace can call the other functions easily.
const MyNamespace = {
	Foo: fn () {...};
}
//Maybe use type instead?
type MyNamespace = {
	Foo: fn () {...};
}

//modules and packages don't have to be more than namespaces I think.
```


## Types and data structures
- <font color="#8064a2">arrays, structs</font> #core %% I have an idea to make structs and arrays work the same, with heavy inference so we can easily do structural typing without having to define types most of the time %%
+ structural typing #core
	+ heavy inference: anonymous/inferred struct and array layout (you can make a struct with just names, and it will infer the types of its fields from usage) #core
	+ need a way to do nominal stuff


```
// Direction 1: anonymous structs aren't structs, they're memory interfaces that you can then use to create real types.

fn foo(a: {x,y}) {...} // a is anything that has a x and y property
struct Baz = {x: int, y: string, z: float}; // we create a real struct from an interface type.
fn bar(a: Baz) {foo(a)};

// the main issue is keeping it clear that something is a real struct vs an interface



```

+ <font color="#8064a2">sum types / tagged union / discriminated union</font> #core
	+ non-nullable by default, union with null for pointers

+ immutability (by default?) #level1
+ Invariants and assertions #level1 
+ Static verification and compile-time checks #level1 
+ Contracts, preconditions, postconditions #core
	+ dynamic scope?
+ constraints, Refinement, dependent, existential types #level1 

+ type casting/reinterpret #core

+ composite and recursive types, or at least something like more complex types, Generics, higher-kinded types


+ interface, traits #core 
+ ? function overloading, operator overloading, dispatch system #core
	+ static dispatch, dynamic dispatch, multiple dispatch (reflection on the type at runtime to select the function to call)
+ constructor, destructor semantics #level1
	+ A way to specify which param the value goes to?

- Ownership, borrowing, lifetimes #level1 
- Move and copy semantics #level1

- <font color="#c0504d">pointers, ref?</font> #core
	- pointer arithmetic #core !! needs casting to use pointers effectively (casting between int and pointer, and between pointer types)
- native data structures
	- <font color="#c0504d">slices? views? ranges?</font> #core%% not sure how we'll be doing them, are they inherent to the language, or just from the std lib? %%
	- <font color="#c0504d">Enums</font> #level1
	+ <font color="#8064a2">strings</font> 
		+ <font color="#9bbb59">inline strings</font> #core
		+ <font color="#c0504d">string data type</font> #core 
		- <font color="#8064a2">Raw and multiline strings</font> #core







## Compiler
- Language-server integration, Compiler diagnostics #core 
- Compiler-enforced formatting #core 
- Optional semi colon/automatic insertion #level1

# Examples

Bump allocator
```
var start: *uint8;
var current: *uint8;
var end: *uint8;

//TODO slices
fun init(buffer: slice<uint8[]>) {
	start = &buffer[0];
	current = start;
	// or buffer.end()
	end = &buffer[buffer.size];
}

fun alloc<T>(size: int) {
	// not sure about pointer arithmetic
	if (current + size > end) {
		return null;
	}
	
	res = current;
	current += size;
	return cast<*void>(current);
}

```



```
fun factorial(n) {
	if (n <= 1) {
		return 1;
	}
	return n * factorial(n - 1);
}
```

```
fun fib(n) {
    if (n < 2) {
        return n;
    }
    return fib(n-1) + fib(n-2);
}
```

```
for (int i = 1; i < 100; i++) {
	if (i % 15 == 0) {
		print("FizzBuzz");
	} else if (i % 3 == 0) {
		print("Fizz");
	} else if (i % 5 == 0) {
		print("Buzz");
	} else {
		print(i);
	}
}
```








---
The hard part:

 - structural typing + inference + sum types


+ interface, traits
+ dyn
+ function overloading
+ Modules/namespaces/imports exports
	+ How do we make them, and make them not completely annoying with our type system

+  type casting/reinterpret

+ composite and recursive types, or at least something like more complex types, Generics, higher-kinded types

+ constructor, destructor semantics
+ pointers, ref 









+ typestate
+ Contracts, preconditions, postconditions
+ constraints, Refinement, dependent, existential types
+ assertions and invariants (assertions that holds true for some time)
+ immutability
+ Ownership, borrowing, lifetimes. Move and copy semantics




