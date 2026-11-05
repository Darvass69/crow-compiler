import fs from "node:fs";
const source = fs.readFileSync("./src/examples/aoc/2025/puzzle4.txt", "utf-8");
const lines = source.split(`\n`).map((s) => s.trim()).filter((e) => e !== "");
const grid = lines.map((line) => line.split("").map((char) => char === "@" ? 1 : 0));

const gridHeight = grid.length;
const gridWidth = grid[0].length;

let validRolls = 0;
let hasChanged = true;
while (hasChanged) {
  hasChanged = false;

  for (let i = 0; i < gridHeight; i++) {
    for (let j = 0; j < gridWidth; j++) {
      if (grid[i][j] === 1) {
        // count adjacencies
        let count = 0;

        count += grid[i - 1]?.[j - 1] ?? 0;
        count += grid[i - 1]?.[j] ?? 0;
        count += grid[i - 1]?.[j + 1] ?? 0;

        count += grid[i]?.[j - 1] ?? 0;
        count += grid[i]?.[j + 1] ?? 0;

        count += grid[i + 1]?.[j - 1] ?? 0;
        count += grid[i + 1]?.[j] ?? 0;
        count += grid[i + 1]?.[j + 1] ?? 0;

        if (count < 4) {
          validRolls++;
          grid[i][j] = 0;
          hasChanged = true;
        }
      }
    }
  }
}

console.log(validRolls);
