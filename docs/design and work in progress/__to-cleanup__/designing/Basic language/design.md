


#state/final  #confidence/high #stability/stable
![Primitive types](Current%20language%20spec.md#Primitive%20types)

+ `int8`, `int16`, `int64`
+ `uint8`, `uint16`, `uint32`, `uint64`
+ `float`, `double`
+ `char` #state/idea


#state/idea
### Type casting
+ explicit? `(int32)` or `as int32` or `to int32`
+ implicit? (not for now)
> What rules for casting?


#state/final   #confidence/high  #stability/stable 
![Operators](Current%20language%20spec.md#Operators)

+ prefix:
	+ logical not `!`
	+ bitwise not `~`
	+ unary minus `-`
+ arithmetic: `**` (exponent) #state/idea
+ bit shift: `<<`, `>>`, 
	+ `>>>` #state/idea
+ increment/decrement: `++`, `--` (pre and postfix)

### Combined assignement
In an assignment (`=`), you can also use an operator from one of the following categories:
+ logical
+ bitwise
+ arithmetic
+ bit shift? #state/idea

#state/final  #confidence/high #stability/stable
![Variables](Current%20language%20spec.md#Variables)
+ talk about shadowing?

+ de-structuring/multi variable declaration
	+ `var a,b,c,d = 1,2,3,4;` ? Or maybe only one right side value? Not sure what we want to allow, or when its going to be used. #state/idea 
	+ `const {a,b,c,d} = myStruct` => expands to `const a = myStruct.a; ...`. That way everything works as expected. #state/decided
	+ `const [a,b,c,d] = [1,2,3,4]` #state/decided 
	+ spread: `const [a,b,c,...rest] = array;` -> `rest` is a slice/view of the rest of the array. We might want to copy the array instead? Not sure of the details. #state/exploring 


#state/decided #confidence/high  #stability/stable 
![Control flow](Current%20language%20spec.md#Control%20flow)

+ Maybe loosen type checking so we allow ints and booleans in conditions? #state/idea
+ labels? only for loops? or for if so you can break out like javascript? #state/idea
+ `if` as expression (how do they return)? Or a special if for that? (I don't like rust returning the last line) #state/idea 


#state/decided #confidence/high  #stability/stable 
![Functions](Current%20language%20spec.md#Functions)

+ in scope (doesn't need closure as long as we don't use a function pointer to it) #state/decided 
+ closure (for real lambdas). Not sure what the closure syntax would be like. #state/decided
+ lambda notation: `(a:int32) => int32 {...}` Not sure about the syntax, or if we even need a special syntax for lambdas. Maybe just make function declarations as expressions. #state/idea 
+ hoisting. We want to hoist function declaration inside modules so we don't have to forward declare everything. I'm just not sure how to do it cleanly. #state/decided

#state/idea
### Function pointer
`var fn: () => void = myFunction`


#state/final  #confidence/high  #stability/stable 
## structs and arrays
+ `struct myStruct {a: <type>, b: <type>}`
+ will arrays track their own size? That way, it would be quite easy to guarantee some amount of memory safety (at least for arrays with a size known at compile time). Not a necessity for now to keep memory safety, but bundling the dynamic size of arrays with them would make it a lot simpler, and would mean we don't need to pass the size to all the functions. Static arrays will need to annotate their length so that the compiler can create the right instructions (to allocate memory on the stack) #state/wip 
	+ `var myArray: int32[5] = [1,2,3,0,0];`
	+ `var myArray: int32[] = [1,2,3]; // == {length: size_t, value: int32[length]}`

#state/idea
### Slices
+ window into an array. contains pointer and size (and max size if we allow them to grow)
+ maybe we would like 

#state/final #confidence/high #stability/stable
## Pointers
+ Pointers like C `function foo(myPointer: *Bar) {...}`
	+ I'm not sure about where to put the `*` (before or after the type), but it doesn't matter
+ point to any other types, including pointers.
+ dereference by using `*`, get the pointer to something with `&`

#state/decided  #confidence/high  #stability/temporary 
### Explicit null
+ pointers are not nullable by default. To be nullable you need to use something to say that the pointer is nullable.
	+ If we have not added unions, we will have a special symbol `*?` to say its nullable
	+ If we have unions, it will be written as `T | null`. Maybe we also keep the `*?` syntax. Might be useful.





#state/final  #confidence/high  #stability/stable 
## File import
+ `import { name } from "file"`
+ `export name`
Now, there is just one issue. How do we handle circular imports? Don't know, but I don't want to ever have to thing about the import order, so it should be done in a way that makes it really easy to manage, and with as little friction as possible.


#state/decided  #confidence/medium  #stability/temporary 
## Simple WASM import/export
+ `extern_import function print(x: int32)`
+ `extern_export function add() {<...>}`

At some point we'll want to import from a specific module (we'll start by importing everything from env) and rename imports and exports.
```
extern import fn log(i32) from "env"  
extern export fn add(...) as "add"
```



#stability/temporary 

![Built-in print](Current%20language%20spec.md#Built-in%20print)

