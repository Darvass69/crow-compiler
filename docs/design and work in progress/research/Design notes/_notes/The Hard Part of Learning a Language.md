https://www.hillelwayne.com/post/learning-a-language/

- How do I install it? (and relevant info like compatibility) `solution: just do good docs`
- How am I supposed to be writing this? (IDE, extension, etc. Make it clear what is the intended way) `solution: just do good docs`
- How do I do any of the things that aren’t part of the core syntax/semantics but are super common problems people face every day? (How do I read from a file? How do I parse JSON? How do I pull environment variables?) `can't really do anything more than having good docs for the std lib, maybe simple guides for general things`
- What are the language quirks that will cost me an hour to discover? `try to design the language with minimal quirks and footguns. and if we have some, try to document them. If we have a feature that works just differently enough to cause confusion, rename it/make it look different enough that its not confusing.`
- How is the help organized? Is there an official site? How’s the site laid out? `maybe have docs in the website, or something like read the docs. but everything would be just md files probably (until we make doc gen into websites, then we can do a lot more). Try to have a variety of docs, from begginer to experts to maintainers, and possibly just split docs into groups of concern`
- I hit problem X. Should I look for help in the official docs, or the FAQ, or the community, or should I be putting random stuff into Google? `not sure how to fix that other than just docs -> FAQ -> google (do not use discord for help, it doesn't get indexed by google)`
- How do I debug? Will doing anything other than “break into repl” be like pulling teeth? `We will have a debugger, ideally a good one. We'll see how hard it is and how good we can make it.`
- Testing. Is unit testing part of the core library, or do I need to install a third party framework? `unit testing is part of the std lib, and will be clearly documented`
- How do I build? How do I package? How do I manage my environment? `because you control the build, a lot of this will not be as bad. Having a good way to do settings and combine user settings with workspace and overrides would make it also a lot easier.`
- Package management. `won't have a package manager for now. Keep a list of the "almost/should be std lib" packages in the main docs.`
- So… the language community. `Probably either discord or matrix (both?). Will try to keep a good community, but its hard anyway.`


