import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowDefinition, ThemeConfig, GridPoint, CreatureDefinition } from '../types';
import { CreatureEntity } from './CreatureEntity';

interface ArrowCanvasProps {
  levelId: number;
  gridWidth: number;
  gridHeight: number;
  arrows: ArrowDefinition[];
  obstacles?: GridPoint[];
  gridMatrix?: number[][]; // 2D matrix: 0 = empty, 1 = path, 2 = obstacle
  startPoint?: GridPoint;
  exitPoint?: GridPoint;
  isSingleTargetMaze?: boolean;
  escapedArrowIds: Set<string>;
  escapingPaths?: Record<string, GridPoint[]>;
  theme: ThemeConfig;
  activeCreature?: CreatureDefinition;
  isWarping?: boolean;
  warpProgress?: number;
  fogOfWarEnabled?: boolean;
  isPressureStage?: boolean;
  onTapArrow: (arrow: ArrowDefinition) => void;
  onDragReachExit?: (arrow: ArrowDefinition) => void;
  onWallCollision?: (coord: GridPoint) => void;
  blockedArrowId: string | null;
  blockingArrowId: string | null;
  blockedObstacleCoord?: GridPoint | null;
  hintedArrowId: string | null;
  showTutorialHand?: boolean;
  tutorialArrowId?: string | null;
}

interface SlicedPathResult {
  points: { x: number; y: number }[];
  headPoint: { x: number; y: number };
  headAngle: number;
}

/**
 * Mathematical snake slicing along maze corridors:
 * Slices the arrow polyline as it travels along escape waypoints around obstacles
 */
function slicePathAlongWaypoints(
  originalPoints: { x: number; y: number }[],
  escapePath: { x: number; y: number }[],
  headDist: number
): SlicedPathResult | null {
  // Arrow original length
  let arrowLen = 0;
  for (let i = 0; i < originalPoints.length - 1; i++) {
    arrowLen += Math.hypot(
      originalPoints[i + 1].x - originalPoints[i].x,
      originalPoints[i + 1].y - originalPoints[i].y
    );
  }

  // Escape path segments
  const segments: { p1: { x: number; y: number }; p2: { x: number; y: number }; len: number }[] = [];
  let totalEscapeLen = 0;
  for (let i = 0; i < escapePath.length - 1; i++) {
    const len = Math.hypot(escapePath[i + 1].x - escapePath[i].x, escapePath[i + 1].y - escapePath[i].y);
    segments.push({ p1: escapePath[i], p2: escapePath[i + 1], len });
    totalEscapeLen += len;
  }

  const tailDist = headDist - arrowLen;
  if (tailDist > totalEscapeLen + 15) {
    return null; // completely left the board
  }

  const getPt = (dist: number) => {
    if (dist <= 0) {
      const p1 = escapePath[0];
      const p2 = escapePath[1] || p1;
      const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      return { point: p1, angle };
    }
    let rem = dist;
    for (const seg of segments) {
      if (rem <= seg.len) {
        const r = rem / seg.len;
        const x = seg.p1.x + (seg.p2.x - seg.p1.x) * r;
        const y = seg.p1.y + (seg.p2.y - seg.p1.y) * r;
        const angle = Math.atan2(seg.p2.y - seg.p1.y, seg.p2.x - seg.p1.x);
        return { point: { x, y }, angle };
      }
      rem -= seg.len;
    }
    const lastSeg = segments[segments.length - 1];
    const angle = lastSeg ? Math.atan2(lastSeg.p2.y - lastSeg.p1.y, lastSeg.p2.x - lastSeg.p1.x) : 0;
    const lastPt = escapePath[escapePath.length - 1];
    return {
      point: {
        x: lastPt.x + Math.cos(angle) * rem,
        y: lastPt.y + Math.sin(angle) * rem,
      },
      angle,
    };
  };

  const headInfo = getPt(headDist);
  const polyPoints: { x: number; y: number }[] = [];

  if (tailDist < 0) {
    // Tail is still on the original body points before entering the maze path
    const tailRemDist = -tailDist;
    const origSegsReversed: { pStart: { x: number; y: number }; pEnd: { x: number; y: number }; len: number }[] = [];
    for (let i = originalPoints.length - 1; i > 0; i--) {
      origSegsReversed.push({
        pStart: originalPoints[i - 1],
        pEnd: originalPoints[i],
        len: Math.hypot(originalPoints[i].x - originalPoints[i - 1].x, originalPoints[i].y - originalPoints[i - 1].y),
      });
    }

    let acc = 0;
    const untraveled: { x: number; y: number }[] = [];
    for (const seg of origSegsReversed) {
      if (acc + seg.len >= tailRemDist) {
        const r = (tailRemDist - acc) / seg.len;
        untraveled.unshift({
          x: seg.pEnd.x - (seg.pEnd.x - seg.pStart.x) * r,
          y: seg.pEnd.y - (seg.pEnd.y - seg.pStart.y) * r,
        });
        break;
      } else {
        acc += seg.len;
        untraveled.unshift(seg.pStart);
      }
    }
    polyPoints.push(...untraveled);
  } else {
    polyPoints.push(getPt(tailDist).point);
  }

  // Include any corner waypoints between tail and head
  let accumDist = 0;
  for (let i = 0; i < escapePath.length - 1; i++) {
    accumDist += segments[i].len;
    if (accumDist > tailDist && accumDist < headDist) {
      polyPoints.push(escapePath[i + 1]);
    }
  }

  polyPoints.push(headInfo.point);

  return {
    points: polyPoints,
    headPoint: headInfo.point,
    headAngle: headInfo.angle,
  };
}

function getRotatedArrowHead(tip: { x: number; y: number }, angle: number): string {
  const headLen = 9;
  const headWidth = 6;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  const tipX = tip.x + cos * 2;
  const tipY = tip.y + sin * 2;

  const wing1X = tip.x - cos * headLen - sin * headWidth;
  const wing1Y = tip.y - sin * headLen + cos * headWidth;

  const wing2X = tip.x - cos * headLen + sin * headWidth;
  const wing2Y = tip.y - sin * headLen - cos * headWidth;

  return `${tipX},${tipY} ${wing1X},${wing1Y} ${wing2X},${wing2Y}`;
}

export const ArrowCanvas: React.FC<ArrowCanvasProps> = ({
  gridWidth,
  gridHeight,
  arrows,
  obstacles = [],
  gridMatrix,
  startPoint,
  exitPoint,
  isSingleTargetMaze = false,
  escapedArrowIds,
  escapingPaths = {},
  theme,
  activeCreature,
  isWarping = false,
  warpProgress = 0,
  fogOfWarEnabled = false,
  isPressureStage = false,
  onTapArrow,
  onDragReachExit,
  onWallCollision,
  blockedArrowId,
  blockingArrowId,
  blockedObstacleCoord,
  hintedArrowId,
  showTutorialHand = false,
  tutorialArrowId = null,
}) => {
  // SVG coordinate scale
  const cellSize = 26;
  const padding = 34;
  const svgWidth = gridWidth * cellSize + padding * 2;
  const svgHeight = gridHeight * cellSize + padding * 2;

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Track progress of escaping animations (0 to 1)
  const [escapeProgress, setEscapeProgress] = useState<Record<string, number>>({});

  // Touch and drag state
  const [draggedArrowId, setDraggedArrowId] = useState<string | null>(null);
  const [dragPoints, setDragPoints] = useState<GridPoint[] | null>(null);
  const [dragHeadDirection, setDragHeadDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>('UP');
  const [touchIndicator, setTouchIndicator] = useState<{ x: number; y: number } | null>(null);

  const isDraggingRef = useRef(false);
  const hasMovedRef = useRef(false);
  const lastCollidedWallRef = useRef<string | null>(null);
  const dragPointsRef = useRef<GridPoint[] | null>(null);
  const lastTouchPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const accumulatedDeltaRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchStartTimeRef = useRef<number>(0);

  // Sync ref with state
  useEffect(() => {
    dragPointsRef.current = dragPoints;
  }, [dragPoints]);

  // Reset drag when level or start point changes or when escapedArrowIds is cleared (Restart)
  useEffect(() => {
    setDraggedArrowId(null);
    setDragPoints(null);
    dragPointsRef.current = null;
    isDraggingRef.current = false;
    hasMovedRef.current = false;
    lastCollidedWallRef.current = null;
    setTouchIndicator(null);
    if (arrows.length > 0) {
      setDragHeadDirection(arrows[0].direction);
    }
  }, [arrows, startPoint, exitPoint, escapedArrowIds.size]);

  useEffect(() => {
    escapedArrowIds.forEach((id) => {
      if (escapeProgress[id] === undefined) {
        const startTime = performance.now();
        const duration = 440; // ms for snappy physical navigation

        const step = (now: number) => {
          const elapsed = now - startTime;
          const p = Math.min(1, elapsed / duration);
          // Smooth physical ease curve
          const eased = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
          setEscapeProgress((prev) => ({ ...prev, [id]: eased }));

          if (p < 1) {
            requestAnimationFrame(step);
          }
        };
        requestAnimationFrame(step);
      }
    });
  }, [escapedArrowIds, escapeProgress]);

  // Convert grid point to SVG point
  const toSvgPoint = useCallback((gx: number, gy: number) => ({
    x: padding + gx * cellSize,
    y: padding + gy * cellSize,
  }), [cellSize, padding]);

  // Helper to check if a cell is a blocked obstacle (2) or outside grid / empty (0)
  const isCellBlocked = useCallback((gx: number, gy: number): boolean => {
    if (gx < 0 || gx >= gridWidth || gy < 0 || gy >= gridHeight) return true;
    if (gridMatrix && gridMatrix[gy]) {
      // 0 = empty/void, 1 = path corridor, 2 = static obstacle wall
      return gridMatrix[gy][gx] !== 1;
    }
    // Fallback: check obstacles array
    return obstacles.some(o => o.x === gx && o.y === gy);
  }, [gridWidth, gridHeight, gridMatrix, obstacles]);

  // Handle pointer down ANYWHERE on the screen / canvas to move the arrow
  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    const targetArrow = isSingleTargetMaze ? arrows[0] : (arrows.find(a => !escapedArrowIds.has(a.id)) || arrows[0]);
    if (!targetArrow || escapedArrowIds.has(targetArrow.id)) return;

    try {
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    } catch {
      // Ignored if unsupported
    }

    const currentPoints = dragPointsRef.current || [...targetArrow.points];
    dragPointsRef.current = currentPoints;
    setDraggedArrowId(targetArrow.id);
    setDragPoints(currentPoints);

    if (currentPoints.length > 1) {
      const head = currentPoints[currentPoints.length - 1];
      const prev = currentPoints[currentPoints.length - 2];
      const dir = head.x > prev.x ? 'RIGHT' : head.x < prev.x ? 'LEFT' : head.y > prev.y ? 'DOWN' : 'UP';
      setDragHeadDirection(dir);
    } else {
      setDragHeadDirection(targetArrow.direction);
    }

    touchStartPosRef.current = { x: e.clientX, y: e.clientY };
    lastTouchPosRef.current = { x: e.clientX, y: e.clientY };
    accumulatedDeltaRef.current = { x: 0, y: 0 };
    touchStartTimeRef.current = Date.now();
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    lastCollidedWallRef.current = null;

    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const svgX = ((e.clientX - rect.left) / rect.width) * svgWidth;
      const svgY = ((e.clientY - rect.top) / rect.height) * svgHeight;
      setTouchIndicator({ x: svgX, y: svgY });
    }
  };

  // Handle pointer move anywhere: offset/relative dragging so fingers never obstruct the arrow
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !draggedArrowId) return;

    const deltaX = e.clientX - lastTouchPosRef.current.x;
    const deltaY = e.clientY - lastTouchPosRef.current.y;
    lastTouchPosRef.current = { x: e.clientX, y: e.clientY };

    if (Math.hypot(e.clientX - touchStartPosRef.current.x, e.clientY - touchStartPosRef.current.y) > 6) {
      hasMovedRef.current = true;
    }

    accumulatedDeltaRef.current.x += deltaX;
    accumulatedDeltaRef.current.y += deltaY;

    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const svgX = ((e.clientX - rect.left) / rect.width) * svgWidth;
      const svgY = ((e.clientY - rect.top) / rect.height) * svgHeight;
      setTouchIndicator({ x: svgX, y: svgY });
    }

    const rect = svgRef.current?.getBoundingClientRect();
    const scale = rect ? rect.width / svgWidth : 1;
    // Responsive movement threshold: ~16 to 22 physical pixels
    const threshold = Math.max(14, cellSize * scale * 0.42);

    const targetArrow = arrows.find(a => a.id === draggedArrowId) || arrows[0];
    if (!targetArrow) return;

    let points = dragPointsRef.current || [...targetArrow.points];

    while (
      Math.abs(accumulatedDeltaRef.current.x) >= threshold ||
      Math.abs(accumulatedDeltaRef.current.y) >= threshold
    ) {
      const absX = Math.abs(accumulatedDeltaRef.current.x);
      const absY = Math.abs(accumulatedDeltaRef.current.y);

      let stepDx = 0;
      let stepDy = 0;
      let stepDir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

      if (absX >= absY) {
        stepDx = accumulatedDeltaRef.current.x > 0 ? 1 : -1;
        stepDir = stepDx > 0 ? 'RIGHT' : 'LEFT';
        accumulatedDeltaRef.current.x -= stepDx * threshold;
        accumulatedDeltaRef.current.y *= 0.35; // Soften orthogonal drift
      } else {
        stepDy = accumulatedDeltaRef.current.y > 0 ? 1 : -1;
        stepDir = stepDy > 0 ? 'DOWN' : 'UP';
        accumulatedDeltaRef.current.y -= stepDy * threshold;
        accumulatedDeltaRef.current.x *= 0.35;
      }

      const currentHead = points[points.length - 1];
      const nextX = currentHead.x + stepDx;
      const nextY = currentHead.y + stepDy;

      // Check backtracking to shorten or rewind arrow
      if (points.length > 1) {
        const prevPoint = points[points.length - 2];
        if (nextX === prevPoint.x && nextY === prevPoint.y) {
          points = points.slice(0, -1);
          dragPointsRef.current = points;
          setDragPoints(points);
          if (points.length > 1) {
            const newHead = points[points.length - 1];
            const secLast = points[points.length - 2];
            const bDir = newHead.x > secLast.x ? 'RIGHT' : newHead.x < secLast.x ? 'LEFT' : newHead.y > secLast.y ? 'DOWN' : 'UP';
            setDragHeadDirection(bDir);
          }
          continue;
        }
      }

      // Check wall or void collision
      if (isCellBlocked(nextX, nextY)) {
        const wallKey = `${nextX},${nextY}`;
        if (lastCollidedWallRef.current !== wallKey) {
          lastCollidedWallRef.current = wallKey;
          onWallCollision?.({ x: nextX, y: nextY });
        }
        accumulatedDeltaRef.current.x = 0;
        accumulatedDeltaRef.current.y = 0;
        break;
      }

      // Valid path movement along labyrinth corridor!
      points = [...points, { x: nextX, y: nextY }];
      dragPointsRef.current = points;
      setDragPoints(points);
      setDragHeadDirection(stepDir);

      // Check if reached exit portal!
      if (exitPoint && nextX === exitPoint.x && nextY === exitPoint.y) {
        isDraggingRef.current = false;
        setDraggedArrowId(null);
        setDragPoints(null);
        dragPointsRef.current = null;
        setTouchIndicator(null);
        if (onDragReachExit) {
          onDragReachExit(targetArrow);
        } else {
          onTapArrow(targetArrow);
        }
        return;
      }
    }
  };

  // Handle pointer up anywhere on screen
  const handlePointerUp = (e: React.PointerEvent) => {
    try {
      (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
    } catch {
      // Ignored
    }
    setTouchIndicator(null);

    if (!isDraggingRef.current) return;
    const arrowId = draggedArrowId;
    const wasDragging = hasMovedRef.current;
    isDraggingRef.current = false;

    // Quick tap without dragging
    if (!wasDragging && arrowId) {
      const arrow = arrows.find(a => a.id === arrowId);
      if (arrow) {
        onTapArrow(arrow);
      }
    }
  };

  // Keyboard navigation support (Arrow Keys & WASD)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetArrow = isSingleTargetMaze ? arrows[0] : (arrows.find(a => !escapedArrowIds.has(a.id)) || arrows[0]);
      if (!targetArrow || escapedArrowIds.has(targetArrow.id)) return;

      let stepDx = 0;
      let stepDy = 0;
      let stepDir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null = null;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        stepDy = -1;
        stepDir = 'UP';
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        stepDy = 1;
        stepDir = 'DOWN';
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        stepDx = -1;
        stepDir = 'LEFT';
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        stepDx = 1;
        stepDir = 'RIGHT';
      }

      if (!stepDir) return;
      e.preventDefault();

      let points = dragPointsRef.current || [...targetArrow.points];
      const currentHead = points[points.length - 1];
      const nextX = currentHead.x + stepDx;
      const nextY = currentHead.y + stepDy;

      if (points.length > 1) {
        const prev = points[points.length - 2];
        if (nextX === prev.x && nextY === prev.y) {
          points = points.slice(0, -1);
          dragPointsRef.current = points;
          setDragPoints(points);
          setDraggedArrowId(targetArrow.id);
          if (points.length > 1) {
            const h = points[points.length - 1];
            const p = points[points.length - 2];
            const d = h.x > p.x ? 'RIGHT' : h.x < p.x ? 'LEFT' : h.y > p.y ? 'DOWN' : 'UP';
            setDragHeadDirection(d);
          }
          return;
        }
      }

      if (isCellBlocked(nextX, nextY)) {
        onWallCollision?.({ x: nextX, y: nextY });
        return;
      }

      points = [...points, { x: nextX, y: nextY }];
      dragPointsRef.current = points;
      setDragPoints(points);
      setDraggedArrowId(targetArrow.id);
      setDragHeadDirection(stepDir);

      if (exitPoint && nextX === exitPoint.x && nextY === exitPoint.y) {
        setDraggedArrowId(null);
        setDragPoints(null);
        dragPointsRef.current = null;
        if (onDragReachExit) {
          onDragReachExit(targetArrow);
        } else {
          onTapArrow(targetArrow);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [arrows, isSingleTargetMaze, escapedArrowIds, exitPoint, isCellBlocked, onDragReachExit, onTapArrow, onWallCollision]);

  // Calculate static arrowhead points for arrows at rest
  const getArrowHead = (tip: { x: number; y: number }, direction: string) => {
    const headLen = 9;
    const headWidth = 6;
    let p1 = { x: tip.x, y: tip.y };
    let p2 = { x: tip.x, y: tip.y };
    let p3 = { x: tip.x, y: tip.y };

    switch (direction) {
      case 'UP':
        p1 = { x: tip.x, y: tip.y - 2 };
        p2 = { x: tip.x - headWidth, y: tip.y + headLen };
        p3 = { x: tip.x + headWidth, y: tip.y + headLen };
        break;
      case 'DOWN':
        p1 = { x: tip.x, y: tip.y + 2 };
        p2 = { x: tip.x - headWidth, y: tip.y - headLen };
        p3 = { x: tip.x + headWidth, y: tip.y - headLen };
        break;
      case 'LEFT':
        p1 = { x: tip.x - 2, y: tip.y };
        p2 = { x: tip.x + headLen, y: tip.y - headWidth };
        p3 = { x: tip.x + headLen, y: tip.y + headWidth };
        break;
      case 'RIGHT':
        p1 = { x: tip.x + 2, y: tip.y };
        p2 = { x: tip.x - headLen, y: tip.y - headWidth };
        p3 = { x: tip.x - headLen, y: tip.y + headWidth };
        break;
    }
    return `${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`;
  };

  // Find tutorial arrow position for hand overlay
  const tutorialArrow = arrows.find((a) => a.id === tutorialArrowId && !escapedArrowIds.has(a.id));
  const tutorialPos = tutorialArrow
    ? toSvgPoint(
        tutorialArrow.points[tutorialArrow.points.length - 1].x,
        tutorialArrow.points[tutorialArrow.points.length - 1].y
      )
    : null;

  // Head position for dynamic fog-of-war light cone
  const targetArrow = arrows.find((a) => a.id === 'arrow-main' || a.id === arrows[0]?.id);
  const targetHeadPt = (() => {
    if (dragPoints && dragPoints.length > 0) {
      return toSvgPoint(dragPoints[dragPoints.length - 1].x, dragPoints[dragPoints.length - 1].y);
    }
    if (targetArrow && targetArrow.points.length > 0) {
      return toSvgPoint(
        targetArrow.points[targetArrow.points.length - 1].x,
        targetArrow.points[targetArrow.points.length - 1].y
      );
    }
    return { x: svgWidth / 2, y: svgHeight / 2 };
  })();

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center select-none overflow-hidden touch-manipulation transition-all duration-300 ${
        isPressureStage ? 'ring-inset ring-2 ring-rose-500/40' : ''
      }`}
    >
      <svg
        ref={svgRef}
        id="arrow-maze-canvas"
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-full object-contain drop-shadow-sm transition-transform duration-200 cursor-crosshair"
        style={{ filter: `drop-shadow(0 2px 8px ${theme.shadow})`, touchAction: 'none' }}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <defs>
          {/* Subtle glow filter for hints and escaping */}
          <filter id="escape-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={theme.arrowEscaping} floodOpacity="0.8" />
          </filter>
          <filter id="hint-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={theme.hintGlow} floodOpacity="0.9" />
          </filter>
          <filter id="obstacle-hit-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#EF4444" floodOpacity="0.9" />
          </filter>
          <filter id="creature-trail-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={activeCreature ? activeCreature.glowColor : theme.accentColor} floodOpacity="0.8" />
          </filter>

          {/* Modernized Obstacle Block Gradient */}
          <linearGradient id="modern-block-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={theme.blockGradientStart || theme.obstacleFill} />
            <stop offset="100%" stopColor={theme.blockGradientEnd || theme.obstacleFill} />
          </linearGradient>

          {/* Block Specular Top Sheen */}
          <linearGradient id="block-specular-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={theme.blockSpecular || 'rgba(255, 255, 255, 0.45)'} stopOpacity="0.8" />
            <stop offset="100%" stopColor={theme.blockSpecular || 'rgba(255, 255, 255, 0.45)'} stopOpacity="0" />
          </linearGradient>

          {/* Exit Portal Radial Glow */}
          <radialGradient id="exit-beacon-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={theme.portalGlow || '#10B981'} stopOpacity="0.9" />
            <stop offset="60%" stopColor={theme.portalGlow || '#059669'} stopOpacity="0.5" />
            <stop offset="100%" stopColor={theme.portalGlow || '#047857'} stopOpacity="0" />
          </radialGradient>

          {/* Start Beacon Radial Glow */}
          <radialGradient id="start-beacon-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={theme.accentColor || '#0EA5E9'} stopOpacity="0.8" />
            <stop offset="60%" stopColor={theme.accentColor || '#0284C7'} stopOpacity="0.4" />
            <stop offset="100%" stopColor={theme.accentColor || '#0369A1'} stopOpacity="0" />
          </radialGradient>

          {/* Fog-of-War Spotlight Radial Masks */}
          <radialGradient id="fog-lantern-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. Formal 2D Grid Floor Matrix (Differentiating Empty 0, Corridor 1, Wall 2) */}
        {gridMatrix ? (
          <g id="maze-matrix-floor">
            {gridMatrix.map((row, gy) =>
              row.map((cellVal, gx) => {
                const pt = toSvgPoint(gx, gy);
                const tileSize = cellSize - 1.5;
                const isExit = exitPoint && exitPoint.x === gx && exitPoint.y === gy;
                const isStart = startPoint && startPoint.x === gx && startPoint.y === gy;

                if (cellVal === 0) {
                  // CellType.Empty (0): Recessed dark non-traversable void
                  return (
                    <g key={`matrix-cell-${gx}-${gy}`}>
                      <rect
                        x={pt.x - tileSize / 2}
                        y={pt.y - tileSize / 2}
                        width={tileSize}
                        height={tileSize}
                        rx="3"
                        fill="rgba(15, 23, 42, 0.35)"
                        stroke="rgba(30, 41, 59, 0.4)"
                        strokeWidth="0.8"
                      />
                      <circle cx={pt.x} cy={pt.y} r="1" fill="rgba(71, 85, 105, 0.3)" />
                    </g>
                  );
                }

                if (cellVal === 1) {
                  // CellType.Path (1): Smooth walkable lit corridor tile
                  return (
                    <g key={`matrix-cell-${gx}-${gy}`}>
                      <rect
                        x={pt.x - tileSize / 2}
                        y={pt.y - tileSize / 2}
                        width={tileSize}
                        height={tileSize}
                        rx="3"
                        fill={isExit ? 'rgba(16, 185, 129, 0.15)' : isStart ? 'rgba(14, 165, 233, 0.15)' : 'rgba(30, 41, 59, 0.68)'}
                        stroke={isExit ? '#10B981' : isStart ? '#0EA5E9' : 'rgba(71, 85, 105, 0.45)'}
                        strokeWidth={isExit || isStart ? 1.5 : 0.8}
                      />
                      {/* Subtle center dot for path navigation */}
                      {!isExit && !isStart && (
                        <circle cx={pt.x} cy={pt.y} r="1.4" fill={theme.corridorDot || '#94A3B8'} opacity="0.6" />
                      )}
                    </g>
                  );
                }

                return null;
              })
            )}
          </g>
        ) : (
          /* Fallback dot grid when matrix is omitted */
          <g id="maze-corridor-grid" opacity={0.32}>
            {Array.from({ length: gridHeight }).map((_, gy) =>
              Array.from({ length: gridWidth }).map((_, gx) => {
                const pt = toSvgPoint(gx, gy);
                return (
                  <circle
                    key={`dot-${gx}-${gy}`}
                    cx={pt.x}
                    cy={pt.y}
                    r={1.3}
                    fill={theme.corridorDot || 'currentColor'}
                  />
                );
              })
            )}
          </g>
        )}

        {/* Start Point Beacon (if defined) */}
        {startPoint && (
          <g id="maze-start-beacon" transform={`translate(${toSvgPoint(startPoint.x, startPoint.y).x}, ${toSvgPoint(startPoint.x, startPoint.y).y})`}>
            <circle cx="0" cy="0" r={cellSize * 0.45} fill="url(#start-beacon-grad)" />
            <circle cx="0" cy="0" r={cellSize * 0.3} fill="none" stroke="#0EA5E9" strokeWidth="1.2" strokeDasharray="2 2" />
            <circle cx="0" cy="0" r="3" fill="#38BDF8" />
            <text x="0" y={-cellSize * 0.55} textAnchor="middle" fill="#38BDF8" fontSize="7" fontWeight="bold" letterSpacing="0.5">
              START
            </text>
          </g>
        )}

        {/* Exit Point Portal Beacon or Black-Hole Singularity Vortex */}
        {exitPoint && (
          <g id="maze-exit-portal" transform={`translate(${toSvgPoint(exitPoint.x, exitPoint.y).x}, ${toSvgPoint(exitPoint.x, exitPoint.y).y})`}>
            {isWarping ? (
              /* Gravitational Black-Hole Singularity Vortex */
              <g id="vortex-singularity" className="transition-all duration-300">
                {/* Outer Rotating Accretion Disc Gravitational Rings */}
                <circle cx="0" cy="0" r={cellSize * 1.8} fill="none" stroke="#A855F7" strokeWidth="2.5" strokeDasharray="8 6" className="animate-spin" opacity="0.85" />
                <circle cx="0" cy="0" r={cellSize * 1.3} fill="none" stroke="#38BDF8" strokeWidth="2.5" strokeDasharray="6 4" className="animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }} />
                <circle cx="0" cy="0" r={cellSize * 0.95} fill="none" stroke="#F43F5E" strokeWidth="2" className="animate-ping opacity-75" />

                {/* Swirling Gravitational Spiral Arms */}
                <path d={`M 0 0 Q ${cellSize * 0.6} ${cellSize * 0.6}, ${cellSize * 1.2} 0 Q ${cellSize * 1.5} -${cellSize * 0.8}, 0 -${cellSize * 1.3}`} fill="none" stroke="#E2E8F0" strokeWidth="2.4" strokeLinecap="round" opacity="0.85" className="animate-spin" />
                <path d={`M 0 0 Q -${cellSize * 0.6} -${cellSize * 0.6}, -${cellSize * 1.2} 0 Q -${cellSize * 1.5} ${cellSize * 0.8}, 0 ${cellSize * 1.3}`} fill="none" stroke="#00F0FF" strokeWidth="2.4" strokeLinecap="round" opacity="0.85" className="animate-spin" />

                {/* Event Horizon Core Singularity */}
                <circle cx="0" cy="0" r={cellSize * 0.65} fill="#000000" stroke="#FFFFFF" strokeWidth="2" filter="url(#escape-glow)" />
                <circle cx="0" cy="0" r={cellSize * 0.38} fill="#09090B" />
              </g>
            ) : (
              /* Standard High-Tech Portal Beacon */
              <g id="normal-portal">
                <circle cx="0" cy="0" r={cellSize * 0.65} fill="url(#exit-beacon-grad)" className="animate-pulse" />
                <circle cx="0" cy="0" r={cellSize * 0.55} fill="none" stroke="#10B981" strokeWidth="1.8" className="animate-ping opacity-50" />
                <circle cx="0" cy="0" r={cellSize * 0.35} fill="#064E3B" stroke="#34D399" strokeWidth="1.5" />
                <path d="M-3 -4 L2 0 L-3 4" fill="none" stroke="#6EE7B7" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <text x="0" y={cellSize * 0.68 + 4} textAnchor="middle" fill="#34D399" fontSize="8" fontWeight="bold" letterSpacing="0.5">
                  EXIT
                </text>
              </g>
            )}
          </g>
        )}

        {/* 2. Distinct Static Obstacle Cells (Geometric Maze Blocks) */}
        <g id="maze-obstacles">
          {obstacles.map((obs, idx) => {
            const pt = toSvgPoint(obs.x, obs.y);
            const isHit =
              blockedObstacleCoord &&
              Math.abs(blockedObstacleCoord.x - obs.x) < 0.2 &&
              Math.abs(blockedObstacleCoord.y - obs.y) < 0.2;
            const obsSize = cellSize * 0.9;

            return (
              <g
                key={`obstacle-${obs.x}-${obs.y}-${idx}`}
                id={`obstacle-${obs.x}-${obs.y}`}
                className={isHit ? 'animate-pulse' : ''}
              >
                {/* Obstacle Drop Shadow */}
                <rect
                  x={pt.x - obsSize / 2 + 1}
                  y={pt.y - obsSize / 2 + 2}
                  width={obsSize}
                  height={obsSize}
                  rx="4"
                  fill="rgba(0, 0, 0, 0.16)"
                />

                {/* Main Static Obstacle Block with Gradient & Bevel */}
                <rect
                  x={pt.x - obsSize / 2}
                  y={pt.y - obsSize / 2}
                  width={obsSize}
                  height={obsSize}
                  rx="4"
                  fill={isHit ? '#EF4444' : 'url(#modern-block-grad)'}
                  stroke={isHit ? '#DC2626' : theme.obstacleBorder}
                  strokeWidth={isHit ? 2.4 : 1.4}
                  filter={isHit ? 'url(#obstacle-hit-glow)' : 'none'}
                  style={{ transition: 'all 0.15s ease-out' }}
                />

                {/* Top Specular Sheen (Modern Block Lighting) */}
                {!isHit && (
                  <rect
                    x={pt.x - obsSize / 2 + 1}
                    y={pt.y - obsSize / 2 + 1}
                    width={obsSize - 2}
                    height={obsSize * 0.38}
                    rx="3"
                    fill="url(#block-specular-grad)"
                    pointerEvents="none"
                  />
                )}

                {/* Tactile Embossed Modern Inset Core */}
                <rect
                  x={pt.x - obsSize / 3.4}
                  y={pt.y - obsSize / 3.4}
                  width={obsSize / 1.7}
                  height={obsSize / 1.7}
                  rx="2.5"
                  fill={isHit ? '#FCA5A5' : theme.obstacleDetail}
                  opacity={0.85}
                  stroke={isHit ? '#DC2626' : theme.obstacleBorder}
                  strokeWidth="0.6"
                />

                {/* Modern Precision Tech Micro-Accents */}
                <circle cx={pt.x} cy={pt.y} r={1.3} fill={isHit ? '#DC2626' : theme.accentColor || theme.obstacleBorder} opacity={0.9} />
                <circle cx={pt.x - obsSize / 3.8} cy={pt.y - obsSize / 3.8} r={0.9} fill={theme.obstacleBorder} opacity={0.6} />
                <circle cx={pt.x + obsSize / 3.8} cy={pt.y - obsSize / 3.8} r={0.9} fill={theme.obstacleBorder} opacity={0.6} />
                <circle cx={pt.x - obsSize / 3.8} cy={pt.y + obsSize / 3.8} r={0.9} fill={theme.obstacleBorder} opacity={0.6} />
                <circle cx={pt.x + obsSize / 3.8} cy={pt.y + obsSize / 3.8} r={0.9} fill={theme.obstacleBorder} opacity={0.6} />

                {/* Warning hit ring on collision */}
                {isHit && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={obsSize * 0.75}
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="2"
                    className="animate-ping"
                  />
                )}
              </g>
            );
          })}
        </g>

        {/* 3. Render Arrows */}
        {arrows.map((arrow) => {
          const isEscaped = escapedArrowIds.has(arrow.id);
          const progress = escapeProgress[arrow.id];
          const isBlocked = blockedArrowId === arrow.id;
          const isBlocking = blockingArrowId === arrow.id;
          const isHinted = hintedArrowId === arrow.id;

          const origSvgPoints = arrow.points.map((p) => toSvgPoint(p.x, p.y));

          // If currently navigating escape along waypoints:
          let dynamicPointsString = '';
          let headPolygonPoints = '';
          let isFullyEscaped = false;

          const isBeingDragged = arrow.id === draggedArrowId && dragPoints && dragPoints.length > 0;

          if (isBeingDragged) {
            const dragSvgPoints = dragPoints.map((p) => toSvgPoint(p.x, p.y));
            dynamicPointsString = dragSvgPoints.map((p) => `${p.x},${p.y}`).join(' ');
            const tip = dragSvgPoints[dragSvgPoints.length - 1];
            headPolygonPoints = getArrowHead(tip, dragHeadDirection);
          } else if (isEscaped && progress !== undefined) {
            // Retrieve computed maze escape waypoints or default straight boundary exit
            const gridWaypoints = escapingPaths[arrow.id] || [
              arrow.points[arrow.points.length - 1],
              {
                x:
                  arrow.points[arrow.points.length - 1].x +
                  (arrow.direction === 'RIGHT' ? 15 : arrow.direction === 'LEFT' ? -15 : 0),
                y:
                  arrow.points[arrow.points.length - 1].y +
                  (arrow.direction === 'DOWN' ? 15 : arrow.direction === 'UP' ? -15 : 0),
              },
            ];
            const svgWaypoints = gridWaypoints.map((p) => toSvgPoint(p.x, p.y));

            // Calculate total path distance
            let totalPathDist = 0;
            for (let i = 0; i < svgWaypoints.length - 1; i++) {
              totalPathDist += Math.hypot(
                svgWaypoints[i + 1].x - svgWaypoints[i].x,
                svgWaypoints[i + 1].y - svgWaypoints[i].y
              );
            }

            let arrowLen = 0;
            for (let i = 0; i < origSvgPoints.length - 1; i++) {
              arrowLen += Math.hypot(
                origSvgPoints[i + 1].x - origSvgPoints[i].x,
                origSvgPoints[i + 1].y - origSvgPoints[i].y
              );
            }

            const maxTravel = totalPathDist + arrowLen + 30;
            const currentHeadDist = progress * maxTravel;

            const sliced = slicePathAlongWaypoints(origSvgPoints, svgWaypoints, currentHeadDist);

            if (!sliced || progress >= 1) {
              isFullyEscaped = true;
            } else {
              dynamicPointsString = sliced.points.map((p) => `${p.x},${p.y}`).join(' ');
              headPolygonPoints = getRotatedArrowHead(sliced.headPoint, sliced.headAngle);
            }
          } else {
            dynamicPointsString = origSvgPoints.map((p) => `${p.x},${p.y}`).join(' ');
            const tip = origSvgPoints[origSvgPoints.length - 1];
            headPolygonPoints = getArrowHead(tip, arrow.direction);
          }

          if (isFullyEscaped) {
            return null;
          }

          // Determine arrow color based on status
          let strokeColor = theme.arrowStroke;
          let headColor = theme.arrowHead;
          let filter = 'none';

          if (isBeingDragged) {
            strokeColor = '#38BDF8'; // Active dragging cyan
            headColor = '#0EA5E9';
            filter = 'url(#hint-glow)';
          } else if (isBlocked) {
            strokeColor = theme.arrowBlocked;
            headColor = theme.arrowBlocked;
          } else if (isBlocking) {
            strokeColor = '#F59E0B'; // Amber alert
            headColor = '#F59E0B';
          } else if (isHinted) {
            strokeColor = theme.hintGlow;
            headColor = theme.hintGlow;
            filter = 'url(#hint-glow)';
          } else if (isEscaped) {
            strokeColor = theme.arrowEscaping;
            headColor = theme.arrowEscaping;
            filter = 'url(#escape-glow)';
          }

          // Bump transform on block
          let transform = '';
          let transition = 'transform 0.1s ease-out, stroke 0.2s ease, opacity 0.3s ease';

          if (isBlocked) {
            let nudgeX = 0;
            let nudgeY = 0;
            switch (arrow.direction) {
              case 'UP':
                nudgeY = -5;
                break;
              case 'DOWN':
                nudgeY = 5;
                break;
              case 'LEFT':
                nudgeX = -5;
                break;
              case 'RIGHT':
                nudgeX = 5;
                break;
            }
            transform = `translate(${nudgeX}px, ${nudgeY}px)`;
            transition = 'transform 0.08s ease-in-out';
          }

          const isTargetArrow = isSingleTargetMaze ? (arrows.length > 0 && arrow.id === arrows[0].id) : true;

          return (
            <g
              key={arrow.id}
              id={`arrow-${arrow.id}`}
              className={`${isTargetArrow ? 'cursor-pointer' : 'cursor-default'} ${isFullyEscaped ? 'hidden' : ''}`}
              style={{
                transform,
                transition,
                opacity: isEscaped ? 0.9 : 1,
                pointerEvents: isEscaped || !isTargetArrow ? 'none' : 'all',
              }}
              onClick={() => isTargetArrow && !isEscaped && !isBeingDragged && onTapArrow(arrow)}
            >
              {/* Invisible wide hit area for effortless touch interaction */}
              <polyline
                points={dynamicPointsString}
                fill="none"
                stroke="transparent"
                strokeWidth="24"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Drag indicator halo around arrowhead */}
              {isBeingDragged && dragPoints && dragPoints.length > 0 && (
                <circle
                  cx={toSvgPoint(dragPoints[dragPoints.length - 1].x, dragPoints[dragPoints.length - 1].y).x}
                  cy={toSvgPoint(dragPoints[dragPoints.length - 1].x, dragPoints[dragPoints.length - 1].y).y}
                  r="11"
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                  className="animate-spin"
                />
              )}

              {/* Visible Arrow / Creature Traversed Path */}
              <polyline
                points={dynamicPointsString}
                fill="none"
                stroke={activeCreature && isTargetArrow ? activeCreature.primaryColor : strokeColor}
                strokeWidth={activeCreature && isTargetArrow ? "4" : "3.4"}
                strokeLinecap="round"
                strokeLinejoin="round"
                filter={activeCreature && isTargetArrow ? "url(#creature-trail-glow)" : filter}
                className={isHinted ? 'animate-pulse' : ''}
              />

              {/* Head Entity: Either High-Detail Animated Creature or Classic Arrowhead */}
              {activeCreature && isTargetArrow ? (
                <CreatureEntity
                  creature={activeCreature}
                  x={
                    isBeingDragged
                      ? toSvgPoint(dragPoints[dragPoints.length - 1].x, dragPoints[dragPoints.length - 1].y).x
                      : isWarping && exitPoint
                      ? toSvgPoint(exitPoint.x, exitPoint.y).x
                      : origSvgPoints[origSvgPoints.length - 1].x
                  }
                  y={
                    isBeingDragged
                      ? toSvgPoint(dragPoints[dragPoints.length - 1].x, dragPoints[dragPoints.length - 1].y).y
                      : isWarping && exitPoint
                      ? toSvgPoint(exitPoint.x, exitPoint.y).y
                      : origSvgPoints[origSvgPoints.length - 1].y
                  }
                  direction={isBeingDragged ? dragHeadDirection : (arrow.direction as any)}
                  cellSize={cellSize}
                  bgHex={theme.bg}
                  isMoving={Boolean(isBeingDragged)}
                  isWarping={Boolean(isWarping)}
                  warpProgress={warpProgress ?? 0}
                />
              ) : (
                <polygon
                  points={headPolygonPoints}
                  fill={headColor}
                  stroke={headColor}
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                  filter={filter}
                  className={isHinted ? 'animate-pulse' : ''}
                />
              )}

              {/* Trailing glow particle when escaping through maze */}
              {isEscaped && (
                <circle
                  cx={origSvgPoints[origSvgPoints.length - 1].x}
                  cy={origSvgPoints[origSvgPoints.length - 1].y}
                  r="5"
                  fill={theme.arrowEscaping}
                  opacity="0.75"
                  className="animate-ping"
                />
              )}
            </g>
          );
        })}

        {/* 5. Tutorial Hand Overlay (Matching Screenshot 4) */}
        {showTutorialHand && tutorialPos && (
          <g
            id="tutorial-hand-pointer"
            className="pointer-events-none transition-opacity duration-300"
            transform={`translate(${tutorialPos.x + 8}, ${tutorialPos.y + 12})`}
          >
            {/* Green glowing pulse ring at arrow tip */}
            <circle
              cx="-8"
              cy="-12"
              r="14"
              fill="none"
              stroke="#22C55E"
              strokeWidth="2"
              className="animate-ping opacity-75"
            />
            <circle
              cx="-8"
              cy="-12"
              r="6"
              fill="#22C55E"
              className="opacity-90"
            />

            {/* Stylized 3D gloved cartoon hand pointing to arrow */}
            <g className="animate-bounce drop-shadow-md">
              <path
                d="M-2 -8 C -2 -14, 4 -18, 9 -13 L 9 -2 C 9 -2, 12 -4, 15 -2 C 18 0, 17 4, 15 6 L 12 11 C 10 14, 7 16, 2 16 C -3 16, -6 13, -7 8 Z"
                fill="#FFFFFF"
                stroke="#D1D5DB"
                strokeWidth="1.5"
              />
              <rect x="-8" y="14" width="12" height="5" rx="2" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="1" />
            </g>
          </g>
        )}

        {/* 5. Touch anywhere cursor feedback */}
        {touchIndicator && (
          <g pointerEvents="none" opacity="0.85">
            <circle
              cx={touchIndicator.x}
              cy={touchIndicator.y}
              r="22"
              fill="rgba(56, 189, 248, 0.12)"
              stroke="rgba(56, 189, 248, 0.5)"
              strokeWidth="1.5"
            />
            <circle
              cx={touchIndicator.x}
              cy={touchIndicator.y}
              r="4"
              fill="#38BDF8"
              opacity="0.9"
            />
          </g>
        )}
      </svg>
    </div>
  );
};
