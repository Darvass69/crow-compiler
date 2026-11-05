import fs from "node:fs";
const source = fs.readFileSync("./src/examples/aoc/2025/puzzle6.txt", "utf-8").replace(new RegExp("\r", "g"), "");

const lines = source.split("\n");

const values = lines.slice(0, 4).map((line) => line.split(" ").filter((v) => v).map((v) => Number(v)));

const operators = lines[4].split(" ").filter((v) => v) as ("+" | "*")[];

let count = 0;
for (let i = 0; i < operators.length; i++) {
  const value1 = values[0][i];
  const value2 = values[1][i];
  const value3 = values[2][i];
  const value4 = values[3][i];

  if (operators[i] === "+") {
    count += value1 + value2 + value3 + value4;
  } else {
    count += value1 * value2 * value3 * value4;
  }
}

console.log(count);
