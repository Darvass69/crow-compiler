import fs, { stat } from "node:fs";
const source = fs.readFileSync("./src/examples/aoc/2025/puzzle10.txt", "utf-8").replace(new RegExp("\r", "g"), "");
const lines = source.split("\n");

type Button = number[];
type Machine = {
  lights: boolean[];
  buttons: Button[];
};
const machines: Machine[] = lines.map((line) => {
  const regex = /^\s*(\[[^\]]*\])\s*((?:\([^)]*\)\s*)+)\s*(\{[^}]*\})\s*$/;
  const match = line.match(regex);

  if (match) {
    const [, square, parens, braces] = match;

    const lights = square.split("").filter((c) => c !== "[" && c !== "]").map((c) => c === "#");

    const buttons = parens.replace(/[()]/g, "").split(" ").filter((v) => v !== "").map((button) => button.split(",").map((v) => Number(v)));

    return {
      lights,
      buttons,
    };
  } else {
    return { lights: [], buttons: [] };
  }
}).filter((m) => m.lights.length !== 0 && m.buttons.length !== 0);

let count = 0;
for (let machine of machines) {
  let state = Array(machine.lights.length).fill(false);

  let limit = 0;
  do {
    limit++;
  } while (!hasSolution(machine.lights, [...state], machine.buttons, limit));
  count += limit;
}

function hasSolution(target: boolean[], state: boolean[], buttons: Button[], limit: number) {
  if (limit === 0) {
    return isTarget(target, state);
  }

  if (buttons.length === 1) {
    return isTarget(target, evaluateAction([...state], buttons[0], limit));
  }

  for (let i = 0; i <= limit; i++) {
    const newState = evaluateAction([...state], buttons[0], i);

    if (hasSolution(target, [...newState], buttons.slice(1), limit - i)) {
      return true;
    }
  }

  return false;
}

function evaluateAction(state: boolean[], button: Button, count: number) {
  if (count % 2 === 0) {
    return state;
  }
  // invert state if count is odd.
  for (const index of button) {
    state[index] = !state[index];
  }

  return state;
}

function isTarget(target: boolean[], state: boolean[]) {
  for (let i = 0; i < target.length; i++) {
    if (target[i] !== state[i]) {
      return false;
    }
  }

  return true;
}

console.log(count);
console.log("end");
