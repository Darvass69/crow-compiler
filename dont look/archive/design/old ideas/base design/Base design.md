This is a design of the features of the language, not the syntax. None of this syntax is good, but it can express what we need to express for the language to do what we want. Its purpose is to make sure that the concepts work well together and that there is minimal overlap between systems.
The syntax is thus very explicit and 

## Features: 
[[Base features]]

+ [x] define a memory layout
+ [ ] add behavior (methods, static and dynamic) to a memory type
+ [x] add restrictions (intersection types, conditions relative to runtime value (ex list length)) to memory layout and behavior
+ [ ] combine multiple memory layouts together (union) and be able to identify which one it is (mapped)
+ [x] track state of memory layout a compile time (type state)
+ [ ] use a generic/abstracted representation of some memory layout when we don't need to know exact implementation (interface, generics, other forms of polymorphism)

+ [ ] define who owns allocated memory, and who is responsible to deallocate it when not used anymore (track ownership) (memory layouts cleans up the memory they are responsible for when they are deallocated/destroyed).
+ [ ] define who can mutate which part of the memory and if it has complete control over it or if its shared (shared is for multithreading)
+ [ ] transfer ownership/responsibility from a type to another (move, copy, borrow)
+ [ ] mark some values as not able to be copied (or moved?)
+ [ ] consume values and make them invalid/uninitialized after being used
+ [ ] <font color="#0070c0">? do we need lifetime tracking?</font>
+ [ ] <font color="#ffff00">aliasing constraints tracking</font>
	 (<font color="#ffff00">when having a reference/pointer to something, we need to specify what constraints need to keep being true while we are holding the ref)</font>
	+ <font color="#ffff00">unique vs shared</font>
	+ <font color="#ffff00">rules for shared + mutable</font>
	+ <font color="#ffff00">relationships between values (2 values/ref may alias, these 2 are guaranteed to be distinct)</font>
	+ <font color="#ffff00">scope may change exclusivity (shared global, temporarily exclusive in a scope)</font>

+ [ ] <font color="#ffff00">some pointers may not have guaranteed location stability (like pointers to a std::vector), the type needs to reflect that.</font>
	+ Do we need a way to tell the values inside the std::vector that they are not allowed to move or they break reference? (kind of the opposite idea, like we say `I have a pointer to this, don't move it`)

+ [ ]  <font color="#0070c0">? A memory layout can define how it is created (ctor) (and how it can't be? (disallow specific ctors? or default init?))</font>
+ [ ] <font color="#0070c0">or just track each field of the struct. until its completely initialized, it can't be used like its initialized</font>
	.<font color="#0070c0">and make static methods to create it</font>

+ [ ] <font color="#ffff00">a memory layout can be cast to another (unsafe and lossy explicit cast)</font>

+ [ ] <font color="#ffff00">a function's return type can be dependent on its input types (needs to interact with the rest of the type system)</font>
	+ ex: size of result is dictated by input value

+ [ ] <font color="#ffff00"> there is a difference between mutating a value (within its type) and mutating a value's type (mutating to a new type). functions need to keep track of both</font>
	- mutation (within type) can be considered mutating a value's type from T to T' so we don't need an extra feature just for that

+ [ ] <font color="#ffff00">a function can make and remove promises/guarantees (like that something is const or not)</font>
	+ Those guarantees are propagated through functions that call them, so that we don't silently remove a guarantee

+ [ ] <font color="#ffff00">types can be narrowed to specific values (like a specific string or number)</font>





# Design/first syntax

memory layout:
```
type MyStruct = struct{
	//? Is it a pointer?
	a: string;
	b: int32;
} where (
	Self.b >= 0;
	Self.a.length == Self.b;
);

type MyOtherStruct = struct{
	a: string;
	lock: Mutex;
	value: int32;
} states (
	::aquired: where (Mutex::aquired)
	::released: where (!Mutex::aquired)
);

type MyUnion = MyStruct where (Self.a: "MyStruct") | MyOtherStruct where (Self.a: "MyOtherStruct") on Self.a;

type Foo = {
	// owned (when Foo is deallocated, Bar is also deallocated)
	owned: own *Bar;
	
	//shared: share *Bar;
	
	//always const by default? Or only pointers are const?
	mutable: mut *Bar;
}

type Bar = {
	
}


```


















Atomics:
atomic_load
atomic_store
compare_exchange (CAS)
fetch_add
exchange

memory ordering

## Demo
A CSV processor

```
type string<len: int> = {
	//? how do we differentiate static and dynamic arrays?
	// I think its just if len is know at comp time, its static, else its dynamic
	// Do you need to explicitelly mark it as dynamic? Or infered? Or unkown?
	char[]<len = len>;
}

---
//Not sure about comp time type manipulation
type CSV<Schema: Type[]> = {

} states {
	|:Raw
	|:Indexed
	|:Parsed
	|:Validated
}



//TODO does the lifetime of text extends past the function?
function read_csv<Schema>(text: string) -> CSV<Schema> |: Raw





function main() {
	//type infered to be const string
	const input =
		"email,id,active,age\n" +
		"alice@example.com,1,true,17\n" +
		"\"bob@site.org\",2,false,21\n"
	
	
	
}
```







---
## Example 1
**Scenario**
A **job system + resource manager**:
- Jobs reference shared resources
- Some resources are movable (vector-backed), others pinned
- Jobs transition through states
- Ownership of buffers moves across stages
- Aliasing rules must be respected

```ts
type Buffer = struct {
	data: *uint8;
	len: int32;
	capacity: int32;
} where (
	Self.len <= Self.capacity;
);

//TODO meh, not clean at all
type StableBuffer = Buffer where (
    Self.data is stable;
);
type MovableBuffer = Buffer where (
    Self.data is not_stable;
);

//TODO not exactly right, we might want to explicitelly add Self.kind as a string?
type Resource =
    StableBuffer where (Self.kind: "stable") |
    MovableBuffer where (Self.kind: "movable")
on Self.kind;



type Job = struct {
    input: own *Buffer;
    output: own *Buffer;
    resource: share *Resource;
    next: *Job;
} states (
    ::created: where (Self.output == null)
    ::running: where (Self.output != null)
    ::finished: where (Self.output != null)
);

type Scheduler = struct {
    jobs: *Job;
    resource_pool: *Resource;
    lock: Mutex;
} states (
    ::locked: where (Mutex::acquired)
    ::unlocked: where (!Mutex::acquired)
);

function create_job(input: own *Buffer, res: share *Resource) -> Job::created {
    return Job{
        input = input,
        output = null,
        resource = res,
        next = null
    };
}

function start_job(mut job: Job::created) -> Job::running {
    job.output = alloc_buffer(job.input.len);
    return job as Job::running;
}

function process(
    job: mut Job::running,
    temp: &mut Buffer,
    res: &Resource
) where (
    temp != job.input;
    temp != job.output;
) {
    // multiple mutable references but guaranteed non-aliasing
}

```

## Example 2

```rust
import * from "std/io";
import * from "std/memory";
import * from "std/string";
import * from "std/hashmap";

enum CacheValueTag {
	int,
	text,
};

//TODO not quite how I want to make unions. Fells a bit awkward. `where` should not be able to add to the memory layout I think. (feels like it's not its responsability)
//TODO tag should be an enum in this case (because we know what values are present at comptime, but it should also work with strings)
type CacheValue = IntValue | TextValue on {tag: CacheValueTag};

type IntValue = struct {
	tag: CacheValueTag.int
    value: i64;
};

type TextValue = struct {
	tag: CacheValueTag.text
	//TODO are strings pointers to string/is it a string view? To a char[]?
	//TODO Is it a slice? How do we do arrays? How should we do them in a way that is memory safe (and typestate/dependent types for array length)?
	//TODO string should be a pointer
    text: own *String;
};

type Entry = struct {
    key: own *String;
    value: own CacheValue;

    prev: *?Entry = null;
    next: *?Entry = null;
} where (  
	Self.prev == null || Self.prev.next == Self;
	Self.next == null || Self.next.prev == Self;
);

type LruCache = struct {
    capacity: usize = 0;
    len: usize = 0;

    head: *?Entry = null;
    tail: *?Entry = null;

    // The map stores live entries, never null.  
	// Lookup returns nullable because a key may be missing.
	//TODO do you really need to specify that a hash map takes in a string as a key?
    index: HashMap<*String, *Entry>;
} where (
	//TODO len should not even have to be in the struct, we could just alias index.len to .len.
	Self.len <= Self.capacity;
	Self.index.size == Self.len;
	//TODO I think doing <=> is right?
	(Self.len == 0) <=> (Self.head == null);
	(Self.len == 0) <=> (Self.tail == null);
) states {
	// I have no idea what these do
	::ready,
	::consistent
};

fn make_int(v: i64) -> own CacheValue {
	let x: own IntValue = make(IntValue) {  
		value = v;
	};
    return x;
}

fn make_text(s: own *String) -> own CacheValue {
    let x: own TextValue = make(TextValue){  
		text = s;
	};
    return x;
}

fn value_print(v: *CacheValue) -> void {
	match v.tag {
		CacheValueTag.int => {
			let i: *IntValue = v;
			io.print_i64(i.value);
		}
	
		CacheValueTag.text => {
			let t: *TextValue = v;
			io.print_str(t.text);
		}
	}
}

fn value_destroy(v: own *CacheValue) -> void effects (  
	v :: $invalid;
) {
	delete(v);
}

fn entry_new(key: own String, value: own CacheValue) -> own *Entry {
    let e: own *Entry = make(Entry){
	    key = key,
	    value = value
    };
    return e;
}

fn entry_destroy(e: own *Entry) -> void effects (  
	e :: $invalid;
) {
	delete(e);
}

fn lru_unlink(cache: *LruCache::$mutable, e: *Entry::$mutable) -> void effects (  
	cache.head;
	cache.tail;
	e.prev;
	e.next;
	e.prev == null;
	e.next == null;
) {
	//This breaks conditions:
	// Self.prev == null || Self.prev.next == Self;
	// Self.next == null || Self.next.prev == Self;
	if (e.prev != null) {
		e.prev.next = e.next;
	} else {
		cache.head = e.next;
	}
	  
	if (e.next != null) {
		e.next.prev = e.prev;
	} else {
		cache.tail = e.prev;
	}

	e.prev = null;
	e.next = null;
}

//-------------

fn lru_link_front(cache: *LruCache::$mutable, e: *Entry::$mutable) -> void effects (
	cache.head;
	cache.tail;
	e.prev;
	e.next;
	e.prev == null;
) {  
	e.prev = null;
	e.next = cache.head;

	if (cache.head != null) {
		cache.head.prev = e;
	} else {
		cache.tail = e;
	}

	cache.head = e;
}

fn lru_touch(cache: *LruCache::writable, e: *Entry::alive) -> void {
    if (cache.head == e) {
        return;
    }

    lru_unlink(cache, e);
    lru_link_front(cache, e);
}

fn cache_create(capacity: usize) -> own *LruCache::ready {
    let c: own *LruCache::ready = alloc(LruCache);
    c.capacity = capacity;
    c.len = 0;
    c.head = null;
    c.tail = null;
    c.index = HashMap::new();
    return c;
}

fn cache_evict_tail(cache: *LruCache::writable) -> void {
    if (cache.tail == null) {
        return;
    }

    let victim: *Entry::alive = cache.tail;

    // remove aliases before destruction
    cache.index.delete(victim.key);
    lru_unlink(cache, victim);
    cache.len -= 1;

    entry_destroy(victim);
    // postcondition: victim and victim.key / victim.value are dead
}

fn cache_clear(cache: *LruCache::writable) -> void {
    let cur: *Entry::alive = cache.head;

    while (cur != null) {
        let next: *Entry::alive = cur.next;

        cache.index.delete(cur.key);
        entry_destroy(cur);

        cur = next;
    }

    cache.head = null;
    cache.tail = null;
    cache.len = 0;
}

fn cache_destroy(cache: own *LruCache::ready) -> void
effects (
    cache :: dead;
) {
    cache_clear(cache);
    cache.index.destroy();
    dealloc(cache);
}

fn cache_peek(cache: *LruCache::readable, key: String::readable) -> *CacheValue::readable {
    let e: *Entry::alive = cache.index.get(key);
    if (e == null) {
        return null;
    }
    return e.value;
}

fn cache_get(cache: *LruCache::writable, key: String::readable) -> *CacheValue::readable {
    let e: *Entry::alive = cache.index.get(key);
    if (e == null) {
        return null;
    }

    lru_touch(cache, e);
    return e.value;
}

fn cache_put(cache: *LruCache::writable, key: own String::alive, value: own CacheValue::alive) -> void {
    let existing: *Entry::alive = cache.index.get(key);

    if (existing != null) {
        // replace value in place; the old value dies here
        value_destroy(existing.value);
        existing.value = value;

        // incoming key was only used for lookup
        dealloc(key);

        lru_touch(cache, existing);
        return;
    }

    if (cache.len == cache.capacity) {
        cache_evict_tail(cache);
    }

    let e: own *Entry::alive = entry_new(key, value);
    cache.index.set(e.key, e);
    lru_link_front(cache, e);
    cache.len += 1;
}

fn cache_remove(cache: *LruCache::writable, key: String::readable) -> bool {
    let e: *Entry::alive = cache.index.get(key);
    if (e == null) {
        return false;
    }

    cache.index.delete(key);
    lru_unlink(cache, e);
    cache.len -= 1;

    entry_destroy(e);
    return true;
}

fn cache_dump(cache: *LruCache::readable) -> void {
    io.print_str("LRU[");
    let cur: *Entry::alive = cache.head;

    while (cur != null) {
        io.print_str("(");
        io.print_str(cur.key);
        io.print_str(":");

        value_print(cur.value);

        io.print_str(")");
        if (cur.next != null) {
            io.print_str(" -> ");
        }

        cur = cur.next;
    }

    io.print_str("]\n");
}

fn main() -> int {
    let cache: own *LruCache::ready = cache_create(3);

	//TODO don't need to do String::from, and don't use ::, its for type state only.
    cache_put(cache, String::from("alpha"), make_int(1));
    cache_put(cache, String::from("beta"), make_text(String::from("bravo")));
    cache_put(cache, String::from("gamma"), make_int(3));

    cache_dump(cache);

    // read-only access; returns a pointer into live cache memory
    //TODO what is the lifetime on that? you need to track that kind of stuff
    let alpha_ref: *CacheValue::readable = cache_peek(cache, String::from("alpha"));
    if (alpha_ref != null) {
        io.print_str("peek alpha = ");
        value_print(alpha_ref);
        io.print_str("\n");
    }

    // mutable access moves alpha to the front
    let alpha_live: *CacheValue::readable = cache_get(cache, String::from("alpha"));
    if (alpha_live != null) {
        io.print_str("get alpha = ");
        value_print(alpha_live);
        io.print_str("\n");
    }

    cache_dump(cache);

    // update existing key; old value is destroyed in place
    cache_put(cache, String::from("alpha"), make_int(11));
    cache_dump(cache);

    // force an eviction through capacity pressure
    cache_put(cache, String::from("delta"), make_text(String::from("delta")));
    cache_dump(cache);

    // explicit remove; any pointer previously returned for beta becomes dead here
    let removed: bool = cache_remove(cache, String::from("beta"));
    if (removed) {
        io.print_str("removed beta\n");
    }

    cache_dump(cache);

    // final cleanup; destroys remaining entries, map, and cache object itself
    cache_destroy(cache);
    return 0;
}

//TODO track lifetimes
```


