Very cool, need to try to implement it: https://verdagon.dev/blog/group-borrowing

If we take values (like `this.a`) as a sub child, and that we consider mutating it as destroying the old value, we get really close to tracking mutation.
Distinct == different groups

doesn't track type mutation, but maybe it could be tracked by refinement/dependent types.




