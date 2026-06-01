import fs from "node:fs";
const source = fs.readFileSync("./src/examples/aoc/2025/puzzle6.txt", "utf-8").replace(new RegExp("\r", "g"), "");

const lines = source.split("\n");

const valueLines = lines.slice(0, lines.length - 1);
type Col = string[];
const cols: Col[] = [];
for (let i = 0; i < valueLines[0].length; i++) {
  cols.push(valueLines.map((line) => line[i]));
}

type Problem = number[];
const splits: Problem[] = [];
let currentStart = 0;
for (let i = 0; i < cols.length; i++) {
  if (cols[i].every((v) => v === " ")) {
    splits.push([...cols.slice(currentStart, i).map((col) => Number(col.join("").trim()))]);
    currentStart = i + 1;
  }
}
splits.push([...cols.slice(currentStart, cols.length).map((col) => Number(col.join("").trim()))]);

const operators = lines[lines.length - 1].split(" ").filter((v) => v) as ("+" | "*")[];

let count = 0;
for (let i = 0; i < operators.length; i++) {
  if (operators[i] === "+") {
    count += splits[i].reduce((a, b) => a + b, 0);
  } else {
    count += splits[i].reduce((a, b) => a * b, 1);
  }
}

console.log(count);
