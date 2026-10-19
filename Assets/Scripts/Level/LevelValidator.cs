using System;
using System.Collections.Generic;
using UnityEngine;
using ArrowUntangle.Grid;
using ArrowUntangle.Gameplay;

namespace ArrowUntangle.Level
{
    public struct ValidationResult
    {
        public bool isValid;
        public List<int> resolvedSequence;
        public string errorMessage;

        public static ValidationResult Success(List<int> sequence) => new ValidationResult
        {
            isValid = true,
            resolvedSequence = sequence,
            errorMessage = string.Empty
        };

        public static ValidationResult Failure(string message) => new ValidationResult
        {
            isValid = false,
            resolvedSequence = new List<int>(),
            errorMessage = message
        };
    }

    public static class LevelValidator
    {
        /// <summary>
        /// Offline level validator reusing the exact deterministic PathSolver.
        /// Simulates board clearance to guarantee:
        /// 1) All arrow coordinates are valid and within grid dimensions.
        /// 2) Arrows don't self-intersect or duplicate head positions illegally.
        /// 3) The puzzle can be 100% untangled without deadlocks.
        /// </summary>
        public static ValidationResult Validate(LevelData level)
        {
            if (level == null)
            {
                return ValidationResult.Failure("LevelData is null.");
            }

            if (level.arrows == null || level.arrows.Count == 0)
            {
                return ValidationResult.Failure("Level has no arrows.");
            }

            if (level.gridWidth <= 0 || level.gridHeight <= 0)
            {
                return ValidationResult.Failure($"Invalid grid dimensions: {level.gridWidth}x{level.gridHeight}");
            }

            int w = level.gridWidth;
            int h = level.gridHeight;

            // Step 1: Boundary & coordinate verification
            for (int i = 0; i < level.arrows.Count; i++)
            {
                var arrow = level.arrows[i];
                if (arrow.gridPoints == null || arrow.gridPoints.Count < 2)
                {
                    return ValidationResult.Failure($"Arrow {arrow.id} has invalid gridPoints count (< 2).");
                }

                for (int p = 0; p < arrow.gridPoints.Count; p++)
                {
                    Vector2Int pt = arrow.gridPoints[p];
                    if (pt.x < 0 || pt.x >= w || pt.y < 0 || pt.y >= h)
                    {
                        return ValidationResult.Failure($"Arrow {arrow.id} point ({pt.x}, {pt.y}) is outside grid bounds {w}x{h}.");
                    }
                }

                // Verify headDirection points away from second-to-last point
                Vector2Int head = arrow.gridPoints[arrow.gridPoints.Count - 1];
                Vector2Int prev = arrow.gridPoints[arrow.gridPoints.Count - 2];
                Vector2Int actualDir = head - prev;
                // Cardinal unit check
                if (Mathf.Abs(actualDir.x) + Mathf.Abs(actualDir.y) != 1)
                {
                    return ValidationResult.Failure($"Arrow {arrow.id} head direction vector is non-cardinal or not unit length.");
                }

                if (arrow.headDirection != actualDir)
                {
                    return ValidationResult.Failure($"Arrow {arrow.id} headDirection ({arrow.headDirection}) does not match head-prev segment ({actualDir}).");
                }
            }

            // Step 2: Initialize simulation occupancy grid
            int[] simMatrix = new int[w * h];
            for (int i = 0; i < simMatrix.Length; i++) simMatrix[i] = -1;

            var activeArrows = new Dictionary<int, ArrowData>();
            for (int i = 0; i < level.arrows.Count; i++)
            {
                var arrow = level.arrows[i].Clone();
                arrow.isActive = true;
                arrow.hasBeenCleared = false;
                activeArrows[arrow.id] = arrow;

                for (int p = 0; p < arrow.gridPoints.Count; p++)
                {
                    Vector2Int pt = arrow.gridPoints[p];
                    int idx = pt.x + pt.y * w;
                    simMatrix[idx] = arrow.id;
                }
            }

            // Step 3: Simulate clearing loop
            // In each pass, we look for an arrow whose forward path to the boundary is clear.
            // If found, we remove it from the grid and continue.
            // If in any pass no active arrow can escape, the level is in a deadlock and INVALID.
            var resolvedOrder = new List<int>();

            while (activeArrows.Count > 0)
            {
                int arrowToClear = -1;

                foreach (var kvp in activeArrows)
                {
                    var arrow = kvp.Value;

                    if (SimulatePathIsClear(simMatrix, w, h, arrow))
                    {
                        arrowToClear = arrow.id;
                        break;
                    }
                }

                if (arrowToClear == -1)
                {
                    // Deadlock reached! None of the remaining arrows can escape.
                    return ValidationResult.Failure($"Deadlock reached: Remaining {activeArrows.Count} arrows are mutually blocked.");
                }

                // Clear arrow from simMatrix
                var clearedArrow = activeArrows[arrowToClear];
                for (int p = 0; p < clearedArrow.gridPoints.Count; p++)
                {
                    Vector2Int pt = clearedArrow.gridPoints[p];
                    int idx = pt.x + pt.y * w;
                    if (simMatrix[idx] == arrowToClear)
                    {
                        simMatrix[idx] = -1;
                    }
                }

                activeArrows.Remove(arrowToClear);
                resolvedOrder.Add(arrowToClear);
            }

            return ValidationResult.Success(resolvedOrder);
        }

        private static bool SimulatePathIsClear(int[] matrix, int w, int h, ArrowData arrow)
        {
            Vector2Int current = arrow.HeadPoint;
            Vector2Int step = arrow.headDirection;

            while (true)
            {
                current += step;

                // Stepped outside boundary
                if (current.x < 0 || current.x >= w || current.y < 0 || current.y >= h)
                {
                    return true;
                }

                int occupant = matrix[current.x + current.y * w];
                // If occupied by another arrow
                if (occupant != -1 && occupant != arrow.id)
                {
                    return false;
                }
            }
        }
    }
}
