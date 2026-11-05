
# [The Hard Part of Learning a Language](The%20Hard%20Part%20of%20Learning%20a%20Language.md)
- Docs should have:
	- How to install, and all info regarding compatibility with os and anything else that might break
	- How to use it, supported IDE, extensions. Make it clear what the intended/official way is, and any community alternative that is big enough to care about.
	- good docs for the std lib, maybe simple guides for general things (like JSON parsing, read file, env variables, etc.)
	- document language quirks and footguns
	- Docs start as md files. Eventually, make them into a website using the doc builder of the language.
	- Try to have a variety of docs, from beginner to experts to maintainers, and possibly just split docs into groups of concern
	- clearly document what is in the std lib at a high level so users know for example that there is a unit test framework in there. Also document the build system/library well.
- design
	- keep quirks and footguns to a minimum.
	- If a feature doesn't work quite the same as in other languages, call it something different so people aren't confused.
	- Build system needs to have an easy way to set settings, and have ways to combine settings (user settings, workspace settings, folder settings, overrides, etc.). That way, you can always just tweak settings to make it work for your setup without breaking someone else's.
