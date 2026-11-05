import fs from "node:fs";
const source = fs.readFileSync("./src/examples/aoc/2025/puzzle9.txt", "utf-8").replace(new RegExp("\r", "g"), "");
const lines = source.split("\n");

const redTiles = lines.map((line) => {
  const [x, y] = line.split(",");
  return { x: Number(x), y: Number(y) };
});

let maxArea = 0;
redTiles.forEach((tile1, i) => {
  redTiles.forEach((tile2, i) => {
    const newArea = (Math.abs(tile1.x - tile2.x) + 1) * (Math.abs(tile1.y - tile2.y) + 1);
    if (newArea > maxArea) {
      maxArea = newArea;
    }
  });
});

console.log(maxArea);
