Lets try to make a better compiler architecture.

Requirements:
easy to add new tokens, ast nodes, etc
easy to do type checking
easy to add more compiler passes on each part
easy to get data back for the language server
be resilient to errors
give good error messages that explains why some code failed (as opposed to cpp) + suggested fix

## Pipeline:

**Front end**
Source code -- Lexer --> Tokens -- Parser --> AST/CST

**Back end**
AST/CST --> AST CFG --> type checked CFG --> lowered CFG (TAC)

**Code gen**
 lowered CFG (TAC)  --> SSA/CFG IR --> SSA/CFG IR (optimized) --> WASM IR generator --> WASM/WAT IR -- WASM bytecode generator --> WASM bytecode


## Front end
### Lexer
Streaming lexer.
We only need `eat`, `peek`, `isDone`. Right now, the parser is doing that. And maybe some more complex/flexible `expect` for semi-colon insertion, compiler commands, and just to have a better way to express meaningful tokens.

Generate synthetic error tokens when we can't tokenize something and add error to diagnostics.

Make lexer data driven? Or make the architecture easy to expand ? (later, make it easy to add plugins?)

Tokens contain:
+ type/kind
+ value
+ position in source

### Parser
LL(1) parser (I'm pretty sure). We parse everything without backtracking, but we might need a second pass on the AST to clean up a few things. The clean up pass doesn't change the interpretation of the syntax (doing the clean up pass doesn't invalidate previous parsing outside the cleanup's scope)

- [ ] How are tokens tracked in the AST/CST? How do we track source mapping all the way to codegen? (formatter?)
- [ ] How do we handle errors + resilient parsing with good error messages? Semi-colon insertion?
- [ ] Dynamic compiler settings/plugins?

Maybe we can expand Pratt to make everything into a LED/NUD with a binding power? (statements are just expressions that act weirdly/have a very high binding power?)
Data driven? (easy to expand + plugins?)

The binding power is relevant to parsing rules, not token and AST node. ParseAddition has a binding power, `+` doesn't.

Make sure that the error messages are easy to understand, and are related to the origin/line of the problem (not 200 lines after).


### Type checking/HIR/THIR
#TODO not sure what would go in there, how and what steps we want. What architecture would work?


1. **Before types exist** → Resolution
	- Name resolution (values, types, labels, modules — one mechanism, all namespaces)
	- Scope construction
	- Visibility checking
	- Pre-typecheck desugaring: surface-syntax removal, structural canonicalization, `where` → `let`, simple control-flow sugar, literal desugaring, pattern _structure_ normalization
		- desugaring must run before resolution only if it removes bindings the resolver needs to see (e.g., `for x in xs`).
	- Figure out the (normalized) structure of the program. (make a CFG, but not SSA and not TAC. Just break down loops and ifs into their parts, like loops would be a header/init + an edge to body + a back edge from the body to the header + an exit edge)
2. **While types are being computed** → Type Checking
	+ Type inference
	+ Trait / typeclass, overload, method / field resolution
	+ Figure out what each thing is.
3. **After types exist** → Lowering
	+ Make everything explicit using only the most primitive constructs
	+ All loops into one loop construct, all function calls explicit (operator, methods, overload, ...), all pointer ref/deref explicit, etc.
	+ We make a TAC CFG, same representation as SSA but without phi nodes. Then SSA is just taking the CFG and transforming it with phi nodes. (`mem2reg`?)
	+ Lowering could be done on demand for the SSA IR

## Back end

### MIR
SSA/CFG IR. 
This is the layer that will be available when making a custom code gen (or if we decide to use LLVM/QBE, it will be from this layer).

#TODO what exactly do we do here? For now, just generate enough that we are able to go to the next step. We don't have to analyze or optimize for now.

### WASM IR generator
WASM IR is very similar to WAT, just not in a textual representation. The idea is just to be able to represent everything the way WASM needs it, but without needing the exact structure in advance. The IR maps 1 to 1 to WASM features, but without requiring the exact binary encoding and section layout that the bytecode needs.

The architecture is quite simple. Walk the SSA/CFG IR, generate functions and code.

### WASM bytecode generator
Take the WASM IR and generate a valid binary.
Collect all lines of each section (imports, exports, types, functions, globals, etc.), resolve names and generate the binary.

The architecture is very simple. Iterate the WASM IR, sort each declaration into the right bucket, resolve names and generate the binary section by section.
We could also do some slight optimization, like identifying if 2 functions have the same type and merging the declaration in the type section.

Also, add debug symbols, trace, panic/trap, etc. Everything we might want in the final binary.
(This could become a bit more involved if we start doing hot reloading/repl)









# Plugins, modularity and language extensions

The compiler is offered as a library that you use to build your project. You write normal Crow code to generate the project, a bit how things like vite config and other configs in the JS space work, where you use js/ts scripts to setup the config of the tool. We'll just push it so that you have a lot more control over what you can do. This way, we would not need CMake and we would offer maximum flexibility.

Once we bootstrap the compiler, we will want to allow people to make plugins to extend the compiler. For example, we could have a plugin that adds syntax like jsx/tsx to Crow, and it would just be a matter of adding it in the build script.
