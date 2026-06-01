## Before next commit
- [x] Vision.md
	- [x] clean it up a little
- [x] current specs.md
	- [x] write down the current specs with examples
- [ ] README.md




## Soon
- [ ] rename `type` to `kind`

- [ ] Redo the architecture with errors in mind. And maybe also do a lsp first design?
	- [ ] Make things like name resolution more explicit. Right now, we are doing it a bit everywhere. Same for like types, functions, etc. WASM imports/exports. Explicitly group those concerns on one layer, or where it makes sense.


- [ ] change how we split tests. We want to group them by feature instead of phase, and have the phase be something more like a skip with a feature flag. That way its more flexible for future development. And make better samples we can use as examples.
- [ ] add more tests to test stuff we are not testing yet. And add a way to check that the compiler finds the right error instead of just an error.
- [ ] add unit tests for each module
- [ ] check scope for a specific edge case: if we have `x` in the parent context and we make a variable `x` in this context, we should not allow to use `x` before its declared (even if we could be using the parent's `x`) I might already have done that test, I don't remember.

## At some point





# Done in this commit
Documentation

## Lexer
Added lexer tests.
Added location of the tokens.
Added errors and error messages
Added a spot in tokens for ID if we need it later

Added synthetic tokens when making errors


**Errors and location not added to other parts of the compiler**

## Other
added integration tests for each phase
