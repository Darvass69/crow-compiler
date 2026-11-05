import fs from "node:fs";
const source = fs.readFileSync("./src/examples/aoc/2025/puzzle8.txt", "utf-8").replace(new RegExp("\r", "g"), "");

type Position = { x: number; y: number; z: number };
const positions: Position[] = source.split("\n").filter((v) => v).map((line) => {
  const [x, y, z] = line.split(",");
  return { x: Number(x), y: Number(y), z: Number(z) };
});

type Dist = { pos1: Position; pos2: Position; dist: number };
const distances: Dist[] = [];
for (let i = 0; i < positions.length; i++) {
  for (let j = i + 1; j < positions.length; j++) {
    distances.push(calcDist(positions[i], positions[j]));
  }
}
distances.sort((a, b) => a.dist - b.dist);

const circuits: Set<Position>[] = [];
circuits.push(...positions.map((pos) => new Set([pos])));
let nbTraversed = 0;
let lastJoins: { pos1: Position; pos2: Position } | undefined;
while (circuits.length > 1) {
  // get ascending distance
  // connect dist[0]
  // repeat ignoring prev

  // so we can just go from dist[0] to dist[1000], all we have to do is track to which circuit each junction is in,
  // we need to count how many we do and stop at 1000 (10 for example)

  const { pos1, pos2, dist } = distances[nbTraversed];

  // if in the same circuit
  if (circuits.some((circuit) => circuit.has(pos1) && circuit.has(pos2))) {
    nbTraversed++;
  } else {
    lastJoins = { pos1, pos2 };
    join(pos1, pos2);
    nbTraversed++;
  }
}

console.log((lastJoins?.pos1.x ?? 0) * (lastJoins?.pos2.x ?? 0));

function calcDist(pos1: Position, pos2: Position) {
  return {
    pos1,
    pos2,
    dist: Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2) + Math.pow(pos1.z - pos2.z, 2)),
  };
}

function join(pos1: Position, pos2: Position) {
  const c1 = circuits.find((circuit) => circuit.has(pos1));
  const c2 = circuits.find((circuit) => circuit.has(pos2));

  // if c1 || c2
  if (c1 && c2) {
    // if both
    c2.forEach(c1.add, c1);

    //remove c2
    circuits.splice(circuits.findIndex((c) => c === c2), 1);
  } else if (c1 || c2) {
    (c1 || c2)?.add(c1 ? pos2 : pos1);
  } else {
    // if none
    circuits.push(new Set([pos1, pos2]));
  }
}
