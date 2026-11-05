# This commit
- [x] documentation
	- [x] clean up design/ressources to not accidentally upload pdfs that I am not allowed to share
	- [x] vision document
	- [x] readme
	- [x] homepage
- [x] fix the compiler after moving folders? Or start the new architecture?
- [ ] Make it easier to know how to make the lsp server and client work (versions/git hashes) while keeping it easy to continuously modify/prototype (right now, its not clear what version of what each thing uses). Maybe use git submodules? Or an install script?

# Short term
- [ ] documentation
	- [ ] write
		- [ ] somewhat readable first spec not in the scratch pad.
		- [ ] basic architecture view
	- [ ] verify that the markdown documentation is readable on github.
	- [ ] see if its easy to open the documentation in obsidian
- [ ] refactor the compiler to the new architecture, and maybe try to keep the LSP working?

# Later in development
- [ ] script that generates valid (and invalid?) code for stress and fuzz testing. Generate each step individually, and maybe all at once for one program? (at least the front end + type checker should be fuzzed)

# For first "usable" version (v0.0.1)
(v0.0.1 should be a fairly simple language that has all the structures the compiler needs to do the rest of the language and be easy enough to use to start having users)
- [ ] user guide complete and clear with the important info. At least the getting started, a few examples, maybe some specs.
- [ ] cli tool/lsp working and with enough features that its not awful to use.

# Long term (after v0.0.1)
- [ ] website? parse obsidian markdown and make a site from it? Or do my own solution? Documentation must be easy to browse. Also, std lib documentation and documentation of the CLI tool, build tool, error codes should be generated to markdown.
- [ ] make a std lib that isn't too bad. And bindings for the C standard library ?
