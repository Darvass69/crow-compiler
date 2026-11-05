import fs, { stat } from "node:fs";
const source = fs.readFileSync("./src/examples/aoc/2025/puzzle10.txt", "utf-8").replace(new RegExp("\r", "g"), "");
const lines = source.split("\n");

type Button = number[];
type Machine = {
  joltage: number[];
  buttons: Button[];
};
const machines: Machine[] = lines.map((line) => {
  const regex = /^\s*(\[[^\]]*\])\s*((?:\([^)]*\)\s*)+)\s*(\{[^}]*\})\s*$/;
  const match = line.match(regex);

  if (match) {
    const [, square, parens, braces] = match;

    const joltage = braces.split("").filter((c) => c !== "{" && c !== "}").join("").split(",").map(
      (v) => Number(v),
    );

    const buttons = parens.replace(/[()]/g, "").split(" ").filter((v) => v !== "").map((button) => button.split(",").map((v) => Number(v)));

    return {
      joltage,
      buttons,
    };
  } else {
    return { joltage: [], buttons: [] };
  }
}).filter((m) => m.joltage.length !== 0 && m.buttons.length !== 0);

type State = number[];
let count = 0;
for (let machine of machines) {
  let queue: { state: State; heuristic: number }[] = [];
  let visitedDist: Map<string, number> = new Map();

  let startState = Array(machine.joltage.length).fill(0);
  const buttons = machine.buttons;
  const target = machine.joltage;

  queue.push({ state: startState, heuristic: getHeuristic(startState, target) });

  while (queue.length > 0) {
    const { state: current } = queue.sort((a, b) => a.heuristic - b.heuristic).shift() as typeof queue[number];

    if (isTarget(target, current)) {
      break;
    }

    for (const button of buttons) {
      const newState = evaluateAction(current, button);

      if (!isValidState(target, newState)) {
        continue;
      }

      const newDist = (visitedDist.get(current.join(",")) ?? 0) + 1;

      const newMemoDist = visitedDist.get(newState.join(","));
      if (newMemoDist === undefined || newDist < newMemoDist) {
        visitedDist.set(newState.join(","), newDist);
        queue.push({ state: newState, heuristic: newDist + getHeuristic(newState, target) });
      }
    }
  }

  count += visitedDist.get(target.join(",")) as number;
}

// heuristic is nb moves to reach the biggest value
function getHeuristic(from: State, to: State) {
  return Math.max(...to.map((pos, i) => pos - from[i]));
}

function evaluateAction(oldState: number[], button: Button) {
  let state = [...oldState];
  for (const index of button) {
    state[index]++;
  }

  return state;
}

function isValidState(target: State, state: State) {
  for (let i = 0; i < target.length; i++) {
    if (state[i] > target[i]) {
      return false;
    }
  }
  return true;
}

function isTarget(target: State, state: State) {
  for (let i = 0; i < target.length; i++) {
    if (target[i] !== state[i]) {
      return false;
    }
  }

  return true;
}

console.log(count);
console.log("end");
