import fs from "node:fs";
const source = fs.readFileSync("./src/examples/aoc/2025/puzzle9.txt", "utf-8").replace(new RegExp("\r", "g"), "");
const lines = source.split("\n");

type Position = { x: number; y: number };
const tiles = lines.map((line) => {
  const [x, y] = line.split(",");
  return { x: Number(x), y: Number(y) };
});

type Edge = [pos1: Position, pos2: Position];

const horizontalEdges: Edge[] = [];
const verticalEdges: Edge[] = [];
for (let i = 0; i < tiles.length; i++) {
  const pos1 = tiles[i];
  let pos2 = tiles[i + 1];

  if (i === tiles.length - 1) {
    pos2 = tiles[0];
  }

  //! What if 2 lines at same place? #XXXX#XXXX#
  if (pos1.y === pos2.y) {
    horizontalEdges.push([pos1, pos2]);
  }
  if (pos1.x === pos2.x) {
    verticalEdges.push([pos1, pos2]);
  }
}

// check every rectangle possible
// start with pos1 and go x/y towards pos2
//    the only way we could be outside is if:
//      1. we started towards the outside of the shape -> check lines that connect and if we go in the wrong direction, we can abort
//      2. intersect a line from another corner (go over the line)
//        how do we establish lines? lines.hor [x1,x2], lines.ver [y1,y2]
//        how do we know we are inside? we only have to know if we built it clockwise or counter clockwise (fill right or left)

function isValid(tile1: Position, tile2: Position): boolean {
  const startEdgeH = horizontalEdges.find((edge) => edge[0] === tile1 || edge[1] === tile1) as Edge;
  const startEdgeV = verticalEdges.find((edge) => edge[0] === tile1 || edge[1] === tile1) as Edge;
  const endEdgeH = horizontalEdges.find((edge) => edge[0] === tile2 || edge[1] === tile2) as Edge;
  const endEdgeV = verticalEdges.find((edge) => edge[0] === tile2 || edge[1] === tile2) as Edge;

  //1. find if we are already going outside the shape

  let yDir = Math.sign(tile2.y - tile1.y);
  let xDir = Math.sign(tile2.x - tile1.x);

  const testPoint: Position = {
    x: tile1.x + xDir,
    y: tile1.y + yDir,
  };

  // if odd intersection to edge, we are inside
  const hIntersect = horizontalEdges.filter((edge) => isWithin(testPoint.x, [edge[0].x, edge[1].x], true) && edge[0].y <= testPoint.y);
  if (hIntersect.length % 2 === 0) {
    return false;
  }

  //2. find all edges in x,y that could cause problems (contains coords within bounds)

  // iterate bounds (x and y), if at any point we go over an edge and exit the shape, its not valid
  // get all intersection edges that aren't the start and end line

  const hEdgeIntersect = horizontalEdges.filter((v) => !(v === startEdgeH || v === endEdgeH)).filter((edge) => {
    if (edge === startEdgeH || edge === endEdgeH) {
      return false;
    }

    // check edge.y within tile1.y && tile2.y
    if (isWithin(edge[0].y, [tile1.y, tile2.y])) {
      // 2 cases:
      //    tile.x is within edge range (exclusive)
      if (isWithin(tile1.x, [edge[0].x, edge[1].x]) || isWithin(tile2.x, [edge[0].x, edge[1].x])) {
        return true;
      } // edge has a point inside the shape
      else if (isWithin(edge[0].x, [tile1.x, tile2.x]) || isWithin(edge[1].x, [tile1.x, tile2.x])) {
        return true;
      } else if (isWithin(edge[0].x, [tile1.x, tile2.x], true) && isWithin(edge[1].x, [tile1.x, tile2.x], true)) {
        return true;
      }
    }

    return false;
  });
  const vEdgeIntersect = verticalEdges.filter((v) => !(v === startEdgeV || v === endEdgeV)).filter((edge) => {
    if (edge === startEdgeV || edge === endEdgeV) {
      return false;
    }

    // check edge.x within tile1.x && tile2.x
    if (isWithin(edge[0].x, [tile1.x, tile2.x])) {
      // 2 cases:
      //    tile.y is within edge range (exclusive)
      if (isWithin(tile1.y, [edge[0].y, edge[1].y]) || isWithin(tile2.y, [edge[0].y, edge[1].y])) {
        return true;
      } // edge has a point inside the shape
      else if (isWithin(edge[0].y, [tile1.y, tile2.y]) || isWithin(edge[1].y, [tile1.y, tile2.y])) {
        return true;
      } else if (isWithin(edge[0].y, [tile1.y, tile2.y], true) && isWithin(edge[1].y, [tile1.y, tile2.y], true)) {
        return true;
      }
    }

    return false;
  });

  if (hEdgeIntersect.length === 0 && vEdgeIntersect.length === 0) {
    return true;
  }
  return false;
}

function isWithin(value: number, range: [number, number], inclusive = false) {
  const result = range[0] < value && value < range[1] ||
    range[1] < value && value < range[0];

  if (inclusive) {
    return result || value === range[0] || value === range[1];
  }
  return result;
}

let maxArea = 0;
tiles.forEach((tile1, i) => {
  tiles.forEach((tile2, i) => {
    if (tile1 !== tile2 && isValid(tile1, tile2)) {
      const newArea = (Math.abs(tile1.x - tile2.x) + 1) * (Math.abs(tile1.y - tile2.y) + 1);
      if (newArea > maxArea) {
        maxArea = newArea;
      }
    }
  });
});

console.log(maxArea);
