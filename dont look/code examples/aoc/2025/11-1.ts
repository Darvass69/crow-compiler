import fs from "node:fs";
const source = fs.readFileSync("./src/examples/aoc/2025/puzzle11.txt", "utf-8").replace(new RegExp("\r", "g"), "");
const lines = source.split("\n").filter((l) => l !== "");

type Device = { name: string; out: string[] };
const devices: Device[] = lines.map((line) => {
  const [name, rest] = line.split(":");
  const out = rest.split(" ").filter((v) => v !== "");
  return { name, out };
});

// nb of different paths from you to out

const start = devices.find((d) => d.name === "you") as Device;

function count_nb_paths(device: Device): number {
  if (device.out.some((out) => out === "out")) {
    return 1;
  }

  return device.out.map((v) => count_nb_paths(devices.find((d) => d.name === v) as Device)).reduce((a, b) => a + b, 0);
}

const total = count_nb_paths(start);

console.log(total);
