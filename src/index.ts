/*
TODO How do we setup this project to be a library in a way that is easy to use?



*/

import { tokenize } from "./1_lexer/lexer";
import { parseAST } from "./2_parser/parser";
import { generateHIR } from "./3_compiler/1_HIR/compiler";
import { generateMIR } from "./3_compiler/2_MIR/compiler";
import { generateLIR } from "./3_compiler/3_LIR/compiler";
import { generateBinary } from "./3_compiler/4_WASM/compiler";

export default { generateBinary, generateHIR, generateLIR, generateMIR, parseAST, tokenize };
export * from "./diagnostics/diagnostics";
