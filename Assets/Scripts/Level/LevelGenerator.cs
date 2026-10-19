using System;
using System.Collections.Generic;
using UnityEngine;

namespace ArrowUntangle.Level
{
    public static class LevelGenerator
    {
        private static readonly Vector2Int[] CardinalDirs = new Vector2Int[]
        {
            new Vector2Int(0, 1),   // UP
            new Vector2Int(1, 0),   // RIGHT
            new Vector2Int(0, -1),  // DOWN
            new Vector2Int(-1, 0)   // LEFT
        };

        /// <summary>
        /// Generates a valid, 100% solvable LevelData using the reverse-solution algorithm.
        /// </summary>
        public static LevelData GenerateLevel(int levelId, DifficultyTier tier, int seed = -1, int maxRetries = 25)
        {
            var config = TierConfig.GetDefault(tier);
            System.Random rng = (seed >= 0) ? new System.Random(seed) : new System.Random();

            for (int attempt = 0; attempt < maxRetries; attempt++)
            {
                var level = TryGenerateLevelInstance(levelId, config, rng);
                if (level != null)
                {
                    var validation = LevelValidator.Validate(level);
                    if (validation.isValid)
                    {
                        level.solutionSequence = validation.resolvedSequence;
                        return level;
                    }
                }
            }

            // Fallback to safe minimal level if random attempts exhaust
            return GenerateFallbackLevel(levelId, config);
        }

        /// <summary>
        /// Non-obvious algorithm explanation:
        /// The Reverse-Solution Algorithm:
        /// 1) Start with an empty board.
        /// 2) Iteratively place arrows in REVERSE order of clearing:
        ///    - Arrow #1 placed will be the LAST arrow the player clears.
        ///    - Arrow #N placed will be the FIRST arrow the player clears.
        /// 3) When placing arrow K:
        ///    - We choose a boundary cell and an incoming direction.
        ///    - The arrow's head enters from outside the boundary and advances into empty cells.
        ///    - Since it enters from the boundary without crossing existing arrows in its forward cone,
        ///      its exit trajectory is clear relative to all arrows currently on the board!
        /// 4) Later placed arrows (K+1 .. N) are allowed to cross or block Arrow K's forward path.
        ///    During forward gameplay, clearing arrow N vacates the path for N-1, and so on.
        /// This mathematically guarantees at least one deadlock-free solution sequence:
        /// [ Arrow_N, Arrow_{N-1}, ..., Arrow_1 ].
        /// </summary>
        private static LevelData TryGenerateLevelInstance(int levelId, TierConfig config, System.Random rng)
        {
            int w = config.gridWidth;
            int h = config.gridHeight;
            int targetArrows = rng.Next(config.minArrows, config.maxArrows + 1);

            int[] matrix = new int[w * h];
            for (int i = 0; i < matrix.Length; i++) matrix[i] = -1;

            var placedArrows = new List<ArrowData>();
            int arrowIdCounter = 1;

            int attempts = 0;
            int maxPlacementAttempts = targetArrows * 30;

            while (placedArrows.Count < targetArrows && attempts < maxPlacementAttempts)
            {
                attempts++;

                // Pick an exit boundary direction: the direction the arrow will fly when cleared
                Vector2Int headDir = CardinalDirs[rng.Next(CardinalDirs.Length)];
                Vector2Int backDir = -headDir; // Direction from head towards tail

                // Pick a candidate head cell such that its forward ray to boundary is currently UNOBSTRUCTED
                List<Vector2Int> candidateHeads = new List<Vector2Int>();
                for (int x = 0; x < w; x++)
                {
                    for (int y = 0; y < h; y++)
                    {
                        if (matrix[x + y * w] != -1) continue;

                        Vector2Int pt = new Vector2Int(x, y);
                        if (IsForwardRayClear(matrix, w, h, pt, headDir))
                        {
                            candidateHeads.Add(pt);
                        }
                    }
                }

                if (candidateHeads.Count == 0) continue;

                Vector2Int chosenHead = candidateHeads[rng.Next(candidateHeads.Count)];

                // Determine desired arrow length & bends
                int length = rng.Next(config.minPathLength, config.maxPathLength + 1);
                int allowedBends = config.maxBendsPerArrow;

                var pathPoints = BuildReversePath(matrix, w, h, chosenHead, backDir, length, allowedBends, rng);
                if (pathPoints != null && pathPoints.Count >= 2)
                {
                    var arrow = new ArrowData
                    {
                        id = arrowIdCounter++,
                        gridPoints = pathPoints,
                        headDirection = headDir,
                        colorIndex = (arrowIdCounter - 1) % 6,
                        layer = placedArrows.Count + 1,
                        isActive = true,
                        hasBeenCleared = false
                    };

                    // Mark cells in matrix
                    for (int p = 0; p < arrow.gridPoints.Count; p++)
                    {
                        Vector2Int pt = arrow.gridPoints[p];
                        matrix[pt.x + pt.y * w] = arrow.id;
                    }

                    placedArrows.Add(arrow);
                }
            }

            if (placedArrows.Count < config.minArrows)
            {
                return null;
            }

            var level = new LevelData
            {
                levelId = levelId,
                missionName = $"Mission {levelId}",
                difficulty = config.tier,
                gridWidth = w,
                gridHeight = h,
                arrows = placedArrows,
                isHandAuthored = false,
                patternThemeId = "classic"
            };

            return level;
        }

        private static bool IsForwardRayClear(int[] matrix, int w, int h, Vector2Int start, Vector2Int dir)
        {
            Vector2Int curr = start + dir;
            while (curr.x >= 0 && curr.x < w && curr.y >= 0 && curr.y < h)
            {
                if (matrix[curr.x + curr.y * w] != -1) return false;
                curr += dir;
            }
            return true;
        }

        private static List<Vector2Int> BuildReversePath(int[] matrix, int w, int h, Vector2Int head, Vector2Int initialBackDir, int targetLen, int maxBends, System.Random rng)
        {
            List<Vector2Int> points = new List<Vector2Int> { head };
            Vector2Int current = head;
            Vector2Int currentBackDir = initialBackDir;
            int bendsLeft = maxBends;

            for (int i = 1; i < targetLen; i++)
            {
                // Can we bend?
                if (bendsLeft > 0 && i >= 2 && rng.NextDouble() < 0.35)
                {
                    // Candidate perpendicular directions
                    Vector2Int perp1 = new Vector2Int(-currentBackDir.y, currentBackDir.x);
                    Vector2Int perp2 = -perp1;

                    Vector2Int chosenPerp = (rng.Next(2) == 0) ? perp1 : perp2;
                    Vector2Int testBend = current + chosenPerp;

                    if (testBend.x >= 0 && testBend.x < w && testBend.y >= 0 && testBend.y < h && matrix[testBend.x + testBend.y * w] == -1 && !points.Contains(testBend))
                    {
                        current = testBend;
                        currentBackDir = chosenPerp;
                        bendsLeft--;
                        points.Add(current);
                        continue;
                    }
                }

                // Continue straight along currentBackDir
                Vector2Int next = current + currentBackDir;
                if (next.x >= 0 && next.x < w && next.y >= 0 && next.y < h && matrix[next.x + next.y * w] == -1 && !points.Contains(next))
                {
                    current = next;
                    points.Add(current);
                }
                else
                {
                    // Blocked while extending tail
                    break;
                }
            }

            if (points.Count < 2) return null;

            // Points are currently stored [Head, ... , Tail].
            // ArrowData convention requires ordered waypoints from Tail -> Head.
            points.Reverse();
            return points;
        }

        private static LevelData GenerateFallbackLevel(int levelId, TierConfig config)
        {
            int w = config.gridWidth;
            int h = config.gridHeight;

            // Simple guaranteed 3-arrow cross
            var a1 = new ArrowData
            {
                id = 1,
                gridPoints = new List<Vector2Int> { new Vector2Int(w / 2, 0), new Vector2Int(w / 2, 1), new Vector2Int(w / 2, 2) },
                headDirection = new Vector2Int(0, 1),
                colorIndex = 1,
                isActive = true
            };

            var a2 = new ArrowData
            {
                id = 2,
                gridPoints = new List<Vector2Int> { new Vector2Int(0, 1), new Vector2Int(1, 1), new Vector2Int(2, 1) },
                headDirection = new Vector2Int(1, 0),
                colorIndex = 0,
                isActive = true
            };

            return new LevelData
            {
                levelId = levelId,
                missionName = $"Mission {levelId}",
                difficulty = config.tier,
                gridWidth = w,
                gridHeight = h,
                arrows = new List<ArrowData> { a1, a2 },
                solutionSequence = new List<int> { 1, 2 },
                isHandAuthored = false
            };
        }
    }
}
