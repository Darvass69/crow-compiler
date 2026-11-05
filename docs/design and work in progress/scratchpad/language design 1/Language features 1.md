

Features
+ ~~import, export, namespace. import from as x, index files~~
+ ~~top level statements,~~ forward declaration
+ Conditional compilation, compiler directives
+ ~~function~~, lambdas, closures
	+ ~~params~~, contracts, in and out params, return type
	+ function pointer vs lambda (closure vs no closure)
	+ ~~spread and rest params~~
	+ ~~return~~, result
	+ ~~default arguments~~
	+ partial application, currying
	+ Named return values, ~~named parameters~~
+ data
	+ ~~struct, array~~. ~~Indexing~~, ~~property access/set.~~
	+ Traits, inheritance, methods, dyn traits, polymorphism
	+ ~~destructuring~~, ~~rest, spread~~
	+ enum, discriminated union
	+ ~~array vs list vs tuple vs struct~~
	+ this, self
	+ ctors, initialization, mem allocation
	+ getter/setter?
	+ ~~set, slice, view~~
+ ~~const, var~~
+ ~~string literals~~, ~~number literals (dec, hex, bool)~~, ~~templates~~, ~~char~~, ~~raw strings~~, ~~escape sequence~~
+ ~~int, float, double~~
+ null, nullptr
+ errors (as values, no throwing), error propagation
+ memory model, pointers, etc
+ for, while, continue, break, labels, do while, for of
+ if, else. Expression variant.
+ operators (basic)
	+ binary op, prefix op (arithmetic, logical, bitwise, etc)
	+ compound assignment
	+ null coalescing (`??`)
	+ increment, decrement
	+ concatenation `..` ?
	+ Range?
	+ pipe?
+ generics/type level manipulation, metaprogramming.
+ generator functions?, static locals?, iterators?
+ match, pattern matching
+ type cast/conversions
+ `_` as noop
+ defer? using?
+ comments
+ multiple assignment
+ Async / await, coroutine, threads, channels, atomics
+ Foreign-function interface
+ Assertions, Panic / abort, Unreachable
+ swap
+ pointer arithmetic, deref
+ volatile?
+ bit field, packed
+ equality, type equivalence




result only for labeled blocks? Might not be too stupid.

---


---
















```
import # as # from #;
export # as #;

namespace #

const SOME_CONSTANT = 0;
var someVar: int | null;


function someFunction(
	...someArray: int[8],
	...someStruct: {x: int, y: int},
	param1: int,
	param2 = 5,
	...args: string[]
) {	
	return 0;
}

// spread params rules: Only 1 open struct for each function? (or maybe just of the same type? If we can disambiguate where they go, it doesn't really matter how we do it.), named and unamed params at the same time or is it not allowed?
someFunction(param1: 2, someStruct: [0,1,2,3,4,5,6,7]) // ":" or "=" for named params?

// destructuring and pattern matching? Could we have 1 syntax for both?
const {a, x = b} = {a: 1, b: 2}; // not sure about renaming
const [a, x] = [1,2];

// closed vs open (can you have any nb of elements), ordered vs unorded (do elements have an order). What is what? struct closed & unordered, or are structs ordered?
type SomeStruct = struct {a: int, b: string, c: bool} //not sure about the syntax
type SomeArray = [a:1, 2, 3, 4, 5, 6, 7, ...rest: bool[]];
someStruct.a;
someStruct[0]; //?
someArray[0] = 0;
someArray.a; //?
// array vs list vs tuple vs struct
// set, slice, view
const x = [...[0,1,2], ...[3,4,5]]; // == [0,1,2,3,4,5]

const myConst = 6;
var myVar = 7;

var myString = "This is a string";
var myNumber = 20.3645;
var myHex = 0xABCD;
var myStringTemplate = `This is a template. You can use this to add a string ${myString}, a number ${myNumber} or anything that can be turned to a string ${someArray}. You can also leave open place holders, like this ${}, that can be provided later.`
var myStringTemplateDone = myStringTemplate("Fill placeholder 1");
var myChar = 'A'; // not sure if its that good or useful.
var rawString = """This is a raw string.""" // not sure about the syntax, or if we really need it.
// escape sequence

type Number = int | float | double; // We could also have a numeral type that only gets resolved when used, so we could use numeral for any type of number that can do number things (instead of having to cast it early).



```



---





Features
+ ~~import, export, namespace. import from as x, index files~~
+ ~~top level statements~~, ~~forward declaration~~
+ ~~function, lambdas, closures~~
	+ ~~params, contracts, in and out params, return type~~
	+ ~~function pointer vs lambda (closure vs no closure)~~
	+ ~~spread and rest params~~
	+ ~~return~~, ~~result~~
	+ ~~default arguments~~
	+ ~~partial application, currying~~
	+ ~~Named return values, named parameters~~
+ data
	+ ~~struct, array. Indexing, property access/set.~~
	+ ~~Traits, inheritance, methods, dyn traits, polymorphism~~
	+ ~~destructuring, rest, spread~~
	+ ~~enum, discriminated union~~
	+ ~~array vs list vs tuple vs struct~~
	+ ~~this, self~~
	+ ~~ctors, initialization, mem allocation~~
	+ ~~getter/setter?~~
	+ ~~set, slice, view~~
	+ ~~bit field, packed~~
+ pointers
	+ ~~null, nullptr~~
	+ ~~memory model, pointers, etc~~
	+ ~~pointer arithmetic, deref~~
+ ~~type cast/conversions~~
+ ~~equality, type equivalence~~

+ ~~Conditional compilation, compiler directives~~

+ ~~Async / await, coroutine, threads, channels, atomics~~
+ ~~generator functions?, static locals?, iterators?~~
+ ~~Assertions, Panic / abort, Unreachable~~

+ ~~string templates type, other kind of templates? (could that be how we pattern match?)~~
+ ~~generics/type level manipulation, metaprogramming.~~
+ ~~match, pattern matching~~

+ ~~`_` as no-op~~

+ ~~volatile?~~
+ ~~swap~~
+ ~~defer? using?~~

+ ~~comments~~
+ ~~errors (as values, no throwing), error propagation~~
+ ~~Foreign-function interface~~
+ ~~multiple assignment~~
+ ~~string literals, number literals (dec, hex, bool), templates, char, raw strings, escape sequence~~
+ ~~int, float, double~~
+ ~~const, var~~
+ ~~for, while, continue, break, labels, do while, for of~~
+ ~~if, else.~~
+ ~~operators (basic)~~
	+ ~~binary op, prefix op (arithmetic, logical, bitwise, etc)~~
	+ ~~compound assignment~~
	+ ~~null coalescing (`??`)~~
	+ ~~increment, decrement~~
	+ ~~concatenation `..` ?~~
	+ ~~Range?~~
	+ ~~pipe?~~
	+ ~~ternary if (if ... then ... else ...)~~

---


+ <font color="#00b050">comments</font>
+ module stuff: <font color="#00b050">import, export</font>, <font color="#92d050">namespace</font>, <font color="#fac08f">packages/modules if we do that</font>
+ Foreign-function interface, forward declaration


Statements
+ <font color="#00b050">for, while, continue, break</font>, <font color="#fac08f">labels</font>, <font color="#92d050">do while</font>, <font color="#92d050">for of</font>
+ <font color="#92d050">if, else</font>
+ <font color="#fac08f">turn any block into an expression by using `result` + maybe a label?</font>

Primitive types
+ <font color="#92d050">string literals, number literals (dec, hex, bool), templates, char</font>, <font color="#fac08f">raw strings</font>, <font color="#fac08f">escape sequence</font>
+ int, float, double
Basic operators
+ <font color="#00b050">arithmetic</font>
+ <font color="#00b050">logical</font>
+ <font color="#00b050">bitwise</font>
+ <font color="#00b050">comparison</font>
+ <font color="#00b050">prefix not and negative</font>
+ <font color="#92d050">null coalescing (`??`), `or` and `and` short-circuiting</font>
+ <font color="#00b050">increment, decrement (pre and postfix)</font>
+ <font color="#92d050">concatenation, range</font>
+ <font color="#92d050">pipe</font>

Other constructs with minimal (syntactic) interaction
+ swap: just an operation to swap 2 values. Could be like a function (swap(a,b)), or an operator `<=>`.
+ defer? using?. The only tricky part is if we want to setup a defer inside an if statement that triggers at function exit instead of if block exit. I don't know if its the kind of things that we would do, but it might be a bit necessary to make it actually useful. Not sure though.
+ volatile : not sure if we need that. Not really relevant to syntax design.


+ generics/type level manipulation, metaprogramming.
+ <font color="#c00000">Conditional compilation, compiler directives</font>


Assignment/declaration:
+ <font color="#00b050">const, var</font>
+ <font color="#fac08f">multiple assignment/declaration, destructuring, decl list</font>
+ <font color="#92d050">compound assignment</font>
+ top level declaration (especially with var), variable hoisting
Function definition, body, call
%%
function params could be left side of a multiple assignment, and function call would be the right side. That way, any syntax that is about variable is exactly the same, and any syntax that is about putting data inside variables is also the same. The only place where it could be weird is with partial application.
%%
+ params, return type
	+ in and out params
	+ <font color="#00b050">spread and rest params</font>
	+ <font color="#00b050">default params</font>
	+ <font color="#fac08f">named return values</font>
	+ errors as values
	+ datatypes, arrays, structs and destructuring
	+ <font color="#fac08f">const param</font>
+ contracts
+ <font color="#92d050">partial application, currying</font>
+ <font color="#00b050">named parameters</font>
+ <font color="#fac08f">closures, lambdas</font>
+ error propagation
+ function hoisting
+ top level function call

Traits
+ inheritance
+ methods
+ dyn traits
+ polymorphism
+ this, self
+ ctors, initialization
+ getter/setter?

Other complex
+ <font color="#fac08f">match, pattern matching</font>
+ <font color="#fac08f"> `_` as no-op</font>

+ type cast/conversions
+ equality, type equivalence
+ non mutable/const

Data types
+ <font color="#92d050">struct, array. Indexing, property access/set.</font>
+ <font color="#92d050">destructuring, rest, spread</font>
+ <font color="#fac08f">enum, discriminated union</font>
+ <font color="#fac08f">array vs list vs tuple vs struct</font>
+ mem allocation
+ <font color="#fac08f">set, slice, view</font>
+ <font color="#fac08f">bit field, packed</font>

pointers
+ <font color="#92d050">null, nullptr</font>
+ memory model, pointers, etc
+ pointer arithmetic, deref

+ Async / await, coroutine, threads, channels, atomics
+ generator functions?, static locals?, iterators?
+ Assertions, Panic / abort, Unreachable
