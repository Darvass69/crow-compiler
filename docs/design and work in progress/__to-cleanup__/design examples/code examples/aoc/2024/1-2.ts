import fs from "node:fs";

/*
For this challenge, we have a 2 lists of numbers.
We need to get the similarity score between both list.
Its calculated by:
  taking each number in the left list
  multiply it by the number of times its present in the right list

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

function getNumberOfEach(rightList: number[]) {
  const dict: { [key: number]: number } = {};

  rightList.forEach((right) => dict[right] = (dict[right] ?? 0) + 1);
  return dict;
}

let similarity = 0;
const [leftList, rightList] = getLists(source);
const dict = getNumberOfEach(rightList);
leftList.forEach((left) => similarity += left * (dict[left] ?? 0));

console.log(similarity);
