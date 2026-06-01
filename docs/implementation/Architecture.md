The compiler is split into these parts:
1. lexer: transforms the source code into tokens to make it easier in the parser.
2. parser: creates an Abstract Syntax Tree from the tokens. We use a Pratt style parser because its the easiest way to do parsing by far, and it also makes really good parsing errors.
3. compiler:
	1. HIR (High-level Intermediate Representation): Like the AST, but typed. We also transform complex syntax from the AST into a simpler form (desugaring). It also contains our type checking.
	2. MIR (Mid-level Intermediate Representation): Three-Address Code/Control Flow Graph. Its easier to create assembly from this form. This might be changed for a more standard Static Single-Assignment (SSA) form that is very good for optimisations.
	3. LIR (Low-level Intermediate Representation): This is very similar to Web Assembly Text format (WAT), but we don't have a text representation. The goal is to simplify generation from the MIR.
	4. WASM (Web Assembly): This is the compilation target.



TODO explain better
Talk about how we handle errors?
Rest of the tools we are adding (lsp, debugger, ...)



# TODO
We need to restructure everything. A lot of it is messy and hard to use for real. Lets try to get something that feels like a real compiler.

We could even write down things like operator priority, statements over expressions, if we have a second expression thingy for types.