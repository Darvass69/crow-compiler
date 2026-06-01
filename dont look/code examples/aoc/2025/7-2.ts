import fs from "node:fs";
const source = fs.readFileSync("./src/examples/aoc/2025/puzzle7.txt", "utf-8").replace(new RegExp("\r", "g"), "");

enum Cell {
  Empty,
  Split,
  Start,
}

const lines = source.split("\n");
const [startRow, ...rows] = lines.map((line) => line.split("").map((char) => char === "S" ? Cell.Start : char === "^" ? Cell.Split : Cell.Empty));
const width = rows[0].length;

const startIndex = startRow.findIndex((v) => v === Cell.Start);
let beams: number[] = Array(width).fill(0);
beams[startIndex] = 1;

for (let row of rows) {
  row.forEach((cell, i) => {
    if (cell === Cell.Split && beams[i]) {
      beams[i - 1] += beams[i];
      beams[i + 1] += beams[i];

      beams[i] = 0;
    }
  });
}

const result = beams.reduce((a, b) => a + b, 0);
console.log(result);
