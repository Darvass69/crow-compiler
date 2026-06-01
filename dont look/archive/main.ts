import fs from "node:fs";
import { Lexer } from "./1_lexer/lexer";
import { tokenListToStringJson } from "./1_lexer/token";
import { Parser } from "./2_parser/parser";
import { astToStringJson } from "./2_parser/astNodes";
import { runBinary } from "./runtime/runtime";
import { compile } from "./compiler/WASM/compiler";
import { compileIR } from "./compiler/IR/ir";

//TODO add eslint

const files = ["simple1.lang"];
const fileNb = 0;

const path = "./src/examples/" + files[fileNb];
// const execute = false;

async function main() {
  const file = fs.readFileSync(path, "utf8");

  const tokens = new Lexer(file).tokenize();
  fs.writeFileSync("./tokens.json", JSON.stringify(tokens, tokenListToStringJson, 2));

  console.log(`successfully created ${tokens.length} tokens.`);
  // console.log(getTokenValues(tokens, 0, []));

  const parser = new Parser();

  const ast = parser.Parse(tokens);
  fs.writeFileSync("./ast.json", JSON.stringify(ast, astToStringJson, 2));
  console.info("successfully created the AST !!!");

  const ir = compileIR(ast);
  const wasm = compileWASM(ir);
  runBinary(wasm);

  // if (execute) {
  // 	const environment = createGlobalScope(); // global scope, use special fn to create
  // 	const result = evaluate(program, environment);
  // 	console.log(result);
  // } else {
  // 	console.log("Program execution skipped");
  // }
}

try {
  void main();
} catch (error) {
  console.error("Caught error in main:", error);
}
