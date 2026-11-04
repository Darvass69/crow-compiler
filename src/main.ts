import * as fs from "node:fs";
import { tokenToStringJson, TokenType } from "./front-end/1_lexer/token";
import { tokenize } from "./front-end/1_lexer/lexer";
import { parseAST } from "./front-end/2_parser/parser";
import { astToStringJson } from "./front-end/2_parser/astNodes";
import { generateMIR } from "./back-end/2_MIR/compiler";
import { mirToStringJson, moduleToGraphView, prettyPrintMIR } from "./back-end/2_MIR/MIR-Types";
import { generateLIR } from "./back-end/3_LIR/compiler";
import { generateBinary } from "./back-end/4_WASM/compiler";
import { hirToStringJson } from "./front-end/3_compiler/1_HIR/HIR.Types";
import { generateHIR } from "./front-end/3_compiler/1_HIR/compiler";
//TODO add eslint

const args = process.argv.slice(2);
var inPath = args[0];

if (!inPath) {
  throw new Error("No file selected");
}
const outPath = "./out/";

async function main() {
  const file = fs.readFileSync(inPath, "utf8");

  if (!fs.existsSync(outPath)) {
    fs.mkdirSync(outPath);
  }

  let tokens = tokenize(file);
  fs.writeFileSync(outPath + "tokens.json", JSON.stringify(tokens, tokenToStringJson, 2));
  tokens = tokens.filter((t) => t.type !== TokenType.Comment);

  const ast = parseAST(tokens);
  fs.writeFileSync(outPath + "ast.json", JSON.stringify(ast, astToStringJson, 2));
  console.info("successfully created the AST !!!");

  const HIR = generateHIR(ast);
  fs.writeFileSync(outPath + "hir.json", JSON.stringify(HIR, hirToStringJson, 2));
  console.info("successfully created the HIR !!!");

  const MIR = generateMIR(HIR);
  fs.writeFileSync(outPath + "mir.json", JSON.stringify(MIR, mirToStringJson, 2));
  fs.writeFileSync(outPath + "mir.txt", prettyPrintMIR(MIR));
  fs.writeFileSync(outPath + "mir.dot", moduleToGraphView(MIR));
  console.info("successfully created the MIR !!!");

  const LIR = generateLIR(MIR);
  fs.writeFileSync(outPath + "lir.json", JSON.stringify(LIR, undefined, 2));
  // fs.writeFileSync(outPath + "lir.txt", prettyPrintLIR(LIR));
  console.info("successfully created the LIR !!!");

  const binary = generateBinary(LIR);
  fs.writeFileSync(outPath + "binary.wasm", binary);
  console.log("WASM file created");

  const instance = await WebAssembly.instantiate(binary, {
    env: {
      print: (n: number) => console.log(n),
    },
  });

  // if (typeof instance.exports.main === "function") {
  //   return instance.exports.main();
  // } else {
  //   console.error("main is not a function");
  // }
}

void main().catch((e) => {
  console.error("Caught error in main:", e);
});

//TODO make a function that takes in a file and compiles and run it (like main but callable).

async function runWASMBinary(binary: Uint8Array) {
}
