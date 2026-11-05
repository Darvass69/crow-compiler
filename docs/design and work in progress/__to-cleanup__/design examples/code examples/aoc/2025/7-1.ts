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
let beams: boolean[] = Array(width);
beams[startIndex] = true;

let count = 0;
for (let row of rows) {
  row.forEach((cell, i) => {
    if (cell === Cell.Split && beams[i]) {
      beams[i - 1] = true;
      beams[i] = false;
      beams[i + 1] = true;

      count++;
    }
  });
}

console.log(count);
