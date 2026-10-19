using System;
using System.Collections.Generic;
using UnityEngine;
using ArrowUntangle.Grid;
using ArrowUntangle.Level;

namespace ArrowUntangle.Gameplay
{
    public struct SolverResult
    {
        public bool isClear;
        public int maxTravelDistance;
        public int blockingArrowId;
        public Vector2Int blockedCell;
        public Vector2Int exitBoundaryPoint;

        public static SolverResult Clear(int distance, Vector2Int exitPoint) => new SolverResult
        {
            isClear = true,
            maxTravelDistance = distance,
            blockingArrowId = -1,
            blockedCell = new Vector2Int(-1, -1),
            exitBoundaryPoint = exitPoint
        };

        public static SolverResult Blocked(int distance, int blockerId, Vector2Int cell) => new SolverResult
        {
            isClear = false,
            maxTravelDistance = distance,
            blockingArrowId = blockerId,
            blockedCell = cell,
            exitBoundaryPoint = new Vector2Int(-1, -1)
        };
    }

    public static class PathSolver
    {
        /// <summary>
        /// Pure deterministic function with no side effects.
        /// Traces along the arrow's headDirection starting from HeadPoint + headDirection.
        /// Returns how many cell steps the arrowhead can travel forward until:
        /// 1) It hits a cell occupied by any segment of a DIFFERENT active arrow (BLOCKED), OR
        /// 2) It steps outside the grid bounds (CLEAR / EXIT).
        /// </summary>
        public static int GetMaxTravelDistance(GridSystem grid, ArrowData arrow)
        {
            if (grid == null || arrow == null || arrow.gridPoints == null || arrow.gridPoints.Count == 0)
            {
                return 0;
            }

            Vector2Int current = arrow.HeadPoint;
            Vector2Int step = arrow.headDirection;

            // Defensive: ensure step is non-zero cardinal vector
            if (step == Vector2Int.zero)
            {
                return 0;
            }

            int distance = 0;

            // Non-obvious algorithm explanation:
            // An arrow moving forward in direction D vacates its original path only behind it.
            // When checking forward cells, we must ignore any cell that contains the moving arrow's
            // own ID (e.g. if self-overlapping loops or bends ever exist, or if head steps over its own point).
            // A cell is considered a block ONLY if it contains an active arrow ID != arrow.id.
            while (true)
            {
                current += step;

                // If stepped outside board bounds, the arrow has reached/cleared the boundary
                if (!grid.IsWithinBounds(current))
                {
                    // Reached boundary safely: the distance includes the exit step
                    return distance + 1;
                }

                int occupantId = grid.GetCell(current);

                // If occupied by another arrow (any segment of another arrow)
                if (occupantId != -1 && occupantId != arrow.id)
                {
                    // Blocked right at this cell. Max allowed travel is the steps up to this cell.
                    return distance;
                }

                distance++;
            }
        }

        /// <summary>
        /// Implemented directly on top of GetMaxTravelDistance:
        /// Clear if maxDistance successfully reaches outside the boundary.
        /// </summary>
        public static SolverResult Solve(GridSystem grid, ArrowData arrow)
        {
            if (grid == null || arrow == null || arrow.gridPoints == null || arrow.gridPoints.Count == 0)
            {
                return SolverResult.Blocked(0, -1, Vector2Int.zero);
            }

            int maxDistance = GetMaxTravelDistance(grid, arrow);

            Vector2Int current = arrow.HeadPoint;
            Vector2Int step = arrow.headDirection;

            for (int i = 0; i < maxDistance; i++)
            {
                current += step;
            }

            // Check the cell immediately following maxDistance
            Vector2Int nextCell = current + step;

            if (!grid.IsWithinBounds(nextCell))
            {
                // Next cell is outside boundary: successfully clear!
                return SolverResult.Clear(maxDistance, nextCell);
            }

            int blockerId = grid.GetCell(nextCell);
            return SolverResult.Blocked(maxDistance, blockerId, nextCell);
        }
    }
}
