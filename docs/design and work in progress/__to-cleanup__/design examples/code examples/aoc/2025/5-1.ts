import fs from "node:fs";
const source = fs.readFileSync("./src/examples/aoc/2025/puzzle5.txt", "utf-8").replace(new RegExp("\r", "g"), "");

const [rangeLines, idLines] = source.split(`\n\n`);

const ranges = rangeLines.split("\n").map((line) => {
  const [left, right] = line.split("-");
  return [Number(left), Number(right)] satisfies [number, number];
});

const ids = idLines.split("\n").map((line) => Number(line));

let count = 0;
for (const id of ids) {
  for (const range of ranges) {
    const v = isFresh(id, range);
    if (v) {
      count++;
      break;
    }
  }
}

function isFresh(id: number, [low, high]: [number, number]) {
  if (low <= id && id <= high) {
    return true;
  }

  return false;
}

console.log(count);
