import fs from "node:fs";
const source = fs.readFileSync("./src/examples/aoc/2025/puzzle3.txt", "utf-8");
const lines = source.split(`\n`).map((s) => s.trim()).filter((e) => e !== "");
const banks = lines.map((b) => b.split("").map((bat) => Number(bat)));

// the same but:
//    select 12 of n,
//      having the biggest on the left is just too good, so find the largest ing str[:-12]
//      then do the same in str[last index:-11], ...

const results = banks.map((bank) => {
  const solved = solveBank(bank, 12);
  return Number(solved.join(""));
});

function solveBank(bank: number[], length: number): number[] {
  if (length === 0) {
    return [];
  }

  const { biggest, bigIndex } = biggestInArray(bank.slice(0, bank.length - length + 1), 0);

  const subResult = solveBank(bank.slice(bigIndex + 1), length - 1);

  return [biggest, ...subResult];
}

function biggestInArray(array: number[], indexOffset: number): { biggest: number; bigIndex: number } {
  let biggest: number = array[0];
  let bigIndex: number = 0;

  for (let i = 0; i < array.length; i++) {
    if (array[i] > biggest) {
      biggest = array[i];
      bigIndex = i;
    }
  }

  return { biggest, bigIndex: bigIndex + indexOffset };
}

console.log(results.reduce((a, b) => a + b));
