//TODO a simple thing that loads and run WASM we compiled
import fs from "node:fs";

// import { testEmitter } from "../compiler/compiler";

export async function runBinary(binary: Uint8Array) {
  fs.writeFileSync("./code.wasm", binary);
  console.log("WASM file created");
  const { instance } = await WebAssembly.instantiate(binary);
  if (typeof instance.exports.main === "function") {
    return instance.exports.main();
  } else {
    console.error("add is not a function");
  }
}

// try {
//   void runBinary(testEmitter());
// } catch (error) {
//   console.error("Caught error in main:", error);
// }
