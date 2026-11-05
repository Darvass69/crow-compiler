import fs from "node:fs";
const source = fs.readFileSync("./src/examples/aoc/2025/puzzle5.txt", "utf-8").replace(new RegExp("\r", "g"), "");

const [rangeLines] = source.split(`\n\n`);

const ranges = rangeLines.split("\n").map((line) => {
  const [left, right] = line.split("-");
  return [Number(left), Number(right)] satisfies [number, number];
});

// count nb of fresh ingredients.
// for that, we need to merge ranges that overlap.
// order ranges in ascending order, then check each one with the next, if it overlaps (first.end >= second.start), merge them (replace the old one by a dummy value)

const tempRanges = ranges.sort((a, b) => a[0] - b[0]) as ([number, number] | undefined)[];

for (let i = 0; i < tempRanges.length - 1; i++) {
  const first = tempRanges[i];
  const second = tempRanges[i + 1] as [number, number];

  if (first && first[1] >= second[0]) {
    tempRanges[i] = undefined;
    tempRanges[i + 1] = [first[0], Math.max(first[1], second[1])];
  }
}

const mergedRanges = tempRanges.filter((v) => v !== undefined);

let count = 0;
for (const range of mergedRanges) {
  count += range[1] - range[0] + 1;
}

console.log(count);
