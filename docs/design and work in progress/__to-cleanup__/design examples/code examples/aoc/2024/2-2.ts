import fs from "node:fs";

const source = fs.readFileSync("./src/examples/aoc/2024/puzzle2.txt", "utf-8");

const reports = source.split("\n");

const parsedReports = reports.map((rep) => {
  if (rep != "") {
    return rep.split(" ").map((val) => Number(val));
  } else {
    return undefined;
  }
}).filter((val) => val != undefined);

enum Direction {
  ascending = -1,
  descending = 1,
}

let nbSafe = 0;

function checkReport(report: number[], reverse: boolean = false): boolean {
  // dampener adds 3 cases:
  // 1. the first number is wrong
  // 2. the second number is wrong
  // 3. a number after is wrong

  // 3 is easy. If we get a wrong number, skip it.
  // 1 and 2 can be done if we just do 3 but with the reverse array.

  let direction: Direction = report[0] !== report[1] && report[0] - report[1] < 0 ? Direction.ascending : Direction.descending;
  let errorFound = false;
  let lastValue = report[0];

  for (let i = 1; i < report.length; i++) {
    const diff = lastValue - report[i];

    if (
      diff == 0 ||
      Math.abs(diff) > 3 ||
      (direction === Direction.ascending && diff > 0) ||
      (direction === Direction.descending && diff < 0)
    ) {
      if (!errorFound) {
        errorFound = true;
      } else {
        return reverse ? checkReport(report.toReversed()) : false;
      }
    } else {
      lastValue = report[i];
    }
  }
  return true;
}

for (const report of parsedReports) {
  if (checkReport(report, true)) {
    nbSafe++;
  }
}

console.log(nbSafe);
