# Easy features
Features that are fairly simple and don't have too much interaction with other features

+ ~~comments~~
+ import, export: needs to know how traits are handled, but it won't impact syntax too much.
+ namespace: probably just `namespace <name> {}`, and it makes it into a comptime object. How does it interact with import/export?
+ statements
	+ ~~for, while, continue, break, labels, do while, for of~~
	+ ~~if, else~~
	+ statements into expressions

```
// Comments are easy to do
/* and inline comments also */
/** And this is for documentation (like js doc, but our own format) */
```
### Statements.
The only true statements are declarations (variable, function, traits, import/export, namespace) -- things that need to register names. Everything else doesn't need anything to be handled and can just be an expression.

I think they are just expressions that return void, and if it has a `result <value>`, it returns that value.
The one part I am not sure about is when we have a block after an expression (ex `<cond> <block>`), because it then becomes a bit annoying to do correctly, for example, if the cond uses a block expression inside (`1 + {result 3}`) versus if its a mistake (wanted to do `1 + 2 {result 3}`)
I think we'll need to be a bit stricter about conds and blocks, either not allowing a block expr inside a cond, or requiring parens around conditions.

Also just blocks and other statements inside expressions means that you have to handle them in NUD, and in a way that doesn't need backtracking (I don't think it will be an issue). The issue will be with `if` and loops, conditions and setup for loops will cause problems if we are not careful.

We could have issues if we do `while (...) {...}\n + 1`. It is probably a mistake, but we can't be super sure of it (someone could be trying to do something fancy). Not sure how we should handle it. Format a semi colon after to show statement separation?

Compile errors with traditionally statements, like block, if, loops. Should be done in a way where if there is no return value, we call it a statement. That way, we can disable `result` and the user should never have to worry about then being expressions (something like `error: not an expr, doesn't return a value` would probably be fine). We could also make those expressions a special binding power, and not allow them in some places, but that doesn't feel too good.

#### If statements
##### First draft
```
// if statement
if condition {
	<block1>
} else if condition2 {
	<block2>
} else {
	
}

// ternary version of if statement.
const value = if condition == true then result1 else result2;
// invalid? all ternary if should have an else? Or do we just bind to the last one? I think it should always have an else, it makes more sense that way.
if cond1 then if cond2 then res1 else res 2
if cond1 then if cond2 then res1 else _ else res2
//formatted, format 1
if cond1 then
	if cond2 then
		res1
	else 
		_
else
	res 2
//formatted, format 2
if cond1 then
	if cond2 then res1
	else _
else res2
//formatted, format 3
if cond1 
	then if cond2 
		then res1
		else _
	else res2


if cond1 
	then if cond2 
		then res1
		else _
	else if cond3
		then res2
		else res3

// equivalent as a normal if
if cond1 {
	result if cond2 {
		result res1;
	}
} else if cond3 {
	result res2
} else {
	result res3
}

// if we didn't have the final else
if cond1 
	then if cond2 
		then res1
		else _
	else if cond3
		then res2
		else _

if cond1 {
	result if cond2 {
		result res1;
	}
} else if cond3 {
	result res2
}
```

##### Draft 2
Force parens around the cond for the normal version. if then doesn't need that because the `then` keyword closes an expression (`then` is not in NUD or LED, it is parsed manually to split expressions? It could be a LED with high prio, but that would make checking the if's validity complicated. Its better if it creates 2-3 expressions).

```
if (cond1) {
	result if (cond2) {
		result res1;
	}
} else if (cond3) {
	result res2;
} else {
	reslt res3;
}

if cond1
	then if cond2
		then res1
		else _
	else if cond3
		then res2
		else res3

// mixed
if (cond1) {
	result if cond2 then res1 else _;
} else if (cond3) {
	result res2;
} else {
	result res3;
}


// 	`else if cond3` is a bit weird because it looks like else if, but its not formatted the same. I think it behaves the same as the normal version though.
var x = if cond1
	then if cond2
		then res1
		else _
	else if cond3
		then res2
	else res3

// maybe move the then?
if cond1 then
	if cond2
		then res1
		else _
	else if cond3
		then res2
	else res3

```

##### Final
I like draft 2, but we'll have to figure out the formatting for the `if then`.
It is not necessary to have 2 versions, but I like it. Its not that different or annoying. Maybe just add a formatter config to convert from one to the other, and maybe multiple styles.
The reason we have `if then` is because `?` will already be used for a lot of stuff,

Normal if: Parentheses around condition, then block (block expression) required.
If then: No parentheses, can only have expressions, and return the values.

Notes on parsing: `if` and `if then` can be parsed the same roughly. Normal if doesn't have mandatory `else` at the end.
if: `if <cond> <block expr | consequent> else <expr>`, consequent: `then <expr>`
```
var y = if (cond1) {
	result if (cond2) {
		result res1;
	}
} else if (cond3) {
	result res2;
} else {
	reslt res3;
}

var x = if cond1
	then if cond2
		then res1
		else _
	else if cond3
		then res2
	else res3
```

#### Loops and loop constructs
```
for (let i = 0; i < n; i++) {
	
}

for (;;) {}

for (let item, index of list) {

}

// items 5 to 10
for (let v,i of list[5..10]) {}

while (true) {
	if (true) {
		break;
	} else {
		continue;
	}
}

do {

} while (true);

// label?
outerLoop: for (;;) { for(;;){ break outerLoop; } }
var val = for (;;) { result for(;;){ result 1 } }
```

+ `for of` value and index could maybe be similar to multiple return values (multiple values without destructuring?)
+ Rules for init, cond and update blocks
	+ The only real statement we will want inside the init block of the loop is variable decl (Only other stmts are fn/trait decl, namespace/import/export, return/break/continue. loops and if else are expressions, so those would be fine)
+ decl list (related to destructuring)
##### Exploration 1: Find the limit
Lets go as crazy as possible.
```
// If we don't use parens, its the same issue as with the if (block is an expr)
for let i = 0; i < n; i++ {
	<...>
}
// we could add a keyword, but I don't like it.
for let i = 0; i < n; i++ do {
	<...>
}

// if we want multiple statements, how should we do it?
// I don't want to allow variable declaration inside expressions, it will make everything worse.
// The only real statement we will want inside the init block of the loop is variable decl (Only other stmts are fn/trait decl, namespace/import/export, return/break/continue. loops and if else are expressions, so those would be fine)
// languages like C and JS define a specific subset of statements that can go in there, and its always pretty much just variable decl or decl list.
for (let i = 0, const n = 8; i < n; i++) {
	<...>
}


// "for of" needs a specific syntax. It only works if it starts with a var decl or assignment. Nothing else makes sense (other than maybe some macro stuff?)
// Making it in a flexible way could be interesting, but it doesn't make sense in any other context. It needs to be somewhere in a loop, and in a way that we can increment it and walk each item. So I feel fine having a special syntax for this.
// var decl, assignement list
for (let [x,y], i of list) {...}
for ([x,y], i of list) {...}
```


### Primitive types and literals
+ ~~string literal, string template, raw strings, escape sequence~~
+ ~~number literal (dec, hex, bin), float/double literals~~
+ ~~char~~

```
// number
var dec = 69; // any nb of num, _ to split numbers. (format rules?)
var flt = 12.264 // numeric, comma, numeric. same for double
var hex = 0xABCD // 0x followed by 0-9, A, B, C, D, E, F. Upper and lower case. _ to split parts.
var bin = 0b0010_0110 // 0x followed by 0-1, _ to split parts.
var oct = 0o01234567 // octal, same rules

var myChar = 'a';
var strExample = "This is a string. It is delimited by \"\". Anything else inside is considered part of the string as is, except escape sequences."
// TODO escape sequences
var rawString = // TODO. Not sure what to use as delimiters.
var stringTemplate = `This is a string template. It can include any value using ${someValue}. Whatever is inside {} will be transformed to a string. If it is left empty, like this ${}, the template is now a function that can take in parameters. The first parameter will go to the first block, then second, etc.`
//TODO named parameters? Link fields together? Specify formatting?
```

### Basic operators
+ binary: arithmetic, logical, bitwise, comparison
+ prefix: not, negative, increment, decrement
+ postfix: increment, decrement
+ null coalescing (`??`). Only works with null? What about false, empty string, etc?

+ TODO: concatenation, range, pipe
+ TODO: falsy, nullish
+ TODO: swap? `<=>`


# The hard part
These are all features that have significant overlap in syntax and ideas. Multiple of those features should have the same or similar syntax, and need to interact with each other cleanly.

+ ~~match, pattern matching~~
+ ~~`_` as no-op~~
+ error propagation? errors as values

Assignment/declaration:
+ ~~const, var~~
+ ~~multiple assignment/declaration/destructuring~~
+ ~~compound assignment~~
Function definition, body, call
+ ~~params~~, ~~return type~~
	+ ~~default params~~
	+ ~~in and out params~~
	+ ~~named return values~~
	+ ~~rest params~~
	+ ~~datatypes, arrays, structs and destructuring~~
	+ ~~contracts~~
+ ~~closures~~, ~~lambdas~~
+ ~~function call~~
	+ ~~spread params~~
	+ ~~named parameters~~
	+ ~~partial application, currying~~

Data types
+ ~~spread~~
+ ~~enum, discriminated union~~
+ ~~array vs list vs tuple vs struct~~
+ ~~set, slice, view~~
+ ~~bit field, packed~~

pointers
+ ~~null, nullptr~~
+ memory model, pointers, etc
+ mem allocation
+ pointer arithmetic, deref

Now, we have to figure out how they interact together, and how they overlap.


<font color="#4bacc6">variable declaration</font> (single declaration, multiple declaration, destructuring declaration, parameter declaration)
<font color="#31859b">assignment</font> (single assignment, multiple assignment (comma between items?), compound assignment, default parameter)

<font color="#4bacc6">variable declaration</font> should work with <font color="#31859b">assignment</font>
const/var should work with all <font color="#4bacc6">variable declaration</font>



contracts, in out params, named return values, return type
data layout of params/return value (and useful abstractions)


+ destructuring and pattern matching
+ enum, discriminated union and destructuring
+ `_` as no-op
+ error propagation? errors as values

+ rest params
+ spread params, named parameters
+ spread object and array literal

+ closures, lambdas, partial application, currying, `_`
+ const as non mutable

### First draft
```
var name1, {name2, name3}, [name4, name5] = 1, {name2:2, name3:3}, [4,5];
// How to mix var and const?
const <...>;
name1, name2 += 2, 3;


// not sure about parentheses for return type
function name1(param1, param2: type1) -> (name2: type2) {<...>}
function name1(...start, last = false) -> (void) {...}
function name1(first = 1, ...rest) -> (int) {...}
function name1([first, last] = [1, 2]) -> (void) {...}
// missing contracts and in/out params, const param


fn1(name1: 5, 6, 7);
fn1(...[1,2,3]);

var a = fn1(_,2,3,4,_,6,7);
a(1,5);
fn1(1, ..._)(2,3,4,5,6,7)

function [name1]withClosure() {<...>}
var lambda = (name1: T) -> T => name1;

{...name1, name2, ...name3[1..5]}
[...name1, name2, ...name3[1..5]]
// enum, discriminated union
// array vs list vs tuple vs struct
// set, slice, view
// bit field, packed

var x: foo? = null;
var x: foo* | null = null;
var x: foo | null = null; // invalid? Tagged union?

// other places _ can be used?
var x: _ = null;

match (name1) {
	{name2, name3: int} -> <...>
}

myArray[1]
myStruct.foo
myArray.foo
myStruct[1]
myStruct["foo"]


```

### Second draft

+ base data types: array, tuple/list, struct, interface
+ Traits, inheritance, methods, dyn, polymorphism, this/self, ctors, initialization, getter/setter
+ pointers, null
+ enum, union, bit field, packed

+ var/const declaration
+ decl + assignment, compound assignment

+ indexing/access
+ slice, view, memory model

+ rest, destructuring
+ pattern matching
+ params, return type, contract

+ closure decl
+ top level declaration (especially with var), variable hoisting, function hoisting, top level function call
+ error propagation
+ type cast/conversions
+ equality, type equivalence

Base data types:
arrays, structs, list, tuples, interface, ...
All basic data types form a contract about what it can and can't do:
+ size/length of data span
+ what is inside and where
+ how you can find/refer to the things inside
+ if there can be more than what is described (open vs close)
+ ordered vs unordered

Array.
Syntax:
```
type myArrayWithDynLength = int[];
type myArrayWithKnownLength = int[8];
```
An array defines a memory span that is repeated some number of time. Arrays with dynamic length contain their size then the content of the array. %%TODO explain better %%


Struct.
Syntax:
```
type myStruct = struct {foo: int, bar?: string, x: int, y: int}
var a: myStruct = {foo: 0, bar: "baz", x: 5, y: 8};
```
A struct is a concrete data type that contains a set of key and values (types) know at compile time. It must have a memory span of known size.


Tuple
```
type myTuple = [foo: int, string, ...int[]]
```
Tuples are like structs, but they can be indexed using numbers and don't have to have names on all their fields. They can also have a dynamic size? Not sure how exactly.

Interface
Syntax:
```
type myStruct = struct {foo: int, bar?: string, x: int, y: int}
type position = {x: int, y: int, z?: int}
var a: myStruct = {...};
var b: position = a; // valid, a has x: int and y: int, z is optional
```
An interface describes a list of keys and the type of the value that they can hold. It does not define a concrete data layout, only that some properties exist and have specific types and doesn't define an order for them. Therefore, they cannot be instantiated.
When using an interface, if the concrete implementation is not known at compile time, you must use the `dyn` keyword to turn it into a dynamic interface that can handle any implementation.

Trait
Do we need traits, or can we use interfaces instead?
I think the main purpose is to be able to do `impl <trait> for <type>`, which would let us not be completely stuck with structural typing. But I'm not sure that its useful.

Slice/view
We want a specific syntax for slices and views that represent that we have a reference to a memory part without having actual ownership. Things like destructuring would use this to not have to copy the data. We can have views into arrays and structs.

1. I think we don't have them do any memory manipulation. If you destructure {x, y, ...rest}, everything stays in the same place in memory, but we just have offsets and indexes? Or at least `rest` is not rebuild, and no memory is copied to create `rest` (the type changes to an interface that contains the rest of the keys). Views vs interfaces?
2.  destructuring `[one, two, ...res]`, `[...rest, last]`, `[first, ...rest, last]` creates a view/slice for rest, and the rest is just normal variables. `[...start: int[8], ...rest, ...end[8]]`? Some syntax to split it into multiple slices?
3. a slice is: a pointer, a length, a capacity. a view is: a pointer
4. destructuring traits?











---

~~define data layout (what is where, what each part means, order)~~
~~define capability (name/index/alias, methods, this/self, allowed ctors/init, getter/setter)~~

bindings

~~merging layouts~~
~~merging capabilities~~

~~constructing layouts (ctor/init)~~
~~constructing capability (infered/automatic? dyn?)~~

~~accessing and assignment (get and set)~~

~~var/const decl~~
~~enums?~~



##### interface:
1. defining data layout and bindings:
	1. it doesn't define a data layout, only bindings
	2. bindings: defines what data slot exist and how to get them (using a name or index), but does not define an actual data layout. Also doesn't guarantee anything about the order of the slots, just that they exist.
	3. Need to be used in a context where the compiler knows the concrete data layout or use a `dyn` interface to handle arbitrary data layouts.
	4. `{a: int, b: string, c: {d: bool, e: float}}`
2. merging layouts and bindings
	1. there is no layout to merge
	2. you can merge an interface with structs (tuples? arrays?), and it will then gain the bindings of that type.
	3. `{...struct {a: int, b: bool}}`
3. accessing and assignment (get and set)
	1. as with all types, you can access memory slots. Use keys. You can access statically (`foo.a`) or dynamically `foo["a"]`.
	2. You can use an access followed by an assignment operator to assign a value to the memory slot. `foo.a = 5`
	3. A memory slot can be marked as constant or not. It will control if a new value can be assigned to that slot (not that the value itself cannot be mutated, like with objects or pointers). This is exactly the same as a `var` or `const` variable. You can also make the value itself non-mutable by using const on the type instead of the key. Everything defaults to var. **These rules for const are valid on all types and type definition, not just interfaces** ==Not sure about mutation vs assignment when we have structs and not pointers, these are the rules for now until I have a better idea of how it should work==
		```
			var x: {
				const a: {
					const a: const int,
					var b: const int,
					const c: var int,
					var d: var int
				},
				b: const {
					const a: const int,
					var b: const int,
					const c: var int,
					var d: var int
				}
			}
			x.a = <...> // error, cannot reassign a const variable
			x.a.a = <...> // error, cannot reassign a const variable and the type is const
			x.a.b = <...> // error, the type is const
			x.a.c = <...> // error, cannot reassign, the variable `a.c` is const
			x.a.d = <...> // no error, can mutate and reassign.

			x.b.d = <...> // error, cannot mutate, `x.b` is of type const
		```

4. constructing layouts (ctor/init):
	1. There is not way to initialize an interface
	2. you can cast a concrete layout into a dynamic interface by casting/converting it ==TBD==
5. constructing capability (inferred/automatic?)
	1. we infer capability from usage. Whenever a filed is accessed, we look at how its used to understand the requirements of the data slot.
	2. Concrete data types can't be inferred? Maybe we can slightly infer their shapes, but it might be a bit too hard and not worth it.

##### struct:
1. defining data layout and bindings:
	1. layout is ordered and of known size (not sure if the whole size of the struct needs to be known at compile time or not, if its allowed to contain `int[]` for example)
	2. bindings/bindings: accessing specific data slots using named (string) keys. One name for each key, and no index/number keys (unless we allow explicit number keys, but they would then act as a normal key, just a number instead of a string (x.1)).
	3. `struct {a: int, b: string, c: struct {d: bool, e: float}}`
2. merging layouts and bindings
	1. you can merge a struct with another: `struct {a: int, ...struct {b:string, c: bool}}`
	2. you can merge a struct and an interface: `struct {a: int, ...{b: string, c: bool}}`. It will merge them in the default order of the interface (the order the keys where defined in), but the interface doesn't guarantee any concrete order and it could be somewhat volatile, maybe. Also, maybe `struct {...}` is just the syntax to turn an interface (`{...}`) into a struct.
3. accessing and assignment (get and set)
	1. as with all types, you can access memory slots. Use keys. You can access statically (`foo.a`) or dynamically `foo["a"]`.
	2. You can use an access followed by an assignment operator to assign a value to the memory slot. `foo.a = 5`
	3. You can use const and var like with interfaces
4. constructing layouts (ctor/init):
	1. `type Foo = {a: int, b: string}`
	2. `var x = Foo{a = 5, b = "Hello world"}`
	3. `var y: Foo // reserve place on the stack`
	4. `y = {a = 5, b = "Hello world"} // assign some value`
	5. `const z: Foo = {a = 5, b: string & .length > 0 = "Hello world"}`

##### tuple:
1. defining data layout and bindings:
	1. layout is ordered. To be able to find each section, at most one section can have a dynamic size
	2. bindings: accessing specific data slots using number/index keys. A name can also be specified as an alias for an index.
	3. `[a: int, b: string, bool, struct {d: bool, e: float}, ...int[], last: int]`
2. merging layouts and bindings
	1. you can merge a struct in a tuple: `[...struct {a: int, b: float}]`
	2. you can merge an interface in a tuple: `[...{a: int, b: float}]` It will use the same order as when making a struct from an interface.
	3. you can merge a tuple in a tuple: `[...[int, float]]`
	4. you can merge a static array: `[...int[8]]`
	5. you can merge a dynamic array: `[...int[]]`
	6. when merging, you can give a name to that new part: `[...start: {a: int, b: float}, ...middle: int[], beforeEnd: string, ...end: int[8]` (the difference between merging (`...someType`) and just adding that type (`someType`) is that when merging, we add more indexes, and when adding just the type the whole type takes one index) (what do we do with `...Foo` vs `...rest`?)
	7. Only one dynamic array is allowed in a tuple, but you can have multiple dynamic arrays if they are in sub elements/sub tuples.
3. accessing and assignment (get and set)
	1. as with all types, you can access memory slots. Use keys or indexes. You can access statically (`foo.a`) or dynamically `foo["a"]`. You can also use numbers/indexes (`foo.1` and `foo[1]`)
	2. You can use an access followed by an assignment operator to assign a value to the memory slot. `foo.a = 5`
	3. You can use const and var like with interfaces. `[const Foo, const a: Foo, b: const Foo, const _: Foo]` Const on the label is for assignment, and the one on the type is for mutation.
4. Questions:
	1. optional fields? `[a: int, b?: bool, _?:int]`
	2. default values? `[a: int = 8, _?: bool = false]`
	3. destructuring? `[{a, ...rest}: {a: int, b: string, c: double}, ...{c,d}: {c: string, d: bool}]`
	4. how to build `[key: string, value: int]` into `[string, int, string, int, ...]` for function params `foo("a", 1, "b", 2)`

##### array:
1. defining data layout and bindings:
	1. layout is ordered and each element is of the same type and size. The array can have a static or dynamic size
	2. bindings: accessing specific data slots using number/index keys only.
	3. `int[]`, `int[8]`
2. merging layouts and bindings
	1. you can't really do anything.
	2. Maybe merge sizes: `int[int[8].length + int[6].length]`
3. accessing and assignment (get and set)
	1. as with all types, you can access memory slots. Use indexes. You can access statically (`foo.1`) or dynamically `foo[1]`. 
	2. You can use an access followed by an assignment operator to assign a value to the memory slot. `foo[1] = 5`
	3. You can use const and var like with interfaces. `const int[]` Because you don't define names for variables, you can only make the whole thing constant and don't have control over assignment (for now?)


##### enum:
1. `enum myEnum {Zero, One, Two}`
2. `myEnum.Zero == 0`
3. `myEnum["Zero"] == 0`
4. `myEnum.Zero.toString() == "Zero"`
5. `myEnum[0] == "Zero"` ? Do we require enums to have unique values for all the keys? Maybe have an aliasing mechanic and the name is the name of the first one? What if the enum values are strings?

##### union:
1. `{kind: myEnum.Zero} | {kind: myEnum.One} on kind` + a generic/metaprogramming helper: `Union<myEnum.Zero: string, myEnum.One: int>`. How to make it clean to use? `.kind` `.value`?
2. `string | int`. the compiler adds a flag/enum before the union so we can easily compare? Structural matching, so I'm not sure how it will work in reality. We might need some tag/runtime value for it.

```
type MainChoice =
	| Burger of BurgerChoice
	| Pizza of PizzaChoice
	| Sandwich of SandwichChoice
```


##### pointers (incomplete?):
+ `var x: int = 0;`
+ `var y: *int = &x;` (`int*` or `*int`?)
+ questions:
	+ behavior with union and refinement? type manipulation?
	+ structural matching 
		+ how do we keep track of the type of the value pointed to? And in a transparent way?
		+ what if we change it somewhere else in the code? Ownership?




##### null?
##### type system:
###### Feature list
+ pattern matching, refinement
+ type cast, conversion, ctors, init
+ type compatibility
	+ Variance, Covariance, Contravariance, Bivariance, Invariance
		+ I think TS needs bivariance only for methods, so we might be good if we don't go near that. The main issue is that 
		```
			T extends U
			F<T> extends F<U> // you can only allow this if you can be guaranteed that F<U> is not used in a way that would change the type of anything inside to anything that is not T. (Ex: a mutable list of T, if used as a mutable list of U, could have a U inserted while still being referenced as a list of T)
			// but
			(a: U){} extends (a: T){}
		```
		+ So the issue is specifically if 
	+ overloading, operator overloading
	+ upper/lower type bounds
	+ polymorphism
+ inference rules, `_` as no-op
+ type manipulation
	+ type level functions,
	+ metaprogramming
+ borrowing/ownership
+ function params/contracts (out vs mut vs in vs const, const vs readonly vs mutable):
+ pointers and mutation, type modification, type state

+ static/comptime values, embedded in types?
###### first draft

1. type compatibility, subtyping, variance, overloading, upper/lower type bounds, polymorphism
2. refinement, pattern matching, union and distributivity
3. inference
4. type state
5. type manipulation
6. type cast

how do we handle mutability? mutability changes refinements and type states. If 2 things refer to the same value, one changing its refinement could break the other. You have to "borrow" the refinement with borrowing the value

[Refinement Types, Ranjit Jhala & Niki Vazou](https://arxiv.org/pdf/2010.07763)

refinement, type state, structural typing, inference

(type compatibility/subtyping, soundness, variance, overloading, upper/lower type bounds)



**For every legal execution step, which properties must remain true, and do your rules guarantee that they remain true?**

Potential issues:
1. aliasing (+mutation) may break type/type state. Possible solutions: track aliasing, type state change on one is type state change on the other. have a lower type bound and make all type state a subtype of it
2. subtyping soundness: make sure that subtyping rules work, especially with refinements that don't overlap (neither are the subtype of the other, and they are possibly compatible, but not exactly)
3. 



For each rule:
- What does the rule actually guarantee? State its preconditions and postconditions precisely.
    
- What other rules can invalidate its assumptions? In particular, consider mutation, subtyping, abstraction, and control-flow joins.
    
- Does the guarantee survive composition? Try to construct a small well-typed program that reaches a state the type claims to exclude.


We need to make a system that preserves invariants, even across different and fairly far encapsulation/abstraction.




```
[T] = {values that satisfy T}
refinement
[{x: T | P(x)}] = {v ∈ [T] | P(v)}
refinement subtyping
{x: T | P(x)} <: {x: T | Q(x)}, only if P => Q


```

A dependable starting policy is:
- Read-only fields: covariance can be sound.
- Write-only fields: contravariance can be sound, provided the capability is truly write-only.
- Read/write fields: invariance is the conservative default.
- Function inputs: contravariant.
- Function outputs: covariant.


How to handle recursive types? aliasing?

If when making a recursive type with refinement, the recursed type doesn't create a new type/refinement, then we can fairly easily evaluate if the 2 are the same.


How do we do aliasing and borrowing?


###### solution

Type system:
+ Types as capability:
	+ Types aren't just the traditional types like in normal programming languages. Here, they describe capabilities/permissions about what the value can/is allowed to do. Types include refinements, borrowing/ownership information, low and high bounds, contracts, things like effects (like reads/writes/allocs/... Not written as effects per say, but as modification/transition of state or as capabilities of types (if you want to read from T, T must be readable. You could have something writable but not readable, its weird, but its not wrong)).
+ contracts:
	+ functions (and borrows?) define contracts. Contracts define all the conditions that must be met before (preconditions, it is just a type like everything else) and establish conditions that are true after the function call (postconditions, still just types)
	+ When a contract is executed, all values that participate see their types modified (essentially, this is like type state) to whatever the contracts says it would become. A contract can say that it changes the type of a value, and after the function, the value will have that new type. This means that even input values need to be type checked against the result types/postcondition, and if the contract modify the type in a forbidden way, then we get a type error.
	+ Contracts could encode conditionals, like if T > 0, postcondition X is true, else Y is true
	+ Contracts behave like types (after all, types are contracts on the value), and so you can manipulate it and use it like you would any other type.
+ structural typing, subtyping, variance, overloading:
	+ Once we have subtyping, overloading is just choosing the function that is/its parameters are a subtype of all others. Only one slight issue with refinement, if 2 overloads don't have a way to select between them/subtyping is ambiguous, then it could cause problems. Make an error, or have a system to handle it. Overloading will be how we do traits (and refinement aware traits).
	+ subtyping:
		+ non recursive structures are really easy, just compare each field. If all fields are compatible, then the types are. We will start with those exclusively, and will deal with recursion later.
		+ recursive types that don't manipulate the type parameters aren't a problem. Just memoize the type comparisons, and if you reach back to a comparison you already made, then that branch is compatible (I think).
		+ recursivity that touches type parameters is somewhat problematic, especially if the resulting type is recursive in a way that generates infinite amount of new types/type comparisons (`F<T> = {f: F<F<T>>}`)
+ refinement and union:
	+ we can refine a type, like `int > 0`, to describe in more detail what it is and its restrictions.
	+ not sure to what extent we can refine, but it could go quite far as long as it's decidable.
	+ unions:
		+ tagged union (`A | B on .foo`)
		+ normal unions are a bit trickier. `int > 0 | int < -5` or `int > 0 & int < 10` is a valid refinement. We must handle it.
		+ Not sure how intersection and union will work, but it should not be too hard.
+ lower and higher type bounds
	+ types have a high bound (`T :< U`) and a low bound (`T :> L`). When doing inference, we update both. Most types written by users will be a upper bound, but writing a low bound is possible. We can use bounds to be able to more precisely define narrowing and widening and allow for better and more flexible rules.
+ borrowing/aliasing
	+ borrowing and aliasing tracking are very similar, and we can do both with the same system.
	+ I think we get aliasing for free just by using low and high bounds + type state and good contracts.
	+ I think that borrowing might just naturally come from the system, with the only requirement to be adding the right tracking states (like const, mut, read, write, etc.). I think everything else just falls down from this.
	+ A borrow defines a contract
		+ ? and has a lower and higher type bound that defines how the borrow can be used using the borrow and how it is used outside the borrow. Lower and higher type bound is just the normal type bounds? Not sure if it would work like that, or we would need a little bit more machinery around it.
	+ suspend a borrow? scheduled release? revocation?
	+ mutation needs to change the type within the bounds of the borrow?

Now, what does it look like concretely?

This is a shitty example based on a rust example from Chat GPT.
Original:
###### >
```
struct Position {
    x: i32,
    y: i32,
}

struct Player {
    position: Position,
    health: i32,
    gold: i32,
}

struct Monster {
    position: Position,
    health: i32,
}

struct World {
    width: i32,
    height: i32,
    walls: Vec<Position>,
    treasures: Vec<Position>,
}

fn is_wall(world: &World, position: &Position) -> bool {
    world.walls.iter().any(|wall|
        wall.x == position.x && wall.y == position.y
    )
}

fn move_player(
    world: &World,
    player: &mut Player,
    dx: i32,
    dy: i32,
) {
    let next = Position {
        x: player.position.x + dx,
        y: player.position.y + dy,
    };

    if next.x < 0 || next.y < 0
        || next.x >= world.width
        || next.y >= world.height
    {
        println!("You cannot leave the dungeon.");
        return;
    }

    if is_wall(world, &next) {
        println!("A wall blocks your path.");
        return;
    }

    player.position = next;
}

fn collect_treasure(world: &mut World, player: &mut Player) {
    let index = world.treasures.iter().position(|treasure| {
        treasure.x == player.position.x
            && treasure.y == player.position.y
    });

    if let Some(index) = index {
        world.treasures.remove(index);
        player.gold += 10;
        println!("You found 10 gold!");
    }
}

fn monster_turn(
    world: &World,
    player: &mut Player,
    monster: &mut Monster,
) {
    if monster.health <= 0 || player.health <= 0 {
        return;
    }

    let dx = player.position.x - monster.position.x;
    let dy = player.position.y - monster.position.y;

    if dx.abs() + dy.abs() <= 1 {
        player.health -= 2;
        println!("The monster attacks you!");
        return;
    }

    let next = if dx != 0 {
        Position {
            x: monster.position.x + dx.signum(),
            y: monster.position.y,
        }
    } else {
        Position {
            x: monster.position.x,
            y: monster.position.y + dy.signum(),
        }
    };

    if !is_wall(world, &next) {
        monster.position = next;
    }
}

fn main() {
    let mut world = World {
        width: 8,
        height: 6,
        walls: vec![
            Position { x: 2, y: 1 },
            Position { x: 2, y: 2 },
            Position { x: 2, y: 3 },
        ],
        treasures: vec![
            Position { x: 1, y: 0 },
            Position { x: 4, y: 2 },
            Position { x: 6, y: 5 },
        ],
    };

    let mut player = Player {
        position: Position { x: 0, y: 0 },
        health: 10,
        gold: 0,
    };

    let mut monster = Monster {
        position: Position { x: 7, y: 4 },
        health: 5,
    };

    let moves = [
        (1, 0), (0, 1), (1, 0), (1, 0),
        (0, 1), (1, 0), (0, 1), (1, 0),
        (0, 1), (1, 0), (0, 1), (1, 0),
    ];

    for (turn, (dx, dy)) in moves.iter().enumerate() {
        println!("--- Turn {} ---", turn + 1);

        move_player(&world, &mut player, *dx, *dy);
        collect_treasure(&mut world, &mut player);
        monster_turn(&world, &mut player, &mut monster);

        println!("Health: {}", player.health);
        println!("Gold: {}", player.gold);

        if player.health <= 0 {
            println!("You were defeated!");
            break;
        }
    }

    println!(
        "Game over. Final gold: {}, health: {}",
        player.gold,
        player.health
    );
}
```
###### --

Modified:
```
type Position = { x: int; y: int }
type Player = { position: Position; health: int; gold: int }
type Monster = { position: Position; health: int }
type World = { width: int; height: int; walls: Position[]; treasures: Position[] }

//TODO const borrowing like rust
type &Const<T> = ...
//TODO mut borrowing like rust
type &Mut<T> = ...

//TODO more complicated borrows

// TODO only borrow world.walls
function isWall(
	world: &Const<World>,
	position: &Const<Position>
) -> boolean {
	return world.walls.any(
		(wall) => wall.x == position.x && wall.y == position.y
	)
}

//TODO contract success vs fail (mut vs non mut). return bool if moved, and if moved contract is different than if not moved
function movePlayer(
	world: &Const<World>,
	player: &Mut<Player>,
	dx: int,
	dy: int
) {
	//TODO operator overloading?
	var next = player.position + {x: dx, y: dy}
	
	if (next.x < 0 || next.y < 0
		|| next.x >= world.width,
		|| next.y >= world.height
	) {
		println!("You cannot leave the dungeon.");
        return;
	}
	
	if (isWall(world, next)) {
	    println!("A wall blocks your path.");
        return;
	}
	
	player.position = next;
}

// TODO only mut borrow world.treasures, player.gold. const borrow player.position
function collectTreasure(
	world: &Mut<World>
	player: &Mut<Player>
) {
	//TODO int | null? Or some other type?
	var index = world.treasures.find((treasure) => 
		treasure.x == player.position.x 
			&& treasure.y == player.position.y
	)
	
	//TODO pattern matching?
	if (index != null) {
		world.treasures.remove(index);
		player.gold += 10;
		println!("You found 10 gold!");
	}
}

//TODO const monster.health, player.position. mut player.health, monster.position
//TODO const world, same as isWall
function monsterTurn(
	world: &Const<World>,
	player: &Mut<Player>,
	monster: &Mut<Monster>
) {
	if (monster.health <= 0 || player.health <= 0) {
        return;
    }
    
    var dx = player.position.x - monster.position.x;
    var dy = player.position.y - monster.position.y;

    if (dx.abs() + dy.abs() <= 1) {
        player.health -= 2;
        println!("The monster attacks you!");
        return;
    }
    
    var next = if (dx != 0)
	    then Position{
		    x: monster.position.x + 1 * dx.signum(),
		    y: monster.position.y,
		}
	    else Position{
		    x: monster.position.x,
		    y: monster.position.y + 1 * dy.signum(),
		}
    
    if (!isWall(world, next)) {
	    monster.position = next;
    }
}

function main() {
	var world = World {
        width: 8,
        height: 6,
        walls: [
            { x: 2, y: 1 },
            { x: 2, y: 2 },
            { x: 2, y: 3 },
        ],
        treasures: [
            { x: 1, y: 0 },
            { x: 4, y: 2 },
            { x: 6, y: 5 },
        ],
    };
    
    var player = Player {
        position: { x: 0, y: 0 },
        health: 10,
        gold: 0,
    }
    
    var monster = Monster {
        position: { x: 7, y: 4 },
        health: 5,
    };

    var moves = [
        [1, 0], [0, 1], [1, 0], [1, 0],
        [0, 1], [1, 0], [0, 1], [1, 0],
        [0, 1], [1, 0], [0, 1], [1, 0],
    ];

	for (var [dx. dy], turn of moves) {
		println!("--- Turn {} ---", turn + 1);
		//TODO borrow or ref markers when we call a function?
		// Its not obvious that we are borrowing.
		movePlayer(world, player, dx, dy);
		collectTreasure(world, player);
        monsterTurn(world, player, monster);
        
        println!(`Health: ${player.health}`);
        println!(`Gold: ${player.gold}`;

		if (player.health) <= 0 {
            println!("You were defeated!");
            break;
        }
	}

    println!(
        "Game over. Final gold: ${}, health: ${}"(
	        player.gold,
	        player.health
        )
    );
}

```



current issue:
how do you treat paths in a way that makes it not suck. If you have `foo[0]` vs `foo[1]` vs `foo[i]`, paths are going to be weird, especially if they are pointers and they point to the same object. We will need some more type level helpers to make that pattern feel right.
I think we have the same kind of thing for refinements, so a unified approach should be prioritized.




Not designed yet:

pattern matching, destructuring
distributivity of refinement over union and union of disjoint refinements (unions without an enum)
inference
type manipulation, type cast, inline type state

read, write, move, init?


##### traits:
What do we want traits to do? We could just do like Go and be done with it.
Nominal in some way? All structural? Allow for blanket implementations? What kind of rule do we want? Need to import trait to get the methods? Always have trait methods if you spread it in the type? What is the actual behavior we want?

```
trait MyTrait {
	function a() -> void
}

implement MyTrait for MyStruct {
	function a() { return }
}

var x: MyTrait = MyStruct{};
// MyTrait is MyTrait & MyStruct
// MyTrait doesn't have any runtime here.
// all it does is allow `x.a()` to mean `MyTrait::a<MyStruct>(x)) (overloading rules)

x.a();

// this one is fairly easy, make the vtable here and we don't have to track anything
// the only tricky part is handling overloads/refinements that might happen later.
// Maybe we don't need dyn traits, and that every other feature can handle this instead?
var y: dyn MyTrait = MyStruct{};

// Which methods are visible on z?
var z: MyStruct;
```

+ main issue: update/mutate types in the global state (order and visibility problems)
+ do we allow to change/update types at a distance? could be useful for modifying a library, but it should be reserved as a special case
+ Do we need traits to modify the global state? Yes, but each combo trait x variant is independent. The only issue is traits on interfaces that could leak traits to everything.

```
trait def
trait def in diff file
try to get a conflict
try with interfaces
default impl
```

Could traits be a nominal interface that contains all impls, then you refine each type that implements it with it. Then you would just keep `MyType & /* MyTrait */ {fn<1> a(), fn<2> a(), fn<3> a(), ...}`. I think that would work, they type itself caries the trait info, the brand keeps it nominal, and refinements select the right impl. I think that works.

Something like this:
```
// Refinement and function decl/contracts syntax is TBD

trait Show {
	function show() -> void;
}

impl Show for {x: int, y: int} {
	function show() => `Interface(${this.x},${this.y})`;
};

type Point = struct {x: int, y: int};
impl Show for Point {
	function show() => `Point(${this.x},${this.y})`;
}

impl Show for Point & .x > 0 {
	function show() => "positive x";
}

impl Show for Point & .y > 0 {
	function show() => "positive y";
}

impl Show for Point & .x > 6 & p.y > 9 {
	function show() => "nice";
}

impl Show for Point & .x < 100 {
	function show() => `less than 100 x`;
}

Show == {
	[{x: int, y: int}]: ...
	[struct {x: int, y: int}]: ...
	
}

`impl Show for Point` does 2 things:
	1. add the impl to the Show dict under the key of the type (structural)
	2. add Show as a refinement on Point

you can do this:
trait Foo {...}
impl Foo for struct {a: int};
type A = struct {a: int} & Foo;

struct {a: int} extends Foo == false;
A extends Foo == true;









import/cross file
shadowing rules, namespace, module, context
visibility/export rules?
impl for 2 identical types but 2 different type decl

main problem, its not a function with a name and a location, so you can't easily reference it, and its fairly awkward to handle

maybe require to import trait impl from a file, and then use that to resolve issues? Like for the Show trait,
import {Show} from "Show.crow"
import {Show as ShowPoint, Point} from "Point.crow"

The only issue is name collision, but if import * as X, then you don't get any issue? Or do you do
import traits from "Point.crow"


//TODO syntax to add a refinement on an existing type? We'd want some sort of rules arround it for sure. Maybe it would be part of metaprogramming?



Solution 1:
when you do `impl X for Y ...`, that file now exports X as a specific impl of X, so that you can now use it directly. If you want to use the general trait, import the general trait, if you want a specific impl, import the specific impl.


I think what we want is each trait impl needs to be imported individually with a name. That way, there is no way to have conflict/use an impl that wasn't intended


if you import the impl as Show, then we can select exactly which show is used.
but then, its not really possible to 


SOLUTION:
something that is almost like explicitelly naming each implementation.
When you import a trait, you only import the trait definition.
If you want to use it, you need to import an implementation dict. The implementation dict is a sort of dict that contains all implementations for a trait in the file/module its imported from, keyed by structural types the same way and with the same rules as overloading.
You can merge implementation dicts, unless it makes something ambiguous according to overload rules.
Then, you can use that dict to resolve the implementation, its a bit like dict passing, but the dict is bound to the type (using &) so it follows everywhere.

The name defaults to the name of the trait, and adds the entries to the trait (it kind of augments the imported type, but only in the current scope, unless its exported, then it can be imported using the name of the trait and the file it was implemented in).

// show.crow
export trait Show {render: () -> string}

// types.crow
export type Point = {x: int, y: int}
export type Vector = {x: int, y: int}

// A.crow
import {Show} from show
import {Point} from types
impl Show for Point {render = () => "A"}

// B.crow
import {Show} from show
impl Show for {x: int, y: int} {render = () => "B"}

// C.crow
import {Show} from show
import {Show as ShowA} from A
import {Show as ShowB} from B

// do we automatically link impls and trait?
// merge Show trait and Show impl from A?





type ShowPoint = impl Show for Point { ... }
type Point = { x, y } & Show & ShowPoint;




trait Show {fn render() -> string}
// Show == #trait1 & {render: (self) -> string = null}

type ShowPointA = impl Show for {x, y} { fn render(self) -> string { return "A" } }
// ShowPointA == #trait1 & {render: (self: {x, y}) -> string = #fn1}
type ShowPointB = impl Show for {x, y} & {.x > 0} { fn render(self) -> string { return "B" } }
// ShowPointB == #trait1 & {render: (self: {x, y} & {.x > 0}) -> string = #fn2}

fn f<T extends Show>(x: T) -> string { return x.render() }

let p: {x, y} & {.x > 5} & ShowPointA & ShowPointB = ...;
let q: {x, y} & ShowPointA = ...;


trait Eq  { fn eq(self: Self, other: Self) -> bool }
// Eq == #trait1 & {eq: ...}
trait Ord: Eq { fn cmp(self: Self, other: Self) -> Ordering }
// Ord == #trait1 & {eq: ...} & #trait2 & {cmp: ...}


trait Show { fn render(self: Self) -> string }
type ShowPos = impl Show for Point {
  fn render(self: {Point | .x > 0}) -> string { "pos" }
}


type ShowPointA = impl Show for Point {
  fn render(self) -> string { "A" }
  fn renderUpper(self) -> string { upper(self.render()) }
}




covariance vs contravariance?
Show      == #trait1 & {render: (self: Self) -> string = null}
ShowPoint == #trait1 & {render: (self: {x, y}) -> string = #fn1}



fn render(value: {x: int, y: int}) -> string {...}
fn render(value: {x: int, y: int} & {.x > 0}) -> string {...}
var x = render;


Show::show(p) // how do we namespace records?


//?? blanket impl?
impl<T> Show for T {fn show(self) => "?"}

// how to call the right refinement with dyn? Do we check refinements at runtime, or do we take a snapshot at the moment its created? Do we pass the trait dict? What if we remove some refinement? (.x > 0, x = 0, then what do we do with the trait? We can't use it anymore.)
// maybe don't allow dyn traits, only interfaces?
let x: dyn Show = if cond then point else nonempty_list;
x.show();
// I think this is the main difference between trait and interface. An interface says: these are the available function pointers, traits say: these are the implmentations of that interface, find the right one. It also means that a ayn trait with a lot of refinements will be very slow.



// module A
impl Show for Point {fn show() => "A"};
// module B
impl Show for Point {fn show() => "B"};
// module C
import A;
import B;
point.show();


impl Show for Point & .x > 0 ...
// but no default impl



what if
fn foo(a: Show, b: Show) -> Show
and is used inside inference heavy things? Is there an issue where we wouln't be able to find the right concrete implementation for it? And it might be a bit annoying to try to represent those as 3 different types that implement Show, then what will be the concrete return type?

```



Issues:
```
impl<T> Show for T {fn show(self) => "?"}

impl Show for {p: Point where p.x > 0} {
	fn show(self) => "Positive";
}
// which one takes precedence?
```

```
impl Show for {p: Point where p.x > 0} {...}
impl Show for {p: Point where p.y > 0} {...}
// which one wins? Same issue could happen in function overloading.
```

```
impl Show for {p: Point where p.x > 0} ...
impl Show for {p: Point where p.x > 2 & p.y > 3} ...
//vs
impl Show for {p: Point where p.x > 0} ...
impl Show for {p: Point where p.x < 100} ...
```

```
let x: dyn Show = if cond then point else nonempty_list;
x.show();
// if we have a refinement (like p: Point where p.x > 0), now we don't call it with dyn.
```

```
// module A
impl Show for Point {fn show() => "A"};
// module B
impl Show for Point {fn show() => "B"};
// module C
import A;
import B;
point.show();
// which impl is used?
```

```
impl Show for {p: Point where p.x > 0} ...
// but no default impl
// does Point (without refinement) still have an impl for show?
```

```
// can we break it with 2 types that are almost the same? Try to break nominal typings.

// to be able to send traits between binary bindings, we have the obvious dyn trait, we could also have something where we pass in a dict/structure that contains multiple impls (like a dict of callbacks/witness tables) so we can do generics across binary bounds (instead of monomophizing everything).
```

##### global scope, hoisting, closure, import/export/package (visibility/encapsulation and order), namespace:
+ hoisting:
	+ option 1: the simple but bad. if use anything in the global state that might not have been initiated, make it potentially undef.
	+ option 2: track every use, and if you use smt from the global state in a function, you have to call it only after it was initialized. What if we have pointers and values inside or other constructs that are similar to variables in the global state? Do we need rules for them too?















errors and error propagation
+ syntax sugar, equivalent to `if (err != null) return _, err;` like go. Maybe with some handler syntax. Maybe could be similar to defer/using? Or maybe it interacts with it?
defer/using




compiler directives, enable/disable compiler rules




look at OCaml for inspiration?



---
# end


~~out vs mut vs in vs const~~



~~pattern matching?~~

~~polymorphism?~~ nominal types?
~~refinement~~? ~~type compatibility~~? ~~contracts~~?
~~type cast, conversion~~
~~type manipulation, type level functions~~
~~metaprogramming, compiler directives~~
enum generation?
allow to change behavior (like struct no indexing rule) on specific types/implementations?
~~operator overloading~~?
~~pointers? borrowing/ownership?~~

~~errors and error propagation~~

~~assignment/accessing global scope/higher scope (+closure), hoisting~~
~~module, import/export (mechanics and visibility, traits)~~

~~defer, using~~



~~const vs readonly vs mutable~~



how do refinements work with inference? If a fn returns a more specific type that we put in a variable, and then we try to put in a more generic, should we check the refinements? Or should we expand the type of the variable?







pattern matching + overloading + refinements are all kind of the same feature?


~~upper/lower bound on types~~








---

Hello. I've been working on a design for a language for some time now, and I'd like some feedback. (sorry for the wall of text)

**A bit of context**
My language is mostly inspired by C and Typescript. The language is focused on trying to solve one problem. When making apps, you need flexibility (early on with prototypes and new features/prof of concepts) and control (for performance, validity of the code). Languages often don't allow both and sacrifice one for the other, or sit in a weird middle ground. I am trying to make a language that has both high level features you would find in a scripting language, and have an easy way to have the low level control that you need in the parts of the program that needs it, without making the high level features worse in the rest of the program. (an example of something I don't want is gradual typing)



Now for how I'll do that.
Not the final design, not really developped to much


To do that, ...
use inference/bidirectional typing to infer as much as possible (to the point you could make a whole program without writing a single type while keeping it type safe)

transparency

static analysis


structural type system
type state + refinement

There is a 
inference, transparency, static analysis, structural typing, bidirectional typing, type state, refinement types.


**The design I want to focus on**
I focused on the data structures/data layouts first. This is what I have:
```
type MyArray = int[8]

type MyTuple = [
	int, // i = 0
	a: int, // i = 1
	...MyArray, // i = 2..10
	...MyStruct, // i = 11..15, add the keys of MyStruct and new indexes
	...b: string[], // starts at i = , only one dyn array is allowed in a tuple
	last: string
]

type MyStruct = struct {
	a: int,
	b: struct {c: bool, d: double},
	...{e: int, f: int},
}

type MyInterface = {f: int, a: int};

var a1: MyArray = [0,1,2,3,4,5,6,7];
a1[0] = 0;

var t1: MyTuple= [<...>];
t1[0] = 0;
t1.a = 1;
t1.["a"] = 1;
t1.b[0] = "11";
t1[11] = "11";

var s1: MyStruct = {<...>}
var i1: MyInterface = MyStruct{<...>};
var i2: dyn MyInterfacce = <...>

// Destructuring
var [...start: int[3], ...middle, ...end: [int, int]] = [0, ...[1,2,3,4], 5, 6, 7];

// enum and union
enum MyEnum {Zero, One, Two};
var x: MyEnum = MyEnum.Zero;
x == 0
x == myEnum["Zero"]
x.toString() == "Zero";

// union
type Union1 = {kind: myEnum.Zero} | {kind: myEnum.One} on kind
type Union2 = string | int;

```
Interfaces are not a concrete type, you can't instantiate them. The compiler needs to infer a concrete implementation to be able to generate the code, unless you use a `dyn` interface.
Structs and tuples are ordered. The main difference between them is that structs cannot have anonymous fields and can't use indexes while tuples can use indexes and the name for fields is optional. The tuple itself has a size, and none of the `...` fields carry their size with them. That means that each part of a tuple needs to have a static index from either the start or end of the tuple.

...
+++ how should I handle traits? Unions that don't have a discriminant field?
