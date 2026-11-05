I have many many ideas for features, but they don't always fit the language, or they need other features first. To help that (and to stop designing stuff I will never use), we'll split design into multiple sub languages/steps.
1. Basic C language: Its a basic language like C, but with a few more stuff on it. The type system is super explicit and verbose. The goal is to have a language that can represent everything we need, but without good user experience.
   [Basic language](wip%20design.md)
2. Advanced type system: We add inference for everything. Infer everything from return type (+ errors), how to merge unions, implicit structs from usage, etc. We loose some control, but we gain a lot of flexibility. Also choose keywords and compiler rules so you can still have control when you want, and that you can force types to be handled a certain way (like preventing implicit casts). That way, we gain flexibility without compromising the strictness of the type system. We can also add other type system stuff, like dependent types and type state, and maybe borrow/lifetime semantics.
   [Advanced language](docs/design%20and%20work%20in%20progress/__to-cleanup__/designing/Advanced%20language/design.md)






#state/idea
#state/exploring
#state/wip
#state/stuck
#state/decided
#state/final

#confidence/low
#confidence/medium
#confidence/high

#stability/temporary
#stability/evolving
#stability/stable