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

  const maxSubstringSize = Math.floor(str.length / 2);

  for (let substringSize = 1; substringSize <= maxSubstringSize; substringSize++) {
    if (isInvalid2(substringSize, str)) {
      return true;
    }
  }

  return false;
}

function isInvalid2(substringSize: number, str: string) {
  if (str.length % substringSize !== 0) {
    return false;
  }

  const substrings: string[] = [];
  for (let i = 0; i < str.length; i += substringSize) {
    substrings.push(str.slice(i, i + substringSize));
  }

  return substrings.every((sub) => sub === substrings[0]);
}
