/*
TODO How do we setup this project to be a library in a way that is easy to use?



*/

import { tokenize } from "./front-end/1_lexer/lexer";
import { parseAST } from "./front-end/2_parser/parser";
import { generateHIR } from "./front-end/3_compiler/1_HIR/compiler";
import { generateMIR } from "./back-end/2_MIR/compiler";
import { generateLIR } from "./back-end/3_LIR/compiler";
import { generateBinary } from "./back-end/4_WASM/compiler";

export default { generateBinary, generateHIR, generateLIR, generateMIR, parseAST, tokenize };
export * from "./diagnostics/diagnostics";
