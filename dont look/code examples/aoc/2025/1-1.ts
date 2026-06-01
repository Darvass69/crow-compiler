import fs from "node:fs";

// 17:22
// mod 100
// start = 50

const source = fs.readFileSync("./src/examples/aoc/2025/puzzle1.txt", "utf-8");
const lines = source.split("\n");
const commands = lines.map((l) => [l[0], Number(l.slice(1))]) as ["L" | "R", number][];

let position = 50;
let count = 0;

function rotate(direction: "L" | "R", n: number) {
  if (direction === "L") {
    position -= n;
  } else {
    position += n;
  }

  normalizePosition();
}

function normalizePosition() {
  if (position < 0) {
    position += 100;
    normalizePosition();
  } else if (position >= 100) {
    position = position % 100;
    normalizePosition();
  }
}

for (let command of commands) {
  rotate(command[0], command[1]);

  if (position === 0) {
    count++;
  }
}

console.log(count);
console.log("end");
