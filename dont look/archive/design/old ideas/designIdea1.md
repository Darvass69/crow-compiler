# Type system design
The issue: a type system based on union and intersection is hard to manipulate effectively, but its also the best way to understand types.

We also have the issue of separating comptime and runtime, and defining relationships between parts of the same type (ex: size of array). And how can we have more complex conditions and relations? Like instead of a bool splitting int 2 types, a int between 4 or something more complex.

We have like 3 parts to the type system:
1. structs: memory layout, should be explicit


## Trying something

```
type myType = {a: int} :: {b: int} :: {c: () => void} :: {d(): void} :: $isValid: bool /* type state */
  :: {check(): bool >> self :: $isValid}

function doSomething(value: myType & $isValid == true) {...}

var myVar = new myType();
doSomething(myVar) // error
if (myVar.check()) {
  doSomething(myVar)
} else {

}



type Lock = $lockAcquired: bool :: {getLock(): bool >> self::$lockAcquired , release(): bool >> self::$lockAcquired }

var lock = new Lock();

if (lock.getLock()) {
  lock::$lockAcquired == true
}


//! This doesn't work (it could but its confusing), but its on the right track
type Matrix<T <: any>(Row: int32, Col: int32) = {
  data: T[Row * Col];
  rows = Row;
  cols = Col;
}

type Matrix<T <: any>{Row: int32, Col: int32} = {
// we could then mark them as comptime optional so that the compiler is allowed to simplify them? Or no need for that, we just let the compiler do its things.
  const rows = Row;
  const cols = Col;
  data: T[self::rows * self::cols]
}

function matMul{R1, C1, C2}(a: Matrix{R1,C1}, b: Matrix{C1,C2}): Matrix{R1,C2} {
  var result = Matrix{R1, C2} {
    data = allocate(R1 * C2)
  }

  // compute multiplication...

  return result
}

function matmul_dynamic(a: Matrix, b: Matrix) -> Matrix {
  match (a, b) {
    (x, y) if x.cols == y.rows => {
      return matMul{x.rows, x.cols, y.cols}(a, b);
    }

    _ => {
      error("Incompatible matrix sizes")
    }
  }
}


type Array<T>{n: int32} = {
  comptime? const length = n;
  $: bytes<size<T> * self::length>; // Or something like that to say that its n bytes of memory. $ is like alias for "" or something like that, this is just an example thing for array which will be a fundamental type of the language, so its not meant to all make sense.

  get(i: int & i < self::length): T {
    return self[size<T> * i];
  }

  set(i: int & i < self::length, value: T) {
    self[size<T> * i] = value;
  }

  map<T2>(callback: (value: T, index: int & Range<0, n>, array: self) -> T2): Array<T2> {...}
}


```





T <: UpperBound means type T must be a subtype of UpperBound
T >: LowerBound means type T must be a supertype of LowerBound


our unions are more like sum types (discriminated union)



## I think we are close
Intersection as "facts" that are tacked on, like typestate

:: for namespace/type variants
*? for nullable pointer? or ? after type?


```
enum TokenType {
	Add,
	Sub,
	Identifier,
}

type Token = {
  type: TokenType,
  value: string
}

type IdentifierToken = Token where self.type == TokenType.Identifier; // more like code
type IdentifierToken = Token :& {type: TokenType.Identifier} ; // more like a set

```

```
// not sure about syntax
function<Handler> numberHandler(source: *SourceData, position: number): *?Token => {
  function getDigits() {
		//? string builder
		//? memory. this needs to be a pointer, and copied. Or we could have something nicer for patterns like this.
    var digits = "";

    var current: char;
    while ((current = source.get(position)) != SourceData::NO_CHAR) {
      if ('0' <= current && current <= '9') {
        digits += toString(current);
      } else {
        break;
      }
      position++;
    }
    return digits;
  }

  const integerPart = getDigits();
  var value = integerPart;

  if (value.length === 0) {
    return null;
  }

  if (source.get(position) == DECIMAL_SEPARATOR) {
    position += DECIMAL_SEPARATOR.length();
    value += DECIMAL_SEPARATOR;

    const decimalPart = getDigits();
    value += decimalPart;
  }

  return Token{ type: TokenType.Number, value };
}
```

type variants?
```
// thread lock
type LockedValue<T> = {
  value: T
  locked: bool
}

type LockedValue<T>::Locked = self :& self.locked == true;

```

extract/map?
it doesn't work and its really awful to do, we need a better way.
Type level functions? And data structures?
```
enum Type {
  ...
}

type NodeBase<T <: Type> = {
  type: Type;
}

//~ kind of not a clean way to do it. We need something better.
type Node<T <: Type> = NodeBase<T> :& Fields<Type> |> match type {
  (Type.Module): return { body: Statement[] };
}


type Statement = Node |> () 



```


operators?
  <:
  :>
  :=

  :/
  /:
  ~>
  <~
  !:

  ::
  where
  |?
  @
  |>
  |:
  #
  ~
  ?
  <>
  >< (overlap?)
  <=>
  <-<
  >->
  ->>
  <<-

  !~ (not match)
  =?
  ~= (approx)
  ==? (soft equality?)
  



```
// ad-hoc struct
//? Would it still be a good pattern?
const RESERVED_SYMBOLS = {
  "true": TokenType.Boolean,
  "false": TokenType.Boolean,

  "+": TokenType.Add,
  "-": TokenType.Sub,
  "*": TokenType.Multiply,
  "/": TokenType.Divide,
  "%": TokenType.Modulo,

  "|": TokenType.BitwiseOr,
  "^": TokenType.BitwiseXor,
  "&": TokenType.BitwiseAnd,

  "=": TokenType.Assignment,
  "var": TokenType.Var,

  "(": TokenType.OpenParen,
  ")": TokenType.CloseParen,

  ";": TokenType.EndOfStatement,

  "print": TokenType.Print,
};

//? Meta programming. we need to get the keys that will get compiled away
export const orderedSymbols: [string, TokenType][] = {{META}: keys(RESERVED_SYMBOLS).map((k) => [k, RESERVED_SYMBOLS[k]])}
	.sort((a, b) => b[0].length - a[0].length);

```

```
type NodeShapes = {
	[Type.Module]: { body: Statement[] };

	[Type.ExpressionStatement]: { expression: Expression };
	[Type.VariableDeclarationStatement]: { identifiers: Node<Type.IdentifierExpression>; init?: Expression };
	[Type.PrintStatement]: { expression: Expression };

	[Type.BinaryExpression]: {
		left: Expression;
		operator: Token; //TODO specify what token can be here
		right: Expression;
	};

	[Type.BooleanExpression]: {
		value: string;
	};
	[Type.NumberExpression]: {
		value: string;
	};
	[Type.IdentifierExpression]: {
		name: string;
	};
};

type NodeMap = {
	[K in keyof NodeShapes]: { type: K } & NodeShapes[K];
};

export type Node<T extends keyof NodeMap = keyof NodeMap> = NodeMap[T];

export type Statement = Extract<
	Node,
	{
		type:
			| Type.ExpressionStatement
			| Type.VariableDeclarationStatement
			| Type.PrintStatement;
	}
>;

export type Expression = Extract<
	Node,
	{
		type:
			| Type.BinaryExpression
			| Type.BooleanExpression
			| Type.NumberExpression
			| Type.IdentifierExpression;
	}
>;

export function createNode<T extends Node["type"]>(
	type: T,
	properties: NodeShapes[T],
) {
	return {
		type,
		...properties,
	};
}
```



## Matrix multiplication
from gpt, mostly ok, I want to do it differently though
```lang
struct Matrix {
  data: []float
  rows: int
  cols: int
}

type MatrixType<R, C> =
  Matrix & (
    self.rows == R &
    self.cols == C &
    len(self.data) == R * C
  )

fn matmul<R1, C1, C2>(
  a: MatrixType<R1, C1>,
  b: MatrixType<C1, C2>
) -> MatrixType<R1, C2>
{
  // no need to check sizes — already guaranteed

  let result = Matrix {
    rows = a.rows,
    cols = b.cols,
    data = allocate(R1 * C2)
  }

  // compute multiplication...

  return result
}

fn matmul_dynamic(a: Matrix, b: Matrix) -> Matrix {
  match (a, b) {
    (x, y) if x.cols == y.rows => {
      // inside this branch:
      // x : Matrix & (cols == y.rows)
      // y : Matrix & (rows == x.cols)

      let r = Matrix {
        rows = x.rows,
        cols = y.cols,
        data = allocate(x.rows * y.cols)
      }

      return r
    }

    _ =>
      error("Incompatible matrix sizes")
  }
}

comptime fn MatMulType(A: Type, B: Type) -> Type =
  match (A, B) {
    (MatrixType<R1, C1>, MatrixType<R2, C2>) if C1 == R2 =>
      MatrixType<R1, C2>

    _ =>
      error("Matrix dimensions incompatible")
  }

type C = MatMulType<typeof(a), typeof(b)>
```
