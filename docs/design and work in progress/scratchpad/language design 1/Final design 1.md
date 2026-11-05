```
// This is a comment
/* This is an inline/multi line comment */
/** This is a doc comment */

// Statements



// Block expressions

// if, 2 variants. `if ... then ... else ...` is equivalent to the ternary operator.
var y = if (cond1) {
	result if (cond2) {
		result res1;
	}
} else if (cond3) {
	result res2;
} else {
	reslt res3;
}



// Expressions

// ternary if
var x = if cond1
	then if cond2
		then res1
		else _
	else if cond3
		then res2
	else res3



// primitive literals
// number
var dec = 69; // any nb of num, _ to split numbers. (format rules?)
var flt = 12.264 // numeric, comma, numeric. same for double
var hex = 0xABCD // 0x followed by 0-9, A, B, C, D, E, F. Upper and lower case. _ to split parts.
var bin = 0b0010_0110 // 0x followed by 0-1, _ to split parts.
var oct = 0o01234567 // octal, same rules

var myChar = 'a';
var strExample = "This is a string. It is delimited by \"\". Anything else inside is considered part of the string as is, except escape sequences."
// TBD escape sequences
var rawString = ??? // TBD. Not sure what to use as delimiters.
var stringTemplate = `This is a string template. It can include any value using ${someValue}. Whatever is inside {} will be transformed to a string. If it is left empty, like this ${}, the template is now a function that can take in parameters. The first parameter will go to the first block, then second, etc.`
//TBD named parameters? Link fields together? Specify formatting?


// basic operators
0 ?? 1 || 2 && 3 | 4 ^ 5 & 6 == 7 != 8 < 9 > 10 >= 11 <= 12 << 13 >> 14 + 15 - 16 * 17 / 18 % 19 ** 20;
--a; ++a;
!a; ~a;
+a; -a;
a--; a++

```
