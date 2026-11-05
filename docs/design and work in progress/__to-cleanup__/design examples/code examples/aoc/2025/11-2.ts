import fs from "node:fs";
const source = fs.readFileSync("./src/examples/aoc/2025/puzzle11.txt", "utf-8").replace(new RegExp("\r", "g"), "");
const lines = source.split("\n").filter((l) => l !== "");

type Device = { name: string; out: string[] };
const devices: Device[] = lines.map((line) => {
  const [name, rest] = line.split(":");
  const out = rest.split(" ").filter((v) => v !== "");
  return { name, out };
});

// nb of different paths from svr to out that pass by both fft and dac

const start = devices.find((d) => d.name === "svr") as Device;

const memo: {
  [name: string]: Count;
} = {};

type Count = { none: number; fft: number; dac: number; both: number };
function count_nb_paths(device: Device): Count {
  let count: Count;
  if (count = memo[device.name]) {
    return { ...count };
  }

  if (device.out.some((out) => out === "out")) {
    return { none: 1, fft: 0, dac: 0, both: 0 };
  }

  count = device.out.map((v) => {
    const device = devices.find((d) => d.name === v) as Device;
    let count = count_nb_paths(device);

    if (device.name === "fft") {
      count = {
        none: 0,
        fft: count.none + count.fft,
        dac: 0,
        both: count.dac + count.both,
      };
    }

    if (device.name === "dac") {
      count = {
        none: 0,
        fft: 0,
        dac: count.none + count.dac,
        both: count.fft + count.both,
      };
    }

    memo[device.name] = { ...count };
    return count;
  }).reduce((a, b) => {
    return {
      none: a.none + b.none,
      fft: a.fft + b.fft,
      dac: a.dac + b.dac,
      both: a.both + b.both,
    };
  });

  return count;
}

const total = count_nb_paths(start);

console.log(total);
