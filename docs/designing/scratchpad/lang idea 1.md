
What is the minimum set of features we need to make a statically typed language feel like its dynamic?
Can we make a statically type javascript?
How much inference can we have before it becomes a problem (while ignoring implementation detail/performance)


# What strength are we trying to get
1. fast iteration
2. handle weird inconsistent data structure
3. easy ad hoc polymorphism for function

4. still completely type safe, and mistakes in things like naming are caught fast and before runtime
# What are the best dynamic lang features
1. duck typing -> Code depends on behavior rather than declared type.
2. open object models -> you can easily add and remove fields, methods, change structure and behavior per instance
3. runtime reflexion
4. metaprogramming
	-  decorators
	- macros
	- monkey patching
	- dynamic method creation
	- runtime proxies
5. handles inconsistent data (ex json)
6. repl
7. DSL friendly / human readable interfaces
8. hot reloading

# What we will focus on
+ duck typing + open object model + inconsistent data: fairly easy I think
+ open object model + runtime reflexion
+ reassign variables


---
# What feature do we want?
## Variables
+ `var` or `const` (var can be reassigned)
+ type inference, but can be given a type for type checking against.
+ easy way to update the type of a variable as you go, and ways to make a variable not able to change type (or to bound it). I might break type safety if your int becomes a float mid way, but it might be something nice to have/do
+ de-structure nested objects and arrays into variables for easy use. (each could be made var or const as needed)

## Memory layout
+ static size with dynamic position (unordered) (struct)
+ dynamic size with fixed position (ordered) (array)
+ struct with static position (for ABI)
+ easy way to index into struct, and label array value (label == fixed index)
+ slices that can represent part/a ref of another memory layout (2 types: size + \*data, size + capacity + \*data)
+ inheritance? Or only composition is possible? Maybe shorthands would make it bearable?
+ easy way to handle nullable fields (?.a, ?\[1\])

## Type manipulation
+ add constraints on types (ex: int >= 0)
+ update a type def with a new def (override a type, or just create a type from another type)
+ `using x` to pull in type def in a context, and `not using x` to invert that?
+ type that is only partial/an interface (ex {a: Foo, b: Bar, <>} means any struct that has those fields is accepted)
+ sum types are very easy to do, and we encode invariants from the constraint system into it, so we can have type info a runtime
+ implicit/inferred type

## Functions
+ Functions as first class citizens
+ You can create nested functions everywhere, like javascript, and pass them around.
+ Closure: not sure how it would work, but it would be auto by default, until you define it? You would need to create a function/closure/lambda object when passing that function somewhere, and the object would have a type inferred from the function def, and it would automatically try to create it from the variables in the context.
+ Callable object? That might be a nice abstraction to handle closures? Create an object and pass it as the closure. that is what js does I think.

## Other
+ We might be able to have like hot reload and repl and stuff like that by having every feature have a default path that is slower, but can be overridden at runtime to add more to the language. Like if we call a function with a new type, it can just handle it by calling a default handler that can handle that new type that wasn't compiled in. we can then swap that handler to handle new types as they comme, adding to the program without needing to stop it.
```
f(x) {
	if (typeof x == ...) {} else { defaultHandler(x) }}
defaultHandler(x) { if (typeof x == SomethingNew) {handleSomethingNew(x)}})
```

+ `||`, `&&` and `??`
# Design
I think we have a nice enough set of feature for now. Lets try to put them together.
```
type Foo = {
	a: int;
	b: float;
	c: int[];
	d: int[5];
	// slice? [cap, length]?
	// e: int[6:5];
	f: {int, int, float, name: string}; // annonymous fields
	
	
}




var A = "";

if A == "" {A = :<int>0};

typeof A == int;

```


Use case:
snake

I think we can make it into the first usefull program to compile. it would be called like this in ts.
```ts
import * as fs from "node:fs";

async function run() {
	const binary = fs.readFileSync("snake.wasm");

	const instance = await WebAssembly.instantiate(binary, {
			env: {
				print: console.log;
			}
		}
	)

	const exports = instance.exports as {
		init: () => void;
		tick: () => void;
		handleInput: (key: number) => void;
	};
	
	exports.init();
	
	//TODO tick
	
	process.stdin.setRawMode(true);
	process.stdin.resume();
	process.stdin.setEncoding("utf8");
	  
	console.log("Press keys. Ctrl+C to exit.");
	  
	process.stdin.on("data", (key: string) => {
		// Ctrl+C
		if (key === "\u0003") {
			process.exit();
		}
		  
		// Pass first character code into WASM  
		exports.handleInput(key.charCodeAt(0));
	});
}

run().catch(console.error);
```

```crow
const STARTING_BOARD_WIDTH = 42;
const STARTING_BOARD_HEIGHT = 42;
const STARTING_NB_FOOD = 5;
const GROWTH_PER_FOOD = 2;
const TICK_RATE = 120ms;

type Position<width: int, height: int> = {
	x: int & 0 <= $ & $ < width;
	y: int & 0 <= $ & $ < height;
}

enum Key {
	Up = 0x77; // w
	Left = 0x61; // a
	Down = 0x73; // s
	Right = 0x64; // d
}

enum Direction {
	Up,
	Down,
	Left,
	Right
},

enum Cell {
	Empty,
	Food,
	...Direction,
	Head
}

type Direction = Cell.Direction;

type Board<w: int & $ >= 1,h: int & $ >= 1> = {
	width: w;
	height: h;
	data: Cell[this.width][this.height];
	nbFoodAlive: int & $ >= 0;
	targetNbFoodAlive: int & $ > 0;
}

type Snake<w,h> = {
	head: Position<w,h>;
	tail: Position<w,h>;
	direction: Direction;
	isAlive: bool = true;
	length: int & $ > 0;
	grow: int & $ >= 0;
}

type Game<w,h> = {
	board: Board<w,h>;
	snake: Snake<board.width,board.height>;
	score: int & $ >= 0;
	// tickRate: int & $ > 0 & ms;
}

// ---- Board helpers ----
fn getCell(board, position) {
	return board.data[position.x][position.y];
}

fn setCell(board, position, value) {
	board.data[position.x][position.y] = value;
}

fn nextPosition<w,h>(board: Board, position: Position<w,h>) -> Position? {
	const direction = board[position.x][position.y];
	
	const x, y = match (direction) {
		case Direction.Up: position.x, position.y - 1;
		case Direction.Down: position.x, position.y + 1;
		case Direction.Left: position.x - 1, position.y;
		case Direction.Right: position.x + 1, position.y;
	}
	
	if (x < 0 || y < 0 || x >= w || y >= h) {
		return null;
	}
	
	return {x, y}
}

// ---- init ----
fn initGame() {
	var board = Board{
		width = STARTING_BOARD_WIDTH;
		height = STARTING_BOARD_HEIGHT;
		targetNbFoodAlive = STARTING_NB_FOOD;
	}
	
	var snake = initSnake(board);
	
	var game = Game{
		board;
		snake;
		// tickRate = 120ms;
	}
	
	spawnFood(game);

	return game;
}

fn initSnake<w,h>(board) {
	var tailPosition = Position<w,h>{
		// makes sure that we aren't spawning on the border
		x = floor((rand() * w - 4) + 2);
		y = floor((rand() * h - 4) + 2);
	}
	var direction = Direction[floor(rand() * 4)];
	
	setCell(board, tailPosition, direction);
	var headPosition = nextPosition(board, tailPosition);
	setCell(board, headPosition, direction);

	return Snake{
		head = headPosition;
		tail = tailPosition;
		length = 2;
	}
}

// ---- tick ----
fn tick() {
	const board = game.board;
	const snake = game.snake;
	
	if (!snake.isAlive) {
		return;
	}
	
	// move tail first
	if (snake.grow == 0) {
		const {x,y} = snake.tail;
		snake.tail = nextPosition(board, tail);
		setCell(board, {x,y}, Cell.Empty);
	} else {
		snake.length++;
		snake.grow--;
	}
	
	// move head
	const newHead = nextPosition(board, snake.head);
	
	if (board.data[newHead.x][newHead.y] == Cell.Food]) {
		game.score++;
		snake.grow++;
	
		setCell(board, newHead, Cell.Head);
		setCell(board, snake.head, snake.direction);
		snake.head = newHead;
	} else if (game.board.data[newHead.x][newHead.y] == Cell.Empty) {
		setCell(board, newHead, Cell.Head);
		setCell(board, snake.head, snake.direction);
		snake.head = newHead;
	}
	
}

fn spawnFood(board: Board) {
	if board.nbFoodAlive >= board.targetNbFoodAlive {  
		return;
	}
	
	var chosen = null;
	var seen = 0;
	
	for (var x of range(0, board.width)) {
		for (var y of range(0, board.height)) {
			if (getCell(board. {x,y}) == Cell.Empty) {
				seen++;
				if (floor(rand() * seen - 1) == 0) {
					setCell(board, {x,y}, Cell.Food);
					board.nbFoodAlive++;
					return;
				}
			}
		}
	}
}

// ---- Render ----
fn render(game: Game) {
	fn getTile(cell: Cell) {
		return match (direction) {
			case Cell.Up: "∧";
			case Cell.Down: "∨";
			case Cell.Left: "<";
			case Cell.Right: ">";
			case Cell.Head: "@";
			case Cell.Empty: ".";
			case Cell.Food: "O";
		}
	}

	print(`Score: ${game.score}`);
	
	for (var x of range(0, game.board.width)) {
		for (var y of range(0, game.goard.height)) {
			print(getTile(getCell(bame.board, {x,y}));
		}
		print("\n")
	}
	
	if !game.snake.isAlive {  
		print("Game Over\n");  
	}
}

extern fn handleInput(key: int32) {
	fn getNewDirection(oldDirection: Direction, newDirection: Direction) {
		if (oldDirection == Direction.Up && newDirection == Direction.Down) {
			return oldDirection;
		}
		if (oldDirection == Direction.Down && newDirection == Direction.Up) {
			return oldDirection;
		}
		if (oldDirection == Direction.Left && newDirection == Direction.Right) {
			return oldDirection;
		}
		if (oldDirection == Direction.Right && newDirection == Direction.Left) {
			return oldDirection;
		}
		
		return newDirection;
	}
	
	fn getInputDirection(key: Key) {
		return match (key) {
			case Key.Up: return Direction.Up;
			case Key.Down: return Direction.Down;
			case Key.Left: return Direction.Left;
			case Key.Right: return Direction.Right;
		}
	}
	
	if (game) {
		game.snake.direction = getNewDirection(
			getCell(game.board, game.snake.head),
			getInputDirection(key)
		);
	}
}

var game = null;
extern fn init() {
	game = initGame();
}

extern fn tick() {
	if (game) {
		step(game)
		render(game)
	}
}
```

How do we do pointers now?

This feels good enough. I think its the right direction. But I don't like generics. They dont feel like they fit. Generics are a way to say `this type is like this` from the calling context, so if we want generics to depend on other values, we need generics that depends on context?
It feels like a similar problem to group borrowing, maybe. There might be a good idea there?


Lets start with a language that doesn't do:
+ Memory safety (index bounds and lifetime)
+ Dependent types (for indexes at least). It adds too much complexity and makes things too hard to design.

```crow

type SomeStruct = {
	a: int;
	b: float;
}

type SomeArray = int[];

// structs and tuples aren't different. you can index a struct if you want.
type Tuple = SomeStruct;
var t = Tuple();
t[0] == t.a;
t[1] == t.b;
var [a,b] = t;
//? not sure. Maybe add a way to alias/rename
{b,a} = t;

//? how does combining an array (open object) and a struct (closed object) work? Do we keep the open-handedness or do we try to close the object? doe we need `...[]` at the end of the struct to make it into an open object? Might be the cleaner solution.
// Arrays are unbounded. If we used `{}` like a struct, it would close the type.
// We might want a better way to do positional aliasing, like @6, or something like that.
type ArrayWithPositionShortcuts = SomeArray & [first, ...[5], seventh];

// init with default values (zeroed if not set)
var myStruct: SomeStruct = {};
var arr: ArrayWithPositionShortcuts = [];

myStruct = SomeStruct(a = 5);

type InitStruct = {a: int};

// You can pass in a struct, and every field of that struct (that matches? or everything and ignore incompatible? Not sure.) is mapped to the new struct.
myStruct = SomeStruct(InitStruct(5));
myStruct = SomeStruct({b = 8.2});
// creates a new instance
myStruct = {...myStruct, b = 8.2};
//? shortcut to update the struct in place? Like constructor but in place.
var value = {a: 4, b: 4.4};
myStruct.a = value.a;
myStruct.b = value.b;

type ArrayWithLength = int[5];
//? not sure about the shorthand `_` for `any` or something similar. With less sugar: `ArrayWithPositionShortcuts & int[24]`;
type CustomArrayWithLength24 = ArrayWithPositionShortcuts & _[24];


type TypeInfered = {foo, bar};
// foo and bar don't have a type until the struct is used, and then we infer the type from the usage. If its used in combination with another type (with `&`), we can better infer the types.
// Quite usefull if we want containers that are agnostic to the type of their value.
var fooBar: TypeInfered = {foo: myStruct, bar: "Joe Mama"};


var x: infer = 8; // x: int;
x = ""; // x: string;
// x: int | string
if (typeof(x) == int) {
	
}

var nullable: SomeStruct? = null;
var x = nullable?.a;

// not sure about structs being fixed size and arrays being any size. It doesn't seem like it works with inference/making a generic struct interface.

//? enums?
// Not sure, doesn't feel like it fits the rest of the language.
type myEnum = enum {
	value1;
	value2;
}

//? slices
//? Nope, I don't like this idea. Scrap it. We don't want to do bounds checking for now. Mayber later.
// type MySlice = int[5:]; // slice with size 5
// type MyVec = int[:5]; // slice with cap 5


//? pointers?
// start with raw c like pointers, we'll add better memory management options later
var a: *int = &fooBar.foo.a;
//? Maybe we can use @ when we have a value that refers to another piece of data, like with slices. (int@[])

//? for of

//? partial function application?
//? closures?

function getSize() -> {x: int, y: int} : {}

var {y,...rest} = getSize();

//? constraints?

//? generics?
//? how can we say `this type is the same as this other type`, like you can with generics? Ex: `type ArrWithElem<T> = {elem: T, arr: T[]}`. I don't really like generics, but I don't see any other way. Maybe having a concep of context, that is like a way to specify those generics? Not sure

//? Add nominal parts to it? I will need a way to prevent the structural types to just make weird things possible. But we'll figure it out when we get to it. We can just have an explicit brand or something like that that we can use to say "this is only compatible to type that explicitelly do this". Or it could just be with traits. Ex: ID could be an int, but ints in general need to be cast to it to work.

// methods
//? not sure if we'll have something like that. For now, use a function pointer in a struct, and if the method is static, use something like `::myMethod()`?
//? Not even sure if or how we'll do traits.



```
















---
syntax doesn't matter, what matters is what syntax says about how the languages is made/thought about. Ex: if you have one way to create structs and arrays vs 2 different ways, it signals that the language will treat them similarly or not.



can we encode transaction semantics in the type system?


