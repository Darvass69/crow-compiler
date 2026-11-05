```
type A = struct {}
type B = Record {}
type C = Interface {}

/*
We want to differentiate:
- Interfaces: Only tells us capability (it has these fields)
- Structs: Real memory layout, can be initialized
- Records?, Dicts?: Can be initialized, but is not required to only have the properties defined in the type. Essentially a JS object. That way we can do sdcripting stuff if we need to.

*/


```

