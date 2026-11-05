import fs from "node:fs";

/*
For this challenge, we have a 2 lists of numbers.
We need to pair up the numbers in each lists, in ascending order.
Then calculate the difference between the 2 numbers, and sum them.
*/

const source = fs.readFileSync("./src/examples/aoc/2024/puzzle1.txt", "utf-8");

function getLists(source: string): [leftList: number[], rightList: number[]] {
  const lines = source.split("\n");

  const leftList: number[] = [];
  const rightList: number[] = [];

  for (let line of lines) {
    if (line != "") {
      const [left, right] = line.split("   ").map((val) => Number(val));

      leftList.push(left);
      rightList.push(right);
    }
  }

  return [leftList, rightList];
}

function calculateDistance(a: number, b: number) {
  if (a > b) {
    return a - b;
  } else {
    return b - a;
  }
}

const [leftList, rightList] = getLists(source);

leftList.sort((a, b) => a - b);
rightList.sort((a, b) => a - b);

let sum = 0;
leftList.forEach((left, i) => sum += calculateDistance(left, rightList[i]));

console.log(sum);
