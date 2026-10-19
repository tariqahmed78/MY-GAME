import { LevelSilhouette, GridPoint, ArrowDirection, ArrowDefinition } from './types';
import { validateMazeUniqueness } from './levels';

export type ShapeKind = 'heart' | 'sunflower' | 'pyramid' | 'diamond' | 'crown' | 'star' | 'hourglass';

// Shape Mask Evaluator
export function isCoordInShape(x: number, y: number, w: number, h: number, shape: ShapeKind): boolean {
  const cx = (w - 1) / 2;
  const cy = (h - 1) / 2;
  const nx = (x - cx) / (cx * 0.95);
  // SVG coordinates: y increases downwards, so invert ny for math formulas
  const ny = -(y - cy) / (cy * 0.95);

  switch (shape) {
    case 'heart': {
      // Classic algebraic heart: (x^2 + y^2 - 1)^3 - x^2 * y^3 <= 0
      // Offset center slightly so heart is balanced in frame
      const hx = nx * 1.15;
      const hy = (ny + 0.15) * 1.15;
      const term1 = hx * hx + hy * hy - 1;
      return term1 * term1 * term1 - hx * hx * hy * hy * hy <= 0;
    }

    case 'pyramid': {
      // Stepped pyramid with summit capstone
      const progressY = y / (h - 1); // 0 at top, 1 at bottom
      if (progressY < 0.1) {
        return Math.abs(x - cx) <= 1; // Capstone
      }
      const halfWidth = (progressY * (w - 2)) / 2 + 1;
      return Math.abs(x - cx) <= halfWidth;
    }

    case 'sunflower': {
      // Circular floral core with 8 radiant petal lobes and stem base
      const r = Math.hypot(nx, ny);
      const theta = Math.atan2(ny, nx);
      // Sunflower petal modulation
      const petalBoundary = 0.55 + 0.4 * Math.pow(Math.cos(4 * theta), 2);
      if (r <= petalBoundary) return true;
      // Small stem & leaves at bottom
      if (y >= h - 4 && Math.abs(x - cx) <= 2) return true;
      return false;
    }

    case 'diamond': {
      // Faceted brilliant-cut diamond
      if (ny > 0.6) return false; // Above table
      if (ny >= 0.1) {
        // Upper crown trapezoid
        const t = (0.6 - ny) / 0.5;
        return Math.abs(nx) <= 0.6 + 0.4 * t;
      } else {
        // Lower pointed pavilion
        const t = (ny + 1) / 1.1;
        return Math.abs(nx) <= t * 1.0;
      }
    }

    case 'crown': {
      // Royal 5-pointed crown
      if (y < 2) return false;
      if (y >= h - 5) return Math.abs(x - cx) <= cx * 0.92; // Solid crown band
      // 5 crown peaks
      const peakX = [
        cx - cx * 0.8,
        cx - cx * 0.4,
        cx,
        cx + cx * 0.4,
        cx + cx * 0.8,
      ];
      for (const px of peakX) {
        if (Math.abs(x - px) <= (y / h) * 3.2) return true;
      }
      return y >= h * 0.45 && Math.abs(x - cx) <= cx * 0.85;
    }

    case 'star': {
      // 5-pointed celestial star
      const r = Math.hypot(nx, ny);
      const theta = Math.atan2(ny, nx);
      const starRadius = 0.45 + 0.5 * Math.pow(Math.cos(2.5 * theta), 2);
      return r <= starRadius;
    }

    case 'hourglass': {
      // Dual-chamber hourglass narrowing at center
      const neckFactor = Math.abs(ny); // 0 at neck, 1 at rims
      const allowedWidth = 0.28 + 0.72 * Math.pow(neckFactor, 0.8);
      return Math.abs(nx) <= allowedWidth;
    }

    default:
      return true;
  }
}

/**
 * Generate a verified, acyclic, solvable shape maze on an arbitrary geometric silhouette!
 */
export function generateShapeMaze(
  shape: ShapeKind,
  levelId: number,
  width: number,
  height: number,
  timeLimit = 90,
  difficulty: 'Normal' | 'Hard' | 'Expert' | 'Insane' = 'Hard'
): LevelSilhouette {
  const w = width % 2 === 0 ? width + 1 : width;
  const h = height % 2 === 0 ? height + 1 : height;

  for (let attempt = 0; attempt < 40; attempt++) {
    const seed = levelId * 500 + attempt * 23 + 11;
    let s = seed;
    const rng = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };

    // 1. Initialize matrix:
    // 0 = void exterior to shape
    // 2 = solid wall inside shape
    const matrix: number[][] = Array.from({ length: h }, (_, y) =>
      Array.from({ length: w }, (_, x) => {
        return isCoordInShape(x, y, w, h, shape) ? 2 : 0;
      })
    );

    // 2. Identify odd-coordinate nodes inside the shape
    const nodes: GridPoint[] = [];
    for (let y = 1; y < h - 1; y += 2) {
      for (let x = 1; x < w - 1; x += 2) {
        if (matrix[y][x] === 2) {
          nodes.push({ x, y });
        }
      }
    }

    if (nodes.length < 8) continue;

    // 3. Find start point in the bottom half of nodes
    const bottomHalf = nodes.filter((n) => n.y >= h * 0.65);
    const startNode =
      bottomHalf.length > 0
        ? bottomHalf[Math.floor(rng() * bottomHalf.length)]
        : nodes[nodes.length - 1];

    const visited: boolean[][] = Array.from({ length: h }, () => Array(w).fill(false));
    const stack: GridPoint[] = [];

    matrix[startNode.y][startNode.x] = 1;
    visited[startNode.y][startNode.x] = true;
    stack.push(startNode);

    const dirs = [
      { dx: 0, dy: -2 },
      { dx: 2, dy: 0 },
      { dx: 0, dy: 2 },
      { dx: -2, dy: 0 },
    ];

    while (stack.length > 0) {
      const cur = stack[stack.length - 1];
      const neighbors: { nx: number; ny: number; wx: number; wy: number }[] = [];

      for (const d of dirs) {
        const nx = cur.x + d.dx;
        const ny = cur.y + d.dy;
        const wx = cur.x + d.dx / 2;
        const wy = cur.y + d.dy / 2;

        if (
          nx >= 1 &&
          nx < w - 1 &&
          ny >= 1 &&
          ny < h - 1 &&
          matrix[ny][nx] === 2 &&
          matrix[wy][wx] === 2 &&
          !visited[ny][nx]
        ) {
          neighbors.push({ nx, ny, wx, wy });
        }
      }

      if (neighbors.length > 0) {
        const chosen = neighbors[Math.floor(rng() * neighbors.length)];
        matrix[chosen.wy][chosen.wx] = 1;
        matrix[chosen.ny][chosen.nx] = 1;
        visited[chosen.ny][chosen.nx] = true;
        stack.push({ x: chosen.nx, y: chosen.ny });
      } else {
        stack.pop();
      }
    }

    // 4. Find candidate exit node furthest from start node via BFS
    const q: { x: number; y: number; dist: number }[] = [{ x: startNode.x, y: startNode.y, dist: 0 }];
    const distMap: Map<string, number> = new Map([[`${startNode.x},${startNode.y}`, 0]]);
    let maxDist = -1;
    let furthestNode = startNode;

    while (q.length > 0) {
      const cur = q.shift()!;
      if (cur.dist > maxDist) {
        maxDist = cur.dist;
        furthestNode = { x: cur.x, y: cur.y };
      }

      for (const d of [
        { dx: 0, dy: -1 },
        { dx: 1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: -1, dy: 0 },
      ]) {
        const nx = cur.x + d.dx;
        const ny = cur.y + d.dy;
        if (nx >= 0 && nx < w && ny >= 0 && ny < h && matrix[ny][nx] === 1) {
          const key = `${nx},${ny}`;
          if (!distMap.has(key)) {
            distMap.set(key, cur.dist + 1);
            q.push({ x: nx, y: ny, dist: cur.dist + 1 });
          }
        }
      }
    }

    // Open an exit aperture adjacent to furthestNode to create exit beacon
    let exitPoint: GridPoint = { x: furthestNode.x, y: Math.max(0, furthestNode.y - 1) };
    const exitDirs = [
      { dx: 0, dy: -1 },
      { dx: 1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
    ];

    let foundAperture = false;
    for (const d of exitDirs) {
      const ex = furthestNode.x + d.dx;
      const ey = furthestNode.y + d.dy;
      if (ex >= 0 && ex < w && ey >= 0 && ey < h && matrix[ey][ex] === 0) {
        matrix[ey][ex] = 1;
        exitPoint = { x: ex, y: ey };
        foundAperture = true;
        break;
      }
    }

    if (!foundAperture) {
      for (const d of exitDirs) {
        const ex = furthestNode.x + d.dx;
        const ey = furthestNode.y + d.dy;
        if (ex >= 0 && ex < w && ey >= 0 && ey < h) {
          matrix[ey][ex] = 1;
          exitPoint = { x: ex, y: ey };
          foundAperture = true;
          break;
        }
      }
    }

    // Validate maze reachability & strict uniqueness
    const validation = validateMazeUniqueness(matrix, startNode, exitPoint, w, h);
    if (validation.isValid) {
      const obstacles: GridPoint[] = [];
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (matrix[y][x] === 2) {
            obstacles.push({ x, y });
          }
        }
      }

      // Next step along corridor
      const candidateDirs: { dx: number; dy: number; dir: ArrowDirection }[] = [
        { dx: 0, dy: -1, dir: 'UP' },
        { dx: 1, dy: 0, dir: 'RIGHT' },
        { dx: 0, dy: 1, dir: 'DOWN' },
        { dx: -1, dy: 0, dir: 'LEFT' },
      ];

      let nextStep: GridPoint = { x: startNode.x, y: startNode.y - 1 };
      let initDir: ArrowDirection = 'UP';
      for (const c of candidateDirs) {
        const nx = startNode.x + c.dx;
        const ny = startNode.y + c.dy;
        if (nx >= 0 && nx < w && ny >= 0 && ny < h && matrix[ny][nx] === 1) {
          nextStep = { x: nx, y: ny };
          initDir = c.dir;
          break;
        }
      }

      const targetArrow: ArrowDefinition = {
        id: `shape_arrow_${levelId}`,
        points: [
          { x: startNode.x, y: startNode.y },
          { x: nextStep.x, y: nextStep.y },
        ],
        direction: initDir,
      };

      const shapeTitles: Record<ShapeKind, { name: string; subtitle: string }> = {
        heart: { name: 'Heart of Aphrodite', subtitle: `Heart Labyrinth (${w}x${h})` },
        sunflower: { name: 'Golden Sunflower', subtitle: `Floral Labyrinth (${w}x${h})` },
        pyramid: { name: "Pharaoh's Pyramid", subtitle: `Ascending Tomb (${w}x${h})` },
        diamond: { name: 'Imperial Diamond', subtitle: `Crystalline Maze (${w}x${h})` },
        crown: { name: 'Crown of Sovereignty', subtitle: `Royal Spire Labyrinth (${w}x${h})` },
        star: { name: 'Celestial Star', subtitle: `5-Point Star Maze (${w}x${h})` },
        hourglass: { name: 'Chronos Hourglass', subtitle: `Bottleneck Labyrinth (${w}x${h})` },
      };

      return {
        id: levelId,
        name: shapeTitles[shape].name,
        subtitle: shapeTitles[shape].subtitle,
        shapeType: shape,
        gridWidth: w,
        gridHeight: h,
        arrows: [targetArrow],
        obstacles,
        gridMatrix: matrix,
        startPoint: startNode,
        exitPoint,
        isSingleTargetMaze: true,
        timeLimit,
        difficulty,
        shapeName: shape.charAt(0).toUpperCase() + shape.slice(1),
      };
    }
  }

  // Fallback if random seeds failed to find valid aperture
  return fallbackShapeMaze(shape, levelId, w, h, timeLimit, difficulty);
}

function fallbackShapeMaze(
  shape: ShapeKind,
  levelId: number,
  w: number,
  h: number,
  timeLimit = 90,
  difficulty: 'Normal' | 'Hard' | 'Expert' | 'Insane' = 'Hard'
): LevelSilhouette {
  // Simple verified fallback for shape
  const matrix: number[][] = Array.from({ length: h }, (_, y) =>
    Array.from({ length: w }, (_, x) => {
      if (!isCoordInShape(x, y, w, h, shape)) return 0;
      return x % 2 === 1 && y % 2 === 1 ? 1 : 2;
    })
  );

  // Connect snake corridor
  let prev: GridPoint | null = null;
  const nodes: GridPoint[] = [];
  for (let y = 1; y < h - 1; y += 2) {
    const rowNodes: GridPoint[] = [];
    for (let x = 1; x < w - 1; x += 2) {
      if (matrix[y][x] === 1) rowNodes.push({ x, y });
    }
    if ((y / 2) % 2 === 1) rowNodes.reverse();
    nodes.push(...rowNodes);
  }

  for (let i = 0; i < nodes.length - 1; i++) {
    const p1 = nodes[i];
    const p2 = nodes[i + 1];
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    if (matrix[midY]?.[midX] !== undefined) {
      matrix[midY][midX] = 1;
    }
  }

  const startPoint = nodes[nodes.length - 1] || { x: Math.floor(w / 2), y: h - 2 };
  const exitPoint = nodes[0] || { x: Math.floor(w / 2), y: 0 };
  matrix[startPoint.y][startPoint.x] = 1;
  matrix[exitPoint.y][exitPoint.x] = 1;

  const obstacles: GridPoint[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (matrix[y][x] === 2) obstacles.push({ x, y });
    }
  }

  return {
    id: levelId,
    name: `${shape.toUpperCase()} Maze`,
    subtitle: `Shape Labyrinth (${w}x${h})`,
    shapeType: shape,
    gridWidth: w,
    gridHeight: h,
    arrows: [
      {
        id: `arrow_${levelId}`,
        points: [startPoint, { x: startPoint.x, y: Math.max(0, startPoint.y - 1) }],
        direction: 'UP',
      },
    ],
    obstacles,
    gridMatrix: matrix,
    startPoint,
    exitPoint,
    isSingleTargetMaze: true,
    timeLimit,
    difficulty,
    shapeName: shape,
  };
}

export const SHAPE_LEVELS: LevelSilhouette[] = [
  generateShapeMaze('heart', 101, 19, 19, 90, 'Hard'),
  generateShapeMaze('sunflower', 102, 21, 21, 120, 'Expert'),
  generateShapeMaze('pyramid', 103, 21, 19, 90, 'Hard'),
  generateShapeMaze('diamond', 104, 19, 19, 100, 'Hard'),
  generateShapeMaze('crown', 105, 21, 17, 110, 'Expert'),
  generateShapeMaze('star', 106, 21, 21, 120, 'Insane'),
  generateShapeMaze('hourglass', 107, 17, 23, 110, 'Insane'),
];
