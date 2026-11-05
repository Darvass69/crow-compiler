import fs from "node:fs";
const source = fs.readFileSync("./src/examples/aoc/2025/puzzle3.txt", "utf-8");
const lines = source.split(`\n`).map((s) => s.trim()).filter((e) => e !== "");
const banks = lines.map((b) => b.split("").map((bat) => Number(bat)));

const results = banks.map((bank) => {
  let biggest: number = bank[0];
  let bigIndex: number = 0;

  for (let i = 0; i < bank.length - 1; i++) {
    if (bank[i] > biggest) {
      biggest = bank[i];
      bigIndex = i;
    }
  }

  let second: number = bank[bigIndex + 1];
  for (let i = bigIndex + 1; i < bank.length; i++) {
    if (bank[i] > second) {
      second = bank[i];
    }
  }

  return biggest * 10 + second;
});

console.log(results.reduce((a, b) => a + b));
