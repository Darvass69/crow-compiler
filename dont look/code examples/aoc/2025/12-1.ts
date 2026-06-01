import fs from "node:fs";
const source = fs.readFileSync("./src/examples/aoc/2025/puzzle12.txt", "utf-8").replace(new RegExp("\r", "g"), "");

const [shapeSrc, regionSrc] = source.split("\n\n\n");

const shapeLines = shapeSrc.split("\n").filter((l) => l !== "");
const regionLines = regionSrc.split("\n").filter((l) => l !== "");

type Region = {
  width: number;
  height: number;
  shapes: number[];
};

const regions = regionLines.map((line) => {
  const [sizes, shapes] = line.split(":");

  const [width, height] = sizes.split("x").map((v) => Number(v));
  const region: Region = {
    width,
    height,
    shapes: [],
  };

  shapes.split(" ").filter((v) => v !== "").forEach((count, i) => {
    region.shapes[i] = Number(count);
  });

  return region;
});

type Cell = boolean;
type Row = [Cell, Cell, Cell];
type Grid = [Row, Row, Row];
const shapes: {
  [id: string]: Grid;
} = {};

let currId = "0";
let currRow = 3;
for (let line of shapeLines) {
  if (line.includes(":")) {
    currId = line.split(":")[0];
    if (currRow !== 3) {
      debugger;
    }
    currRow = 0;
    shapes[currId] = [[false, false, false], [false, false, false], [false, false, false]];
    continue;
  }

  shapes[currId][currRow] = line.split("").map((c) => c === "#") as Row;
  currRow++;
}

let count = 0;
for (let region of regions) {
  const regionArea = region.width * region.height;
  const shapeArea = Object.entries(region.shapes).map(([shapeID, count]) => {
    const shape = shapes[shapeID];
    const area = shape.flatMap((r) => r.map((c) => c ? 1 : 0)).reduce<number>((a, b) => a + b, 0);
    return area * count;
  }).reduce((a, b) => a + b);

  if (regionArea >= shapeArea) {
    count++;
  } else {
  }
}

console.log("end");
