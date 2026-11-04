import fs from "node:fs";
import path from "path";
import { tokenize } from "../../src/front-end/1_lexer/lexer";
import { TokenType } from "../../src/front-end/1_lexer/token";
import { parseAST } from "../../src/front-end/2_parser/parser";
import { generateHIR } from "../../src/front-end/3_compiler/1_HIR/compiler";
import { generateMIR } from "../../src/back-end/2_MIR/compiler";
import { generateLIR } from "../../src/back-end/3_LIR/compiler";
import { generateBinary } from "../../src/back-end/4_WASM/compiler";
import { diagnostics } from "../../src/diagnostics/diagnostics";

//TODO have an actual way to specify error codes so we can test better.

export function makeSourceTest(expected: number[], ...lines: string[]) {
  return async () => {
    await testSource(lines.join("\n"), expected);
  };
}

export function makeFileTest(dirName: string, testNumber: number, expected: number[]) {
  const prefix = new RegExp(`^${testNumber}(\\D|$)`);

  const fileName = fs.readdirSync(dirName).find((f) => prefix.test(f));

  if (!fileName) {
    return async () => {
      throw new Error(`Could not find a file starting with "${testNumber}" in ${dirName}`);
    };
  }
  const filePath = path.join(dirName, fileName);

  const file = fs.readFileSync(filePath, "utf8");

  return async () => {
    await testSource(file, expected);
  };
}

export async function testSource(source: string, expectedResults: number[]) {
  let expectError = false;
  if (expectedResults.length === 1 && Number.isNaN(expectedResults[0])) {
    expectError = true;
  }

  try {
    const tokens = tokenize(source).filter((t) => t.type !== TokenType.Comment);
    const ast = parseAST(tokens);
    const HIR = generateHIR(ast);
    const MIR = generateMIR(HIR);
    const LIR = generateLIR(MIR);
    const binary = generateBinary(LIR);

    let i = 0;
    const instance = await WebAssembly.instantiate(binary, {
      env: {
        print: (n: number) => {
          expect(n).toBe(expectedResults[i++]);
        },
      },
    });

    if (!expectError) {
      expect(diagnostics.lexerDiagnostics).toEqual([]);
    }
  } catch (e) {
    if (!expectError) {
      throw e;
    }
  } finally {
    diagnostics.lexerDiagnostics.splice(0);
  }
}
