
Type definition, manipulation, comparison

Definition:
	struct
	? Union/Intersection?

Manipulation:

Comparison:
	prev vs curr state







### Union
```
fn a(a: 1 | 2)

fn b(b: enum{fisrt(1), second(2)}) // == 1 & {type: enum}
```







# What we want to do/features of the type system/goals

type of var vs type of init (`var lock: lock = lock::locked{}`, when used later, how do we handle it? What if we want to restrict init to lock::locked, but allow other in the variable?)

types keep information on where they comme from/state (permission tracking, taint)

constraints and conditions on type (need this to be valid, is this, is that)

union: (one of) and ways to reflect on the type (in like a match)
intersection: (and) restrict the type to one of its subtype (+ create new implicit structs?)

>track side effects
## type manipulation

> mapped types

+ define type modifications (implicit? and on operators?)
ex: `m / s -> m/s -> km/h`

> remove union member (`Flags & !SomeFlagWeDontAllow`)
## structs
> generics on structs (template)

> parsing json + schema
> versioned schema, evolution, serialization

> safe ffi/binary , alignment, endianness

> onclick needs role="button", needs a way to reference other parts of the struct and add rules based on that


## functions
a function's return type can depends on the input type: (`function matMult(mat1: Mat<n,m>, mat2: Mat<m,o>): Mat<n,o>;`, type safe SQL `DataBase.query(...)`, parsing json + schema)

a function can change the type state of an existing variable from its context or parameters (rules?)

## Meta programming






## Example

### Example 1: AST

```
// Pseudo-code
Expr = BinaryExpr + NumberExpr + StringExpr + BooleanExpr + CallExpr
Expr = {type: string}


```















# Ideas
command for compile time error if some condition is true/false (so you can say "if this path is reachable, we can't allow to compile", allows to easily limit what is disallowed somewhere)



# Type system
Maybe we have 2 type of types?
One is the memory type/memory structure. We don't care what it means, only how its represented in memory.
The other is the actual/logical type.

You can go between different logical types easily (`as` or `assert`), but to convert memory types, you need an explicit way to convert the memory (`to` operator that can be overridden)`



## Memory types
primitive types (int, float) have a fixed size defined by the compiler.
structs are a collection of other memory types
arrays are a homogenous list of memory types with a length (length known at comp time for stack allocated?)

intersection types don't change the mem layout

union types changes the layout a little (it could be optimized at some point, but we don't care for now)
~~we add a enum before the struct that says which one of the element inside the union it is then at runtime, we can check against that enum to know which type it is.~~
~~Eventually, to optimize it, we do like typescript with inference.~~
No, when we do union, we just keep the list of all the valid types. Then, when we do an if, we check what we can remove/infer (do the test on the type, check if its always true or false) -> that means we need to add a feature that can evaluate if an expression is always true or false.

How do we manipulate those types? Iterate the list?

`{a: int | string}` vs `{a: int} | {a: string}`

`{a: int | string; b:int | string}` vs `{a:int; b:int} | {a:string; b:string}`
-> `{a:int; b:int} | {a:string; b:string}` can go inside `{a: int | string; b:int | string}`, but not the reverse

### other
strings as char\[]? something more specific?

slices?

dynamic arrays?

## Type manipulation and metaprogramming
I think we need to merge our metaprogramming capabilities with the type system. Being able to reflect on the code and types is the base of metaprogramming, so we need both to be intertwined.

It would be pretty cool to do metaprogramming by manipulating the types, like `.map` on the elements of a type union or finding and modifying a specific key to something else. Like to derive a new type from an old type in a way that can be reused.


## Type manipulation and traits
How do traits fit with the rest of the type system?
Do we even need traits


# Memory management model

mutability? ownership?

# Standard library

# Other ideas

+ Ternary? `?`
+ Nullish coalescing? `??` just for null? Or do we track things like defaults?
+ String concat? `..`
+ delete?
+ spread operator
+ tuple

## traits
Issues:
    simple way to do method is just function pointer on struct, it works but we can't have polymorphism/interfaces, we need V tables for that
    Now, if we want real methods, we have 2 things to worry about:
        1. what method is available
        2. where to get the implementation from








<!-- ! Not sure -->
`trait myTrait {aMethod() {...}}`
`implement myTrait for myStruct {aMethod() {return}}`
ctors?

we could have static dispatch for traits unless made explicitly (`dyn Trait` or `&Trait`)

inheritance?

```
struct Animal {
    energy: int;
}

struct Dog {
    Animal;
    breed: string;
}
```

```
trait Animal {
    eat();
}

trait Mammal: Animal { // :, extends or requires?
    nurse();
}
```

```
trait Movable {
    move(self, dt: f32);
}

implement Movable for Position {
    move(self, dt) {
        self.x += dt;
        self.y += dt;
    }
}

implement Movable for Entity by pos;

// sugar (pure)
struct Entity implements Animal {
    pos: Position implements Movable; // not sure I like this one
    eat() {...}
}

// not sure about constructors
Entity {
    pos: Position { x: 0, y: 0 },
    vel: Velocity { dx: 1, dy: 1 },
}

// what if in 2 files? Do we do something to differentiate them? Scope them to module? Forbid it?
implement Printable for File { ... } // in Module1
implement Printable for File { ... } // in Module2

var f: File; f::Module1.print();

//how do we import traits?

//maybe a way to override only from a file? Like for tests/mocks?
```

<!-- ### iterator trait?
2 ways: 1 flatten loop (for built in types). 2 struct + function. The struct retains the state for each iteration. iter_next is called each iteration.

### for ... of ... -->





# Contract model
Functions have pre and post conditions.
When compiling, we have to garante that those conditions are true and valid.
post conditions can change the type of an input type.

Its easy to represent changes in types (x becomes a different type)
```
fn isNotNull(
	x: int* | null
) -> (
	x': int*
)
```

How do we do generics?
```
// not sure about generics, we might want something that can be manipulated
fn isNotNull<T>(
	x: T* | null
) -> (
	x': T*
)
```



```
fn isPositive(
	x: int* & !0
) -> (
	$: bool,
	x': int* & !0 & if $ == true then range<0:> else range<:0>
)

//? `then` operator to wrap an expression into a block? So that we can use `then` in more context?
```



What are the rules? How do we handle conditions? contexts?


```
fn a(
  context x: int; // or maybe just a section/special syntax for outside context?
) -> (
  x': int32
)

fn b(
  global x: string
)

fn c(
  global x: int?
)

```




