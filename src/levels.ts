import { ArrowDefinition, LevelSilhouette, ArrowDirection, GridPoint, MazeEscapeResult } from './types';

// Distance from point to line segment
export function distToSegment(p: GridPoint, v: GridPoint, w: GridPoint): number {
  const l2 = (v.x - w.x) * (v.x - w.x) + (v.y - w.y) * (v.y - w.y);
  if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
}

// Distance from point to any segment of an arrow
export function pointHitsArrow(px: number, py: number, arrow: ArrowDefinition, threshold: number): boolean {
  for (let i = 0; i < arrow.points.length - 1; i++) {
    const p1 = arrow.points[i];
    const p2 = arrow.points[i + 1];
    const dist = distToSegment({ x: px, y: py }, p1, p2);
    if (dist <= threshold) {
      return true;
    }
  }
  return false;
}

// Check if a coordinate hits any static obstacle cell (radius 0.52 to fit standard grid unit)
export function checkHitObstacle(
  x: number,
  y: number,
  obstacles: GridPoint[],
  radius = 0.52
): GridPoint | null {
  for (const obs of obstacles) {
    if (Math.abs(obs.x - x) <= radius && Math.abs(obs.y - y) <= radius) {
      return obs;
    }
  }
  return null;
}

// Check if a coordinate hits any other active arrow
export function checkHitOtherArrows(
  x: number,
  y: number,
  otherArrows: ArrowDefinition[],
  threshold = 0.42
): ArrowDefinition | null {
  for (const other of otherArrows) {
    if (pointHitsArrow(x, y, other, threshold)) {
      return other;
    }
  }
  return null;
}

// Simplify path by removing collinear waypoints so only corners remain
export function simplifyCollinearPath(points: GridPoint[]): GridPoint[] {
  if (points.length <= 2) return points;
  const result: GridPoint[] = [points[0]];

  for (let i = 1; i < points.length - 1; i++) {
    const prev = result[result.length - 1];
    const curr = points[i];
    const next = points[i + 1];

    const dx1 = curr.x - prev.x;
    const dy1 = curr.y - prev.y;
    const dx2 = next.x - curr.x;
    const dy2 = next.y - curr.y;

    const crossProduct = Math.abs(dx1 * dy2 - dy1 * dx2);
    if (crossProduct > 0.001) {
      result.push(curr);
    }
  }

  result.push(points[points.length - 1]);
  return result;
}

/**
 * Formal 2D Grid Maze Pathfinding:
 * Arrows do NOT simply fly in an infinite linear vector.
 * They must navigate through the maze corridors around static obstacles and other arrows to reach the boundary!
 */
export function checkMazeNavigation(
  arrow: ArrowDefinition,
  allActiveArrows: ArrowDefinition[],
  obstacles: GridPoint[] = [],
  bounds: { width: number; height: number },
  gridMatrix?: number[][],
  exitPoint?: GridPoint
): MazeEscapeResult {
  const head = arrow.points[arrow.points.length - 1];
  const otherArrows = allActiveArrows.filter((a) => a.id !== arrow.id);

  // If gridMatrix is provided (Static Maze mode)
  if (gridMatrix && gridMatrix.length > 0) {
    const height = gridMatrix.length;
    const width = gridMatrix[0].length;
    const startX = Math.round(head.x);
    const startY = Math.round(head.y);

    // BFS through open corridor tiles (cell === 1) to exitPoint or boundary
    interface GridNode {
      x: number;
      y: number;
      parent?: GridNode;
    }

    const queue: GridNode[] = [{ x: startX, y: startY }];
    const visited = new Set<string>();
    visited.add(`${startX},${startY}`);

    let targetNode: GridNode | null = null;
    const dirs = [
      { dx: 0, dy: -1 },
      { dx: 1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
    ];

    while (queue.length > 0) {
      const cur = queue.shift()!;

      // Target reached: either specified exitPoint or outer border aperture
      if (
        (exitPoint && cur.x === exitPoint.x && cur.y === exitPoint.y) ||
        (!exitPoint && (cur.x === 0 || cur.x === width - 1 || cur.y === 0 || cur.y === height - 1))
      ) {
        targetNode = cur;
        break;
      }

      for (const d of dirs) {
        const nx = cur.x + d.dx;
        const ny = cur.y + d.dy;
        const key = `${nx},${ny}`;

        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        if (visited.has(key)) continue;

        // Must be a walkable corridor (1)
        if (gridMatrix[ny][nx] !== 1) continue;

        visited.add(key);
        queue.push({ x: nx, y: ny, parent: cur });
      }
    }

    if (targetNode) {
      const rawPath: GridPoint[] = [];
      let c: GridNode | undefined = targetNode;
      while (c) {
        rawPath.unshift({ x: c.x, y: c.y });
        c = c.parent;
      }

      // Add exterior exit waypoint past the maze perimeter
      const last = rawPath[rawPath.length - 1];
      let offX = last.x;
      let offY = last.y;
      if (last.y <= 0) offY = -4;
      else if (last.y >= height - 1) offY = height + 3;
      else if (last.x <= 0) offX = -4;
      else if (last.x >= width - 1) offX = width + 3;
      else offY = -4;

      rawPath.push({ x: offX, y: offY });
      const escapePath = simplifyCollinearPath([head, ...rawPath]);

      return {
        canEscape: true,
        escapePath,
      };
    }
  }

  let dirX = 0;
  let dirY = 0;
  switch (arrow.direction) {
    case 'UP':
      dirY = -1;
      break;
    case 'DOWN':
      dirY = 1;
      break;
    case 'LEFT':
      dirX = -1;
      break;
    case 'RIGHT':
      dirX = 1;
      break;
  }

  // 1. Initial Forward Step Check:
  // The arrowhead must have an open corridor immediately ahead in its direction
  const launchDist = 0.5;
  const launchX = head.x + dirX * launchDist;
  const launchY = head.y + dirY * launchDist;

  // Immediate obstacle hit
  const immediateObs = checkHitObstacle(launchX, launchY, obstacles);
  if (immediateObs) {
    return {
      canEscape: false,
      blockerType: 'obstacle',
      obstacleCoord: immediateObs,
    };
  }

  // Immediate arrow hit
  const immediateArrow = checkHitOtherArrows(launchX, launchY, otherArrows);
  if (immediateArrow) {
    return {
      canEscape: false,
      blockerType: 'arrow',
      blockerId: immediateArrow.id,
    };
  }

  // If already at boundary edge, it escapes immediately
  if (launchX <= 0.2 || launchX >= bounds.width - 0.2 || launchY <= 0.2 || launchY >= bounds.height - 0.2) {
    const exitX = head.x + dirX * (bounds.width + 4);
    const exitY = head.y + dirY * (bounds.height + 4);
    return {
      canEscape: true,
      escapePath: [head, { x: launchX, y: launchY }, { x: exitX, y: exitY }],
    };
  }

  // 2. Maze Pathfinding (BFS through open corridors around obstacles)
  interface PathNode {
    x: number;
    y: number;
    lastDx: number;
    lastDy: number;
    parent?: PathNode;
  }

  const startNode: PathNode = {
    x: Math.round(launchX * 2) / 2,
    y: Math.round(launchY * 2) / 2,
    lastDx: dirX,
    lastDy: dirY,
  };

  const queue: PathNode[] = [startNode];
  const visited = new Set<string>();
  visited.add(`${startNode.x},${startNode.y}`);

  let exitFoundNode: PathNode | null = null;
  let firstBlockedObstacle: GridPoint | null = null;
  let firstBlockedArrow: ArrowDefinition | null = null;

  let iterations = 0;
  const MAX_ITERATIONS = 700;

  while (queue.length > 0 && iterations < MAX_ITERATIONS) {
    iterations++;
    const current = queue.shift()!;

    // Reached boundary edge of the maze!
    if (
      current.x <= 0.4 ||
      current.x >= bounds.width - 0.4 ||
      current.y <= 0.4 ||
      current.y >= bounds.height - 0.4
    ) {
      exitFoundNode = current;
      break;
    }

    // Corridor moves: prioritize forward momentum, then 90-degree corner turns
    const candidateDirs = [
      { dx: current.lastDx, dy: current.lastDy }, // forward
      { dx: -current.lastDy, dy: current.lastDx }, // turn left
      { dx: current.lastDy, dy: -current.lastDx }, // turn right
    ];

    const stepDist = 0.5;

    for (const d of candidateDirs) {
      const nextX = Math.round((current.x + d.dx * stepDist) * 2) / 2;
      const nextY = Math.round((current.y + d.dy * stepDist) * 2) / 2;
      const key = `${nextX},${nextY}`;

      if (visited.has(key)) continue;
      visited.add(key);

      // Check obstacle collision
      const obsHit = checkHitObstacle(nextX, nextY, obstacles, 0.5);
      if (obsHit) {
        if (!firstBlockedObstacle) firstBlockedObstacle = obsHit;
        continue;
      }

      // Check collision with other active arrows
      const arrowHit = checkHitOtherArrows(nextX, nextY, otherArrows, 0.42);
      if (arrowHit) {
        if (!firstBlockedArrow) firstBlockedArrow = arrowHit;
        continue;
      }

      queue.push({
        x: nextX,
        y: nextY,
        lastDx: d.dx,
        lastDy: d.dy,
        parent: current,
      });
    }
  }

  if (exitFoundNode) {
    const rawPath: GridPoint[] = [];
    let curr: PathNode | undefined = exitFoundNode;
    while (curr) {
      rawPath.unshift({ x: curr.x, y: curr.y });
      curr = curr.parent;
    }

    // Add exit overshoot waypoint outside the board
    const last = rawPath[rawPath.length - 1];
    const offscreenX = last.x + exitFoundNode.lastDx * (bounds.width + 4);
    const offscreenY = last.y + exitFoundNode.lastDy * (bounds.height + 4);
    rawPath.push({ x: offscreenX, y: offscreenY });

    const escapePath = simplifyCollinearPath([head, ...rawPath]);

    return {
      canEscape: true,
      escapePath,
    };
  }

  if (firstBlockedObstacle) {
    return {
      canEscape: false,
      blockerType: 'obstacle',
      obstacleCoord: firstBlockedObstacle,
    };
  }

  if (firstBlockedArrow) {
    return {
      canEscape: false,
      blockerType: 'arrow',
      blockerId: firstBlockedArrow.id,
    };
  }

  return {
    canEscape: false,
    blockerType: 'obstacle',
  };
}

// Backward-compatible wrapper
export function checkRayClearance(
  arrow: ArrowDefinition,
  allActiveArrows: ArrowDefinition[],
  bounds: { width: number; height: number },
  obstacles: GridPoint[] = [],
  gridMatrix?: number[][],
  exitPoint?: GridPoint
): { canEscape: boolean; blockerId?: string; escapePath?: GridPoint[]; obstacleCoord?: GridPoint; blockerType?: 'obstacle' | 'arrow' } {
  const res = checkMazeNavigation(arrow, allActiveArrows, obstacles, bounds, gridMatrix, exitPoint);
  return {
    canEscape: res.canEscape,
    blockerId: res.blockerId,
    escapePath: res.escapePath,
    obstacleCoord: res.obstacleCoord,
    blockerType: res.blockerType,
  };
}

// Find all currently unblocked arrows that can navigate out of the maze
export function findSolvableArrows(
  activeArrows: ArrowDefinition[],
  bounds: { width: number; height: number },
  obstacles: GridPoint[] = [],
  gridMatrix?: number[][],
  exitPoint?: GridPoint
): ArrowDefinition[] {
  return activeArrows.filter((arrow) => checkMazeNavigation(arrow, activeArrows, obstacles, bounds, gridMatrix, exitPoint).canEscape);
}

// Helper to safely place obstacle cells so they do not overlap arrow bodies
export function placeSafeObstacles(
  candidates: [number, number][],
  arrows: ArrowDefinition[],
  clearance = 0.58
): GridPoint[] {
  return candidates
    .filter(([x, y]) => {
      for (const a of arrows) {
        if (pointHitsArrow(x, y, a, clearance)) return false;
      }
      return true;
    })
    .map(([x, y]) => ({ x, y }));
}

import {
  createLevel1,
  createLevel2,
  createLevel3,
  createLevel4,
  createLevel5,
  createLevel6,
  createLevel7,
  createLevel8,
  createLevel9,
  createLevel10,
  createStaticMazeLevel,
  STATIC_MAZE_LEVELS,
} from './staticLevels';
import { SHAPE_LEVELS, generateShapeMaze, isCoordInShape } from './shapeLevels';

export {
  createLevel1,
  createLevel2,
  createLevel3,
  createLevel4,
  createLevel5,
  createLevel6,
  createLevel7,
  createLevel8,
  createLevel9,
  createLevel10,
  createStaticMazeLevel,
  STATIC_MAZE_LEVELS,
  SHAPE_LEVELS,
  generateShapeMaze,
  isCoordInShape,
};

export const PRESET_LEVELS: LevelSilhouette[] = [...STATIC_MAZE_LEVELS, ...SHAPE_LEVELS];

// Procedural generator returning guaranteed single-arrow static mazes
export function generateProceduralLevel(levelNumber: number, _shape?: string): LevelSilhouette {
  return generateSolvableSingleTargetMaze(levelNumber);
}

/**
 * Derives a complete 2D integer matrix where:
 * 0 = empty space / void
 * 1 = walkable path corridor
 * 2 = static wall / obstacle
 */
export function buildGridMatrixForLevel(level: LevelSilhouette): number[][] {
  if (level.gridMatrix && level.gridMatrix.length === level.gridHeight) {
    return level.gridMatrix;
  }

  const matrix: number[][] = Array.from({ length: level.gridHeight }, () =>
    Array(level.gridWidth).fill(0)
  );

  // 1. Mark Obstacles as 2
  for (const obs of level.obstacles) {
    const ox = Math.round(obs.x);
    const oy = Math.round(obs.y);
    if (ox >= 0 && ox < level.gridWidth && oy >= 0 && oy < level.gridHeight) {
      matrix[oy][ox] = 2;
    }
  }

  // 2. Mark arrow points and their connecting corridor segments as 1 (Path)
  for (const arrow of level.arrows) {
    for (let i = 0; i < arrow.points.length - 1; i++) {
      const p1 = arrow.points[i];
      const p2 = arrow.points[i + 1];

      const minX = Math.min(Math.round(p1.x), Math.round(p2.x));
      const maxX = Math.max(Math.round(p1.x), Math.round(p2.x));
      const minY = Math.min(Math.round(p1.y), Math.round(p2.y));
      const maxY = Math.max(Math.round(p1.y), Math.round(p2.y));

      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          if (x >= 0 && x < level.gridWidth && y >= 0 && y < level.gridHeight) {
            if (matrix[y][x] !== 2) {
              matrix[y][x] = 1;
            }
          }
        }
      }
    }

    // Also mark exit corridors forward from arrow tips to board perimeter
    const tip = arrow.points[arrow.points.length - 1];
    let dx = 0;
    let dy = 0;
    if (arrow.direction === 'UP') dy = -1;
    if (arrow.direction === 'DOWN') dy = 1;
    if (arrow.direction === 'LEFT') dx = -1;
    if (arrow.direction === 'RIGHT') dx = 1;

    let curX = Math.round(tip.x) + dx;
    let curY = Math.round(tip.y) + dy;
    while (curX >= 0 && curX < level.gridWidth && curY >= 0 && curY < level.gridHeight) {
      if (matrix[curY][curX] === 2) break; // blocked by wall
      matrix[curY][curX] = 1;
      curX += dx;
      curY += dy;
    }
  }

  return matrix;
}

/**
 * Dual BFS/DFS Graph Traversal Maze Validator:
 * Runs before any level begins to guarantee:
 * a. REACHABILITY & SHORTEST PATH (BFS): Confirms exit is reachable and determines optimal steps
 * b. STRICT SINGLE-PATH UNIQUENESS (DFS): Exactly 1 simple path connects start to exit
 * c. ACYCLIC CORRIDORS (DFS): Detects loops/cycles that could create alternate routing
 * d. PERIMETER INTEGRITY: Exactly 1 exit aperture on the outer boundary
 */
export function validateMazeUniqueness(
  gridMatrix: number[][],
  start: GridPoint,
  exit: GridPoint,
  width: number,
  height: number,
  disallowCycles = true
): {
  isValid: boolean;
  pathLength: number;
  shortestDistance: number;
  totalPaths: number;
  cycleCount: number;
  path: GridPoint[];
  reason?: string;
} {
  if (gridMatrix[start.y]?.[start.x] !== 1) {
    return { isValid: false, pathLength: 0, shortestDistance: -1, totalPaths: 0, cycleCount: 0, path: [], reason: 'Start point is not on a path tile' };
  }
  if (gridMatrix[exit.y]?.[exit.x] !== 1) {
    return { isValid: false, pathLength: 0, shortestDistance: -1, totalPaths: 0, cycleCount: 0, path: [], reason: 'Exit point is not on a path tile' };
  }

  // 1. Check perimeter open exits: strictly ONE exit on perimeter (unless start is also on boundary)
  let perimeterExits = 0;
  for (let x = 0; x < width; x++) {
    if (gridMatrix[0]?.[x] === 1) perimeterExits++;
    if (height > 1 && gridMatrix[height - 1]?.[x] === 1) perimeterExits++;
  }
  for (let y = 1; y < height - 1; y++) {
    if (gridMatrix[y]?.[0] === 1) perimeterExits++;
    if (width > 1 && gridMatrix[y]?.[width - 1] === 1) perimeterExits++;
  }

  const startIsBoundary = start.x === 0 || start.x === width - 1 || start.y === 0 || start.y === height - 1;
  const maxAllowedPerimeter = startIsBoundary ? 2 : 1;
  if (perimeterExits > maxAllowedPerimeter) {
    return {
      isValid: false,
      pathLength: 0,
      shortestDistance: -1,
      totalPaths: 0,
      cycleCount: 0,
      path: [],
      reason: `Multiple perimeter openings found (${perimeterExits}). Must have strictly 1 exit.`,
    };
  }

  // 2. BFS Traversal: Validate reachability of Exit and compute shortest distance
  const bfsQueue: { x: number; y: number; dist: number }[] = [{ x: start.x, y: start.y, dist: 0 }];
  const bfsVisited = new Set<string>();
  bfsVisited.add(`${start.x},${start.y}`);

  let shortestDistance = -1;
  let exitReachedViaBFS = false;

  const cardinalDirs = [
    { dx: 0, dy: -1 },
    { dx: 1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
  ];

  while (bfsQueue.length > 0) {
    const curr = bfsQueue.shift()!;
    if (curr.x === exit.x && curr.y === exit.y) {
      exitReachedViaBFS = true;
      shortestDistance = curr.dist;
      break;
    }

    for (const d of cardinalDirs) {
      const nx = curr.x + d.dx;
      const ny = curr.y + d.dy;
      if (nx >= 0 && nx < width && ny >= 0 && ny < height && gridMatrix[ny]?.[nx] === 1) {
        const key = `${nx},${ny}`;
        if (!bfsVisited.has(key)) {
          bfsVisited.add(key);
          bfsQueue.push({ x: nx, y: ny, dist: curr.dist + 1 });
        }
      }
    }
  }

  if (!exitReachedViaBFS) {
    return {
      isValid: false,
      pathLength: 0,
      shortestDistance: -1,
      totalPaths: 0,
      cycleCount: 0,
      path: [],
      reason: 'BFS Traversal: Exit is completely unreachable from Start beacon',
    };
  }

  // 3. DFS Traversal: Exhaustive path enumeration & cycle detection
  let foundPaths = 0;
  let cycleCount = 0;
  let singleSolutionPath: GridPoint[] = [];
  const inPathStack: boolean[][] = Array.from({ length: height }, () => Array(width).fill(false));

  const dfs = (x: number, y: number, parentX: number, parentY: number, currentPath: GridPoint[]) => {
    if (foundPaths > 1) return; // Short-circuit if non-unique
    if (x === exit.x && y === exit.y) {
      foundPaths++;
      if (foundPaths === 1) {
        singleSolutionPath = [...currentPath];
      }
      return;
    }

    inPathStack[y][x] = true;

    for (const d of cardinalDirs) {
      const nx = x + d.dx;
      const ny = y + d.dy;
      if (nx >= 0 && nx < width && ny >= 0 && ny < height && gridMatrix[ny]?.[nx] === 1) {
        if (inPathStack[ny][nx]) {
          if (nx !== parentX || ny !== parentY) {
            cycleCount++;
          }
          continue;
        }

        currentPath.push({ x: nx, y: ny });
        dfs(nx, ny, x, y, currentPath);
        currentPath.pop();
      }
    }

    inPathStack[y][x] = false;
  };

  dfs(start.x, start.y, -1, -1, [start]);

  if (foundPaths === 0) {
    return {
      isValid: false,
      pathLength: 0,
      shortestDistance,
      totalPaths: 0,
      cycleCount,
      path: [],
      reason: 'DFS Traversal: No simple path connects start to exit',
    };
  }
  if (foundPaths > 1) {
    return {
      isValid: false,
      pathLength: 0,
      shortestDistance,
      totalPaths: foundPaths,
      cycleCount,
      path: [],
      reason: `DFS Traversal: Multiple valid paths or shortcuts exist (${foundPaths} paths found). Maze must have strictly 1 solution.`,
    };
  }
  if (disallowCycles && cycleCount > 0) {
    return {
      isValid: false,
      pathLength: 0,
      shortestDistance,
      totalPaths: foundPaths,
      cycleCount,
      path: [],
      reason: `DFS Traversal: Cyclic loop detected (${cycleCount} loops). Mazes must be strictly acyclic.`,
    };
  }

  return {
    isValid: true,
    pathLength: singleSolutionPath.length,
    shortestDistance,
    totalPaths: 1,
    cycleCount: 0,
    path: singleSolutionPath,
  };
}

/**
 * Creates a procedurally generated 2D grid with randomized obstacles and a single target arrow,
 * guaranteed to be solvable and uniquely validated by PathSolver and MazeValidator.
 * Generates an intricate, confusing labyrinth with deceptive branching corridors and dead ends.
 */
export function generateSolvableSingleTargetMaze(
  levelId: number,
  width = 15,
  height = 19
): LevelSilhouette {
  // Ensure dimensions are odd for proper 1-tile corridor labyrinth topology
  const w = width % 2 === 0 ? width + 1 : width;
  const h = height % 2 === 0 ? height + 1 : height;

  for (let attempt = 0; attempt < 30; attempt++) {
    const seed = levelId * 100 + attempt * 17 + 7;
    let s = seed;
    const rng = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };

    // 1. Initialize matrix with static walls (2)
    const matrix: number[][] = Array.from({ length: h }, () => Array(w).fill(2));
    const visited: boolean[][] = Array.from({ length: h }, () => Array(w).fill(false));
    const stack: { x: number; y: number }[] = [];

    // 2. Start point on odd coordinate near bottom
    const startX = 1 + 2 * Math.floor(rng() * Math.floor((w - 2) / 2));
    const startY = h - 2;

    matrix[startY][startX] = 1;
    visited[startY][startX] = true;
    stack.push({ x: startX, y: startY });

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
        if (nx >= 1 && nx < w - 1 && ny >= 1 && ny < h - 1 && !visited[ny][nx]) {
          neighbors.push({ nx, ny, wx: cur.x + d.dx / 2, wy: cur.y + d.dy / 2 });
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

    // 3. Find candidate exit on top row (y = 1) furthest from start
    let bestExitX = 1;
    let maxDist = -1;

    for (let x = 1; x < w - 1; x += 2) {
      if (matrix[1][x] === 1) {
        const q: { x: number; y: number; dist: number }[] = [{ x: startX, y: startY, dist: 0 }];
        const vis = new Set<string>([`${startX},${startY}`]);
        let dist = -1;

        while (q.length > 0) {
          const c = q.shift()!;
          if (c.x === x && c.y === 1) {
            dist = c.dist;
            break;
          }
          for (const d of [
            { dx: 0, dy: -1 },
            { dx: 1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: -1, dy: 0 },
          ]) {
            const nx = c.x + d.dx;
            const ny = c.y + d.dy;
            if (nx >= 0 && nx < w && ny >= 0 && ny < h && matrix[ny][nx] === 1) {
              const k = `${nx},${ny}`;
              if (!vis.has(k)) {
                vis.add(k);
                q.push({ x: nx, y: ny, dist: c.dist + 1 });
              }
            }
          }
        }

        if (dist > maxDist) {
          maxDist = dist;
          bestExitX = x;
        }
      }
    }

    matrix[0][bestExitX] = 1;

    for (let x = 0; x < w; x++) {
      if (x !== bestExitX) matrix[0][x] = 0;
      matrix[h - 1][x] = 0;
    }
    for (let y = 0; y < h; y++) {
      matrix[y][0] = 0;
      matrix[y][w - 1] = 0;
    }

    const startPoint: GridPoint = { x: startX, y: startY };
    const exitPoint: GridPoint = { x: bestExitX, y: 0 };

    const validation = validateMazeUniqueness(matrix, startPoint, exitPoint, w, h);
    if (validation.isValid) {
      const obstacles: GridPoint[] = [];
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (matrix[y][x] === 2) {
            obstacles.push({ x, y });
          }
        }
      }

      const candidateDirs: { dx: number; dy: number; dir: ArrowDirection }[] = [
        { dx: 0, dy: -1, dir: 'UP' },
        { dx: 1, dy: 0, dir: 'RIGHT' },
        { dx: 0, dy: 1, dir: 'DOWN' },
        { dx: -1, dy: 0, dir: 'LEFT' },
      ];

      let nextStep: GridPoint = { x: startX, y: startY - 1 };
      let initDir: ArrowDirection = 'UP';
      for (const c of candidateDirs) {
        const nx = startX + c.dx;
        const ny = startY + c.dy;
        if (nx >= 0 && nx < w && ny >= 0 && ny < h && matrix[ny][nx] === 1) {
          nextStep = { x: nx, y: ny };
          initDir = c.dir;
          break;
        }
      }

      const targetArrow: ArrowDefinition = {
        id: `target_arrow_${levelId}`,
        points: [
          { x: startPoint.x, y: startPoint.y },
          { x: nextStep.x, y: nextStep.y },
        ],
        direction: initDir,
      };

      return {
        id: levelId,
        name: `Labyrinth ${levelId}`,
        subtitle: `Complex Maze (${w}x${h})`,
        shapeType: 'maze',
        gridWidth: w,
        gridHeight: h,
        arrows: [targetArrow],
        obstacles,
        gridMatrix: matrix,
        startPoint,
        exitPoint,
        isSingleTargetMaze: true,
      };
    }
  }

  // Fallback curated single target maze
  return createLevel100();
}

/**
 * Curated Level 100: "Labyrinth Alpha"
 * Master single target maze guaranteed to test touch drag and single exit path.
 */
export function createLevel100(): LevelSilhouette {
  const width = 9;
  const height = 11;
  const matrix: number[][] = [
    [0, 0, 0, 0, 1, 0, 0, 0, 0], // Exit at (4, 0)
    [2, 2, 2, 2, 1, 2, 2, 2, 2],
    [2, 1, 1, 1, 1, 2, 1, 1, 2],
    [2, 1, 2, 2, 2, 2, 1, 2, 2],
    [2, 1, 1, 1, 1, 1, 1, 2, 2],
    [2, 2, 2, 2, 1, 2, 2, 2, 2],
    [2, 1, 1, 1, 1, 2, 1, 1, 2],
    [2, 1, 2, 2, 2, 2, 1, 2, 2],
    [2, 1, 1, 1, 1, 1, 1, 2, 2],
    [2, 2, 2, 1, 2, 2, 2, 2, 2],
    [0, 0, 0, 1, 0, 0, 0, 0, 0], // Start at (3, 9) or (3, 10)
  ];

  const obstacles: GridPoint[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (matrix[y][x] === 2) {
        obstacles.push({ x, y });
      }
    }
  }

  const startPoint: GridPoint = { x: 3, y: 9 };
  const exitPoint: GridPoint = { x: 4, y: 0 };

  const targetArrow: ArrowDefinition = {
    id: 'single_target_arrow_100',
    points: [
      { x: 3, y: 9 },
      { x: 3, y: 8 },
    ],
    direction: 'UP',
  };

  return {
    id: 100,
    name: 'Single Target Maze',
    subtitle: 'Drag Arrow to Single Exit',
    shapeType: 'maze',
    gridWidth: width,
    gridHeight: height,
    arrows: [targetArrow],
    obstacles,
    gridMatrix: matrix,
    startPoint,
    exitPoint,
    isSingleTargetMaze: true,
  };
}
