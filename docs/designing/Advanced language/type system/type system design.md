
1. sum type/tagged union (https://en.wikipedia.org/wiki/Tagged_union)
	fairly simple to add. The only question is how to pattern match it in a clean and easy way.

2. polymorphism (function/operator overloading, generics, Subtyping/interfaces)
	https://en.wikipedia.org/wiki/Polymorphism_(computer_science)
3. Refinement types (https://arxiv.org/pdf/2010.07763)
	Refine types so that we know as much as possible about them.
	I don't know how much we can go deep here before it gets impossible to use.
	I think we can express refinements as just conditions on the values, like: `x > 0`, `x between [0,5[`
	1. With refinement types, we should probably have an easy way to evaluate those conditions and create runtime code that checks conditions (like doing `if (x is >0)` or `if (x is not negative)`). Being able to easily create runtime conditions from refinement types could be quite useful I think.
4. ? dependent types?
	Maybe a reduced form of dependent types could be useful.
	We don't have to make them dependent on everything, we can choose what makes sense.
5. typestate (https://swiftology.io/articles/typestate/)
	"the state of an object is encoded in its type, and transitions between states are reflected in the type system" https://swiftology.io/articles/typestate/
	Type state could be a refinement/dependent type that doesn't have a strict runtime anchor. It would be completely handled in the type system at compile time
	affine/linear values can probably be represented by typestate

6. ownership and lifetime tracking
	How the fuck are going to do that?
7. ? effects system/track purity?
	Tracking effects might be useful if we want to generalize into any platform. We would be able to use functions that don't use IO for example, in a module that still does.





Borrowing:
[group borrowing](group%20borrowing.md)


could be worth looking into:
https://ryanbrewer.dev/posts/safe-mmm-with-coeffects/
https://tutorial.ponylang.io/reference-capabilities/reference-capabilities


[https://articles.luminalang.com/a/micropass-inference/](https://articles.luminalang.com/a/micropass-inference/ "https://articles.luminalang.com/a/micropass-inference/")

---


Do we do intersection types? Or something different? Not sure that intersection types would work well with the data layout. Maybe for interfaces.



sentinel values


we could use `::` for accessing stuff ont the type itself?


```
fn foo(x: &File, y: &File) {
	close(x)
	close(y)
}

foo(f, f)

struct Pair {
	a: &File,
	b: &File
}
```
