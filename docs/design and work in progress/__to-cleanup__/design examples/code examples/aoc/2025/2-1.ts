import fs from "node:fs";
const source = fs.readFileSync("./src/examples/aoc/2025/puzzle2.txt", "utf-8");
const ranges = source.split(",").map((r) => r.split("-"));

const invalid: number[] = [];
for (let range of ranges) {
  invalid.push(...findInvalid(Number(range[0]), Number(range[1])));
}

const result = invalid.reduce((a, b) => a + b);
console.log(result);

function findInvalid(lower: number, higher: number) {
  const invalid: number[] = [];
  // stupid way: just increment and check each time
  for (let i = lower; i <= higher; i++) {
    if (isInvalid(i)) {
      invalid.push(i);
    }
  }

  return invalid;
}

function isInvalid(num: number) {
  const str = num.toString();

  if (str.length % 2 !== 0) {
    return false;
  }

  const sub1 = str.slice(0, str.length / 2);
  const sub2 = str.slice(str.length / 2, str.length);

  for (let i = 0; i < sub1.length; i++) {
    if (sub1[i] != sub2[i]) {
      return false;
    }
  }

  return true;
}
