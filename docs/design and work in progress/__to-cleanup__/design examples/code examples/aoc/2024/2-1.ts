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
  descending = -1,
  unknown = 0,
  ascending = 1,
}

let nbSafe = 0;
report: for (const report of parsedReports) {
  let direction: Direction = 0;

  for (let i = 0; i < report.length - 1; i++) {
    const diff = report[i] - report[i + 1];
    if (diff == 0 || Math.abs(diff) > 3) {
      // skip the report
      continue report;
    }
    if (diff < 0) {
      // ascending
      if (direction == Direction.descending) {
        // skip the report
        continue report;
      }
      direction = Direction.ascending;
    } else if (diff > 0) {
      // descending
      if (direction == Direction.ascending) {
        // skip the report
        continue report;
      }
      direction = Direction.descending;
    }
  }
  nbSafe++;
}

console.log(nbSafe);
