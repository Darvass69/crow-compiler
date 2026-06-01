import fs from "node:fs";

// mod 100
// start = 50

function divMod(a: number, b: number) {
  return [Math.floor(a / b), a % b];
}

const source = fs.readFileSync("./src/examples/aoc/2025/puzzle1.txt", "utf-8");
const lines = source.split("\n");
const commands = lines.map((l) => [l[0], Number(l.slice(1))]) as ["L" | "R", number][];

let position = 50;
let count = 0;
let position2 = 50;
let count2 = 0;
let diff = 0;

function rotate(direction: "L" | "R", n: number) {
  // if (direction === "L") {
  //   position2 -= n;
  // } else {
  //   position2 += n;
  // }

  // normalizePosition();

  for (let i = 0; i < n; i++) {
    if (direction === "L") {
      position--;
      if (position < 0) {
        position = 99;
      }
    } else {
      position++;
      if (position > 99) {
        position = 0;
      }
    }

    if (position === 0) {
      count++;
    }
  }

  //6268

  let [cycles, steps] = divMod(n, 100);
  count2 += cycles;

  if (direction === "L") {
    if (position2 === 0) {
      position2 = 100;
    }

    position2 -= steps;

    if (position2 === 0) {
      count2++;
    } else if (position2 < 0) {
      count2++;
      position2 = position2 + 100;
    }
  } else {
    position2 += steps;

    if (position2 === 0) {
      count2++;
    } else if (position2 >= 100) {
      count2++;
      position2 = position2 - 100;
    }
  }
}

// function normalizePosition() {
//   if (position2 < 0) {
//     position2 += 100;

//     if (prevPos !== 0) {
//       count2++;
//     }
//     normalizePosition();
//   } else if (position2 >= 100) {
//     position2 -= 100;
//     count2++;
//     normalizePosition();
//   }
// }

let prevPos = position;
let prevCount = count;
for (let i = 0; i < commands.length; i++) {
  let command = commands[i];
  rotate(command[0], command[1]);

  if (i == 42) {
    debugger;
  }

  if (count - count2 != diff) {
    console.log(`i: ${i}, prev: ${prevPos} ${prevCount}, command: [${command[0]}, ${command[1]}], pos: ${position}, count: ${count}, count2: ${count2}`);
    // count2 = count;
    diff = count - count2;
  }
  prevPos = position;
  prevCount = count;

  // if (position === 0) {
  //   count++;
  // }
}

console.log(count);
console.log("end");
