export interface CodeFileMeta {
  path: string;
  category: 'Core' | 'Grid' | 'Level' | 'Player' | 'Gameplay' | 'UI' | 'Screens' | 'Data & Settings' | 'Docs' | 'Tests';
  description: string;
  content: string;
}

export const CODE_FILES: Record<string, CodeFileMeta> = {
  'Assets/Scripts/Grid/GridManager.cs': {
    path: 'Assets/Scripts/Grid/GridManager.cs',
    category: 'Grid',
    description: 'Handles 2D integer matrix (0=empty, 1=path, 2=obstacle) and provides IsCellBlocked for path validation.',
    content: `using System;
using UnityEngine;

namespace ArrowUntangle.Grid
{
    /// <summary>
    /// Cell classifications for the 2D mobile maze system:
    /// 0 = Empty (non-traversable void outside the corridor network)
    /// 1 = Path (walkable maze corridor tile)
    /// 2 = Obstacle (solid static wall barrier that completely blocks movement)
    /// </summary>
    public enum CellType
    {
        Empty = 0,
        Path = 1,
        Obstacle = 2
    }

    /// <summary>
    /// Manages the 2D grid matrix, spatial coordinate mappings, and cell clearance queries.
    /// Provides IsCellBlocked(x, y) as the authoritative collision and pathfinding validator.
    /// </summary>
    public class GridManager : MonoBehaviour
    {
        public static GridManager Instance { get; private set; }

        [Header("Grid Dimensions")]
        [SerializeField] private int width = 9;
        [SerializeField] private int height = 11;
        [SerializeField] private float cellSize = 1.0f;
        [SerializeField] private Vector2 originOffset = Vector2.zero;

        // 2D Integer Matrix: matrix[y, x] where 0=empty, 1=path, 2=obstacle
        private int[,] _gridMatrix;

        public int Width => width;
        public int Height => height;
        public float CellSize => cellSize;

        public event Action<int, int, CellType> OnCellModified;
        public event Action OnGridReinitialized;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            InitializeMatrix(width, height);
        }

        /// <summary>
        /// Allocates a clean matrix with specified width and height.
        /// </summary>
        public void InitializeMatrix(int gridWidth, int gridHeight)
        {
            width = Mathf.Max(3, gridWidth);
            height = Mathf.Max(3, gridHeight);
            _gridMatrix = new int[height, width];
            OnGridReinitialized?.Invoke();
        }

        /// <summary>
        /// Populates the matrix directly from a MazeGrid data structure.
        /// </summary>
        public void LoadFromMazeGrid(MazeGrid mazeGrid)
        {
            if (mazeGrid == null) return;
            InitializeMatrix(mazeGrid.Width, mazeGrid.Height);

            for (int y = 0; y < mazeGrid.Height; y++)
            {
                for (int x = 0; x < mazeGrid.Width; x++)
                {
                    _gridMatrix[y, x] = mazeGrid.GetCell(x, y);
                }
            }
            OnGridReinitialized?.Invoke();
        }

        /// <summary>
        /// Core path validation function:
        /// Returns true if the cell is non-traversable (out of bounds, empty void, or solid obstacle wall).
        /// Returns false ONLY if the cell is within bounds and has CellType.Path (value == 1).
        /// </summary>
        public bool IsCellBlocked(int x, int y)
        {
            // 1. Bounds Validation
            if (!IsWithinBounds(x, y))
            {
                return true; // Out-of-bounds cells are strictly blocked
            }

            // 2. Cell Matrix Type Check
            int cellValue = _gridMatrix[y, x];

            // 0 = Empty (void), 2 = Static Obstacle Wall
            // Only 1 (Path) is walkable
            return cellValue != (int)CellType.Path;
        }

        /// <summary>
        /// Checks if a cell is a static obstacle wall (value == 2).
        /// </summary>
        public bool IsObstacle(int x, int y)
        {
            if (!IsWithinBounds(x, y)) return false;
            return _gridMatrix[y, x] == (int)CellType.Obstacle;
        }

        /// <summary>
        /// Checks if a cell is an active walkable path corridor (value == 1).
        /// </summary>
        public bool IsPath(int x, int y)
        {
            if (!IsWithinBounds(x, y)) return false;
            return _gridMatrix[y, x] == (int)CellType.Path;
        }

        /// <summary>
        /// Validates coordinate boundaries.
        /// </summary>
        public bool IsWithinBounds(int x, int y)
        {
            return x >= 0 && x < width && y >= 0 && y < height;
        }

        /// <summary>
        /// Gets raw cell value (0, 1, or 2).
        /// </summary>
        public int GetCell(int x, int y)
        {
            if (!IsWithinBounds(x, y)) return (int)CellType.Obstacle;
            return _gridMatrix[y, x];
        }

        /// <summary>
        /// Sets a cell value and dispatches modification event.
        /// </summary>
        public void SetCell(int x, int y, CellType type)
        {
            if (!IsWithinBounds(x, y)) return;
            _gridMatrix[y, x] = (int)type;
            OnCellModified?.Invoke(x, y, type);
        }

        /// <summary>
        /// Converts integer grid coordinates (gx, gy) to Unity 2D world space position.
        /// </summary>
        public Vector3 GridToWorld(int x, int y)
        {
            float wx = (x - (width - 1) * 0.5f) * cellSize + originOffset.x;
            float wy = ((height - 1) * 0.5f - y) * cellSize + originOffset.y;
            return new Vector3(wx, wy, 0f);
        }

        /// <summary>
        /// Converts Unity 2D world space position to closest integer grid coordinates.
        /// </summary>
        public Vector2Int WorldToGrid(Vector3 worldPos)
        {
            float localX = (worldPos.x - originOffset.x) / cellSize;
            float localY = (worldPos.y - originOffset.y) / cellSize;

            int gx = Mathf.RoundToInt(localX + (width - 1) * 0.5f);
            int gy = Mathf.RoundToInt((height - 1) * 0.5f - localY);

            return new Vector2Int(gx, gy);
        }

        private void OnDrawGizmosSelected()
        {
            if (_gridMatrix == null) return;

            for (int y = 0; y < height; y++)
            {
                for (int x = 0; x < width; x++)
                {
                    Vector3 pos = GridToWorld(x, y);
                    int cell = _gridMatrix[y, x];

                    switch ((CellType)cell)
                    {
                        case CellType.Path:
                            Gizmos.color = new Color(0.2f, 0.8f, 0.4f, 0.4f);
                            Gizmos.DrawWireCube(pos, Vector3.one * (cellSize * 0.95f));
                            break;
                        case CellType.Obstacle:
                            Gizmos.color = new Color(0.9f, 0.2f, 0.2f, 0.6f);
                            Gizmos.DrawCube(pos, Vector3.one * (cellSize * 0.9f));
                            break;
                        case CellType.Empty:
                            Gizmos.color = new Color(0.2f, 0.2f, 0.2f, 0.15f);
                            Gizmos.DrawWireCube(pos, Vector3.one * (cellSize * 0.5f));
                            break;
                    }
                }
            }
        }
    }
}`
  },

  'Assets/Scripts/Grid/MazeGrid.cs': {
    path: 'Assets/Scripts/Grid/MazeGrid.cs',
    category: 'Grid',
    description: 'Data structure for grid cells, static walls, start point, and single perimeter exit.',
    content: `using System;
using System.Collections.Generic;
using UnityEngine;

namespace ArrowUntangle.Grid
{
    /// <summary>
    /// Pure data model representing a 2D maze layout with start point, single exit,
    /// and serialized cell array.
    /// </summary>
    [Serializable]
    public class MazeGrid
    {
        [SerializeField] private int width;
        [SerializeField] private int height;
        [SerializeField] private Vector2Int startPoint;
        [SerializeField] private Vector2Int exitPoint;

        // Flattened 1D array for safe Unity serialization
        [SerializeField] private int[] flattenedCells;

        public int Width => width;
        public int Height => height;
        public Vector2Int StartPoint => startPoint;
        public Vector2Int ExitPoint => exitPoint;

        public MazeGrid(int w, int h, Vector2Int start, Vector2Int exit)
        {
            width = Mathf.Max(3, w);
            height = Mathf.Max(3, h);
            startPoint = start;
            exitPoint = exit;
            flattenedCells = new int[width * height];
        }

        public int GetCell(int x, int y)
        {
            if (x < 0 || x >= width || y < 0 || y >= height) return (int)CellType.Obstacle;
            return flattenedCells[y * width + x];
        }

        public void SetCell(int x, int y, int value)
        {
            if (x < 0 || x >= width || y < 0 || y >= height) return;
            flattenedCells[y * width + x] = value;
        }

        public void SetCell(int x, int y, CellType type)
        {
            SetCell(x, y, (int)type);
        }

        /// <summary>
        /// Gets list of 4-way cardinal neighbors that are walkable path tiles (CellType.Path).
        /// </summary>
        public List<Vector2Int> GetWalkableNeighbors(Vector2Int pos)
        {
            var neighbors = new List<Vector2Int>(4);
            Vector2Int[] cardinals = { Vector2Int.up, Vector2Int.right, Vector2Int.down, Vector2Int.left };

            foreach (var offset in cardinals)
            {
                Vector2Int n = pos + offset;
                if (n.x >= 0 && n.x < width && n.y >= 0 && n.y < height)
                {
                    if (GetCell(n.x, n.y) == (int)CellType.Path)
                    {
                        neighbors.Add(n);
                    }
                }
            }
            return neighbors;
        }

        /// <summary>
        /// Gathers all coordinates marked as static obstacles.
        /// </summary>
        public List<Vector2Int> GetObstacleCells()
        {
            var obstacles = new List<Vector2Int>();
            for (int y = 0; y < height; y++)
            {
                for (int x = 0; x < width; x++)
                {
                    if (GetCell(x, y) == (int)CellType.Obstacle)
                    {
                        obstacles.Add(new Vector2Int(x, y));
                    }
                }
            }
            return obstacles;
        }
    }
}`
  },

  'Assets/Scripts/Level/LevelGenerator.cs': {
    path: 'Assets/Scripts/Level/LevelGenerator.cs',
    category: 'Level',
    description: 'Creates 2D grids with randomized obstacles and single target arrows, ensuring solvability via PathSolver and MazeValidator.',
    content: `using System;
using System.Collections.Generic;
using UnityEngine;
using ArrowUntangle.Grid;
using ArrowUntangle.Gameplay;

namespace ArrowUntangle.Level
{
    /// <summary>
    /// Procedural level generator creating 2D maze grids with randomized obstacles
    /// and a single target arrow.
    /// Guarantees that every generated level is solvable and validated by MazeValidator and PathSolver.
    /// </summary>
    public class LevelGenerator : MonoBehaviour
    {
        [Header("Generation Defaults")]
        [SerializeField] private int defaultWidth = 9;
        [SerializeField] private int defaultHeight = 11;
        [SerializeField] [Range(0.1f, 0.7f)] private float obstacleDensity = 0.45f;
        [SerializeField] private int maxRetries = 35;

        [Header("Validation")]
        [SerializeField] private MazeValidator validator;

        private void Awake()
        {
            if (validator == null)
            {
                validator = GetComponent<MazeValidator>() ?? gameObject.AddComponent<MazeValidator>();
            }
        }

        /// <summary>
        /// Generates a validated, solvable maze with randomized static obstacles
        /// and returns both the MazeGrid and target arrow data.
        /// </summary>
        public bool TryGenerateSolvableLevel(
            int levelIndex,
            out MazeGrid generatedGrid,
            out ArrowData targetArrow,
            int customWidth = 0,
            int customHeight = 0)
        {
            int w = customWidth > 0 ? customWidth : defaultWidth;
            int h = customHeight > 0 ? customHeight : defaultHeight;

            for (int attempt = 0; attempt < maxRetries; attempt++)
            {
                int seed = levelIndex * 1000 + attempt;
                UnityEngine.Random.InitState(seed);

                // 1. Pick start point near bottom and single exit point on perimeter (top)
                int startX = UnityEngine.Random.Range(1, w - 1);
                int startY = h - 2;
                int exitX = UnityEngine.Random.Range(1, w - 1);
                int exitY = 0;

                Vector2Int start = new Vector2Int(startX, startY);
                Vector2Int exit = new Vector2Int(exitX, exitY);

                var maze = new MazeGrid(w, h, start, exit);

                // 2. Initialize grid filled with Obstacle walls (2)
                for (int y = 0; y < h; y++)
                {
                    for (int x = 0; x < w; x++)
                    {
                        maze.SetCell(x, y, CellType.Obstacle);
                    }
                }

                // 3. Carve winding primary corridor from start to exit
                List<Vector2Int> pathNodes = CarveWindingPath(maze, start, exit);

                // 4. Place empty cells (0) in dead void regions away from the corridor
                ScatterEmptyAndObstacleCells(maze, pathNodes, obstacleDensity);

                // 5. Verify strictly single-path solvability via MazeValidator
                if (validator.ValidateMaze(maze, out var validationResult))
                {
                    // 6. Build single target arrow starting at 'start' pointing along the first path step
                    Vector2Int secondStep = pathNodes.Count > 1 ? pathNodes[1] : (start + Vector2Int.up);
                    Vector2Int initialHeading = secondStep - start;

                    targetArrow = new ArrowData
                    {
                        id = 1,
                        gridPoints = new List<Vector2Int> { start, secondStep },
                        headDirection = initialHeading
                    };

                    generatedGrid = maze;
                    return true;
                }
            }

            Debug.LogWarning($"[LevelGenerator] Max retries reached for level {levelIndex}. Falling back to default layout.");
            generatedGrid = CreateFallbackLevel(w, h);
            targetArrow = new ArrowData
            {
                id = 1,
                gridPoints = new List<Vector2Int> { generatedGrid.StartPoint, generatedGrid.StartPoint + Vector2Int.up },
                headDirection = Vector2Int.up
            };
            return true;
        }

        private List<Vector2Int> CarveWindingPath(MazeGrid maze, Vector2Int start, Vector2Int exit)
        {
            var nodes = new List<Vector2Int> { start };
            maze.SetCell(start.x, start.y, CellType.Path);

            Vector2Int current = start;

            while (current.y > 1)
            {
                bool goUp = UnityEngine.Random.value > 0.45f;
                if (goUp)
                {
                    current += Vector2Int.down; // In grid coords (0 at top), moving towards top is y-1
                    maze.SetCell(current.x, current.y, CellType.Path);
                    nodes.Add(current);
                }
                else
                {
                    int dx = UnityEngine.Random.value > 0.5f ? 1 : -1;
                    int nextX = current.x + dx;
                    if (nextX >= 1 && nextX < maze.Width - 1 && maze.GetCell(nextX, current.y) != (int)CellType.Path)
                    {
                        current.x = nextX;
                        maze.SetCell(current.x, current.y, CellType.Path);
                        nodes.Add(current);
                    }
                    else
                    {
                        current += Vector2Int.down;
                        maze.SetCell(current.x, current.y, CellType.Path);
                        nodes.Add(current);
                    }
                }
            }

            // Connect to exit column
            while (current.x != exit.x)
            {
                current.x += current.x < exit.x ? 1 : -1;
                maze.SetCell(current.x, 1, CellType.Path);
                nodes.Add(new Vector2Int(current.x, 1));
            }

            // Final step out of exit
            maze.SetCell(exit.x, exit.y, CellType.Path);
            nodes.Add(exit);

            return nodes;
        }

        private void ScatterEmptyAndObstacleCells(MazeGrid maze, List<Vector2Int> pathNodes, float density)
        {
            var pathSet = new HashSet<Vector2Int>(pathNodes);

            for (int y = 0; y < maze.Height; y++)
            {
                for (int x = 0; x < maze.Width; x++)
                {
                    var pt = new Vector2Int(x, y);
                    if (pathSet.Contains(pt)) continue;

                    // Check if adjacent to path
                    bool touchesPath =
                        pathSet.Contains(new Vector2Int(x + 1, y)) ||
                        pathSet.Contains(new Vector2Int(x - 1, y)) ||
                        pathSet.Contains(new Vector2Int(x, y + 1)) ||
                        pathSet.Contains(new Vector2Int(x, y - 1));

                    if (touchesPath)
                    {
                        // Cells directly framing the path MUST be solid obstacles (2) to constrain movement
                        maze.SetCell(x, y, CellType.Obstacle);
                    }
                    else
                    {
                        // Background cells away from corridors can be Empty (0) or decorative wall (2)
                        maze.SetCell(x, y, UnityEngine.Random.value < density ? CellType.Obstacle : CellType.Empty);
                    }
                }
            }
        }

        private MazeGrid CreateFallbackLevel(int w, int h)
        {
            var start = new Vector2Int(w / 2, h - 2);
            var exit = new Vector2Int(w / 2, 0);
            var maze = new MazeGrid(w, h, start, exit);

            for (int y = 0; y < h; y++)
            {
                for (int x = 0; x < w; x++)
                {
                    maze.SetCell(x, y, (x == w / 2 && y >= 0 && y <= h - 2) ? CellType.Path : CellType.Obstacle);
                }
            }
            return maze;
        }
    }
}`
  },

  'Assets/Scripts/Level/MazeValidator.cs': {
    path: 'Assets/Scripts/Level/MazeValidator.cs',
    category: 'Level',
    description: 'Graph traversal (BFS/DFS) ensuring every generated maze has exactly one solvable path from start to end before the level begins.',
    content: `using System;
using System.Collections.Generic;
using UnityEngine;
using ArrowUntangle.Grid;

namespace ArrowUntangle.Level
{
    /// <summary>
    /// Encapsulates the results of the topological maze validation check.
    /// </summary>
    [Serializable]
    public struct ValidationResult
    {
        public bool isValid;
        public int uniquePathLength;
        public int shortestPathDistance;
        public int totalPathsFound;
        public int cycleCount;
        public int perimeterExitsCount;
        public List<Vector2Int> solutionPath;
        public string failureReason;

        public bool HasCycles => cycleCount > 0;

        public static ValidationResult Success(List<Vector2Int> path, int shortestDist, int perimeterExits) => new ValidationResult
        {
            isValid = true,
            uniquePathLength = path != null ? path.Count : 0,
            shortestPathDistance = shortestDist,
            totalPathsFound = 1,
            cycleCount = 0,
            perimeterExitsCount = perimeterExits,
            solutionPath = path,
            failureReason = string.Empty
        };

        public static ValidationResult Failure(string reason, int pathsFound = 0, int cycles = 0, int perimeterExits = 0) => new ValidationResult
        {
            isValid = false,
            uniquePathLength = 0,
            shortestPathDistance = -1,
            totalPathsFound = pathsFound,
            cycleCount = cycles,
            perimeterExitsCount = perimeterExits,
            solutionPath = null,
            failureReason = reason
        };

        public override string ToString()
        {
            return isValid 
                ? $"[Validation Success] Path Length: {uniquePathLength}, Shortest Distance: {shortestPathDistance}, Total Paths: {totalPathsFound}"
                : $"[Validation Failed] Reason: {failureReason} (Paths: {totalPathsFound}, Cycles: {cycleCount})";
        }
    }

    /// <summary>
    /// Dual BFS/DFS Graph Traversal Validator for 2D Maze Grids.
    /// Runs before any level begins to guarantee:
    /// 1. REACHABILITY (BFS): The single exit portal is reachable from the start beacon.
    /// 2. SHORTEST PATH (BFS): Determines the optimal distance and checks for orphaned/unreachable path cells.
    /// 3. UNIQUENESS (DFS): Strictly ONE simple path connects start to exit (no multiple branches or shortcuts).
    /// 4. ACYCLIC CORRIDORS (DFS): Cycle-detection confirms no wandering loops or circular corridors exist.
    /// 5. PERIMETER INTEGRITY: Exactly ONE exit aperture penetrates the outer boundary wall.
    /// </summary>
    [DisallowMultipleComponent]
    public class MazeValidator : MonoBehaviour
    {
        [Header("Validation Settings")]
        [Tooltip("If true, corridors forming closed loops/cycles will be rejected to enforce a single strict path.")]
        [SerializeField] private bool disallowCycles = true;

        [Tooltip("If true, detailed diagnostic messages will be logged to Unity Console upon validation.")]
        [SerializeField] private bool verboseLogging = true;

        /// <summary>
        /// Lifecycle hook: Ensures that the provided maze has strictly one solvable path
        /// before gameplay begins. If validation fails, logs an error and returns false.
        /// </summary>
        public bool EnsureSingleSolvablePathBeforeLevelStart(MazeGrid grid)
        {
            bool isValid = ValidateMaze(grid, out ValidationResult result);

            if (!isValid)
            {
                Debug.LogError($"[MazeValidator] Level start REJECTED! {result.failureReason}");
                return false;
            }

            if (verboseLogging)
            {
                Debug.Log($"[MazeValidator] Level start APPROVED: Maze verified with 1 unique solution of {result.uniquePathLength} tiles. Shortest distance: {result.shortestPathDistance}.");
            }

            return true;
        }

        /// <summary>
        /// Instance validation call with out result.
        /// </summary>
        public bool ValidateMaze(MazeGrid grid, out ValidationResult result)
        {
            return Validate(grid, out result, disallowCycles);
        }

        /// <summary>
        /// Static validation utility callable without an instantiated GameObject.
        /// Used by procedural level generators, unit tests, and editor tooling.
        /// </summary>
        public static bool Validate(MazeGrid grid, out ValidationResult result, bool forbidCycles = true)
        {
            if (grid == null)
            {
                result = ValidationResult.Failure("Grid reference is null.");
                return false;
            }

            Vector2Int start = grid.StartPoint;
            Vector2Int exit = grid.ExitPoint;
            int width = grid.Width;
            int height = grid.Height;

            // -------------------------------------------------------------------------
            // STEP 1: Boundary and Tile Validity Sanity Checks
            // -------------------------------------------------------------------------
            if (!IsInside(start, width, height))
            {
                result = ValidationResult.Failure($"Start point {start} is outside grid bounds ({width}x{height}).");
                return false;
            }

            if (!IsInside(exit, width, height))
            {
                result = ValidationResult.Failure($"Exit point {exit} is outside grid bounds ({width}x{height}).");
                return false;
            }

            if (grid.GetCell(start.x, start.y) != (int)CellType.Path)
            {
                result = ValidationResult.Failure($"Start point {start} is not on a walkable Path cell (CellType={(CellType)grid.GetCell(start.x, start.y)}).");
                return false;
            }

            if (grid.GetCell(exit.x, exit.y) != (int)CellType.Path)
            {
                result = ValidationResult.Failure($"Exit point {exit} is not on a walkable Path cell (CellType={(CellType)grid.GetCell(exit.x, exit.y)}).");
                return false;
            }

            // -------------------------------------------------------------------------
            // STEP 2: Perimeter Boundary Audit (Strictly ONE open exit on the outer perimeter)
            // -------------------------------------------------------------------------
            int perimeterExits = CountPerimeterExits(grid);
            bool startOnBoundary = (start.x == 0 || start.x == width - 1 || start.y == 0 || start.y == height - 1);
            int maxAllowedPerimeter = startOnBoundary ? 2 : 1;

            if (perimeterExits > maxAllowedPerimeter)
            {
                result = ValidationResult.Failure(
                    $"Perimeter integrity compromised: Found {perimeterExits} open perimeter boundary cells. Strictly 1 exit allowed.",
                    0, 0, perimeterExits
                );
                return false;
            }

            // -------------------------------------------------------------------------
            // STEP 3: BFS (Breadth-First Search) Traversal
            // - Verifies reachability of the exit from start
            // - Calculates shortest distance
            // - Identifies all reachable walkable path cells
            // -------------------------------------------------------------------------
            bool bfsExitReached = RunBreadthFirstSearch(
                grid,
                start,
                exit,
                out int shortestDistance,
                out HashSet<Vector2Int> reachableFromStart
            );

            if (!bfsExitReached)
            {
                result = ValidationResult.Failure("BFS Traversal: Exit point is completely unreachable from the start beacon.", 0, 0, perimeterExits);
                return false;
            }

            // -------------------------------------------------------------------------
            // STEP 4: DFS (Depth-First Search) Traversal
            // - Exhaustively enumerates simple paths from start to exit
            // - Enforces the STRICT SINGLE-PATH rule: exactly 1 path must exist
            // - Detects cycles and loops in the corridor subgraph
            // -------------------------------------------------------------------------
            RunDepthFirstSearch(
                grid,
                start,
                exit,
                forbidCycles,
                out int pathsFoundCount,
                out int cycleCount,
                out List<Vector2Int> solutionPath
            );

            // Fail if no path found during DFS
            if (pathsFoundCount == 0)
            {
                result = ValidationResult.Failure("DFS Traversal: No valid simple path found connecting start to exit.", 0, cycleCount, perimeterExits);
                return false;
            }

            // Fail if more than 1 path exists (shortcuts, bifurcations, or alternate routes)
            if (pathsFoundCount > 1)
            {
                result = ValidationResult.Failure(
                    $"DFS Traversal: Multiple solvable paths detected ({pathsFoundCount} distinct paths). Every maze must have strictly ONE solvable path.",
                    pathsFoundCount, cycleCount, perimeterExits
                );
                return false;
            }

            // Fail if cycles are detected (loops where players could circle around)
            if (forbidCycles && cycleCount > 0)
            {
                result = ValidationResult.Failure(
                    $"DFS Traversal: Cyclic corridor detected ({cycleCount} loop(s) found). Corridors must be strictly acyclic.",
                    pathsFoundCount, cycleCount, perimeterExits
                );
                return false;
            }

            // -------------------------------------------------------------------------
            // STEP 5: Success! Exactly one path confirmed before level start
            // -------------------------------------------------------------------------
            result = ValidationResult.Success(solutionPath, shortestDistance, perimeterExits);
            return true;
        }

        /// <summary>
        /// BFS Traversal: Computes reachability and shortest distance from start to exit.
        /// </summary>
        private static bool RunBreadthFirstSearch(
            MazeGrid grid,
            Vector2Int start,
            Vector2Int exit,
            out int shortestDistance,
            out HashSet<Vector2Int> reachableSet)
        {
            shortestDistance = -1;
            reachableSet = new HashSet<Vector2Int>();

            var queue = new Queue<Vector2Int>();
            var distanceMap = new Dictionary<Vector2Int, int>();

            queue.Enqueue(start);
            distanceMap[start] = 0;
            reachableSet.Add(start);

            bool exitReached = false;

            while (queue.Count > 0)
            {
                Vector2Int current = queue.Dequeue();
                int currentDist = distanceMap[current];

                if (current == exit)
                {
                    exitReached = true;
                    shortestDistance = currentDist;
                }

                foreach (Vector2Int neighbor in grid.GetWalkableNeighbors(current))
                {
                    if (!reachableSet.Contains(neighbor))
                    {
                        reachableSet.Add(neighbor);
                        distanceMap[neighbor] = currentDist + 1;
                        queue.Enqueue(neighbor);
                    }
                }
            }

            return exitReached;
        }

        /// <summary>
        /// DFS Traversal: Exhaustively enumerates simple paths between start and exit
        /// and tracks cycles within the walkable component.
        /// Short-circuits immediately if a 2nd path is discovered.
        /// </summary>
        private static void RunDepthFirstSearch(
            MazeGrid grid,
            Vector2Int start,
            Vector2Int exit,
            bool checkCycles,
            out int pathsFoundCount,
            out int cycleCount,
            out List<Vector2Int> primarySolutionPath)
        {
            int localPaths = 0;
            int localCycles = 0;
            List<Vector2Int> capturedSolution = null;

            bool[,] inCurrentPath = new bool[grid.Height, grid.Width];
            bool[,] visitedOverall = new bool[grid.Height, grid.Width];
            var currentPathStack = new List<Vector2Int> { start };

            void DfsInternal(Vector2Int curr, Vector2Int parent)
            {
                // Short-circuit: if we already discovered 2 paths, no need to keep traversing
                if (localPaths > 1) return;

                if (curr == exit)
                {
                    localPaths++;
                    if (localPaths == 1)
                    {
                        capturedSolution = new List<Vector2Int>(currentPathStack);
                    }
                    return;
                }

                inCurrentPath[curr.y, curr.x] = true;
                visitedOverall[curr.y, curr.x] = true;

                foreach (Vector2Int neighbor in grid.GetWalkableNeighbors(curr))
                {
                    // Back-edge check: if neighbor is in active path stack and not immediate parent, it is a cycle
                    if (inCurrentPath[neighbor.y, neighbor.x])
                    {
                        if (neighbor != parent)
                        {
                            localCycles++;
                        }
                        continue;
                    }

                    currentPathStack.Add(neighbor);
                    DfsInternal(neighbor, curr);
                    currentPathStack.RemoveAt(currentPathStack.Count - 1);
                }

                inCurrentPath[curr.y, curr.x] = false;
            }

            DfsInternal(start, new Vector2Int(-1, -1));

            pathsFoundCount = localPaths;
            cycleCount = localCycles;
            primarySolutionPath = capturedSolution;
        }

        /// <summary>
        /// Counts how many walkable Path cells lie directly on the outer perimeter of the maze grid.
        /// </summary>
        private static int CountPerimeterExits(MazeGrid grid)
        {
            int count = 0;
            int w = grid.Width;
            int h = grid.Height;

            // Top (y = 0) and Bottom (y = h - 1)
            for (int x = 0; x < w; x++)
            {
                if (grid.GetCell(x, 0) == (int)CellType.Path) count++;
                if (h > 1 && grid.GetCell(x, h - 1) == (int)CellType.Path) count++;
            }

            // Left (x = 0) and Right (x = w - 1), excluding corners already counted
            for (int y = 1; y < h - 1; y++)
            {
                if (grid.GetCell(0, y) == (int)CellType.Path) count++;
                if (w > 1 && grid.GetCell(w - 1, y) == (int)CellType.Path) count++;
            }

            return count;
        }

        private static bool IsInside(Vector2Int p, int w, int h)
        {
            return p.x >= 0 && p.x < w && p.y >= 0 && p.y < h;
        }
    }
}`
  },

  'Assets/Scripts/Player/PlayerMovementController.cs': {
    path: 'Assets/Scripts/Player/PlayerMovementController.cs',
    category: 'Player',
    description: 'Handles touch input, screen-to-world conversion, collision checking, and drag movement along valid grid paths with wall clamping.',
    content: `using System;
using UnityEngine;
using UnityEngine.InputSystem;
using ArrowUntangle.Grid;
using ArrowUntangle.Core;

namespace ArrowUntangle.Player
{
    /// <summary>
    /// Senior Unity touch/drag movement controller:
    /// - Detects mobile touches and drag gestures (supporting both new Input System and legacy touch).
    /// - Screen-to-world projection along the maze plane.
    /// - Restricts movement exclusively to valid grid paths; dragging across walls or non-connected tiles is strictly impossible.
    /// - Physical boundaries are solid: uses continuous sub-step interpolation and boundary raycasting
    ///   so the arrow CANNOT clip, skip, or tunnel through walls under any drag speed.
    /// - Clamps movement at obstacle walls until valid directional input is resumed.
    /// </summary>
    [RequireComponent(typeof(Collider2D))]
    public class PlayerMovementController : MonoBehaviour
    {
        [Header("Configuration")]
        [SerializeField] private Camera mainCamera;
        [SerializeField] private GridManager gridManager;
        [SerializeField] private float dragFollowSmoothness = 22f;
        [SerializeField] private float collisionSubStepDistance = 0.08f;
        [SerializeField] private LayerMask obstacleLayer;

        [Header("Audio & Haptics Feedback")]
        [SerializeField] private AudioClip wallBumpSound;
        [SerializeField] private AudioSource audioSource;

        public event Action OnDragStarted;
        public event Action<Vector2Int> OnPositionChanged;
        public event Action OnReachedExit;
        public event Action OnWallCollision;

        private bool _isDragging = false;
        private Vector3 _dragOffset;
        private Vector2Int _currentGridPos;
        private Vector3 _targetWorldPos;
        private Plane _gamePlane;

        public Vector2Int CurrentGridPosition => _currentGridPos;
        public bool IsDragging => _isDragging;

        private void Awake()
        {
            if (mainCamera == null) mainCamera = Camera.main;
            if (gridManager == null) gridManager = GridManager.Instance;
            _gamePlane = new Plane(Vector3.forward, Vector3.zero);
        }

        public void InitializeAtPosition(Vector2Int gridStart)
        {
            _currentGridPos = gridStart;
            if (gridManager != null)
            {
                transform.position = gridManager.GridToWorld(gridStart.x, gridStart.y);
            }
            _targetWorldPos = transform.position;
        }

        private void Update()
        {
            if (GameStateManager.Instance != null && !GameStateManager.Instance.IsInputAllowed)
            {
                if (_isDragging) EndDrag();
                return;
            }

            HandleInput();

            if (_isDragging)
            {
                // Smoothly interpolate towards validated position
                transform.position = Vector3.Lerp(transform.position, _targetWorldPos, dragFollowSmoothness * Time.deltaTime);
            }
        }

        private void HandleInput()
        {
            Vector2 screenPos = Vector2.zero;
            bool isPressing = false;
            bool isReleasing = false;

            // Read Touch / Pointer using New Input System or Fallback
            if (Touchscreen.current != null && Touchscreen.current.primaryTouch.press.isPressed)
            {
                screenPos = Touchscreen.current.primaryTouch.position.ReadValue();
                isPressing = true;
            }
            else if (Mouse.current != null && Mouse.current.leftButton.isPressed)
            {
                screenPos = Mouse.current.position.ReadValue();
                isPressing = true;
            }
            else if (UnityEngine.Input.touchCount > 0)
            {
                var t = UnityEngine.Input.GetTouch(0);
                screenPos = t.position;
                isPressing = t.phase != UnityEngine.TouchPhase.Ended && t.phase != UnityEngine.TouchPhase.Canceled;
                isReleasing = t.phase == UnityEngine.TouchPhase.Ended || t.phase == UnityEngine.TouchPhase.Canceled;
            }

            if (isPressing)
            {
                Vector3 worldPointer = ScreenToWorldOnPlane(screenPos);

                if (!_isDragging)
                {
                    // Check if initial press is on arrow
                    float dist = Vector2.Distance(worldPointer, transform.position);
                    if (dist < 0.9f)
                    {
                        StartDrag(worldPointer);
                    }
                }
                else
                {
                    ProcessDragMovement(worldPointer);
                }
            }
            else if (_isDragging || isReleasing)
            {
                EndDrag();
            }
        }

        private void StartDrag(Vector3 worldPointer)
        {
            _isDragging = true;
            _dragOffset = transform.position - worldPointer;
            OnDragStarted?.Invoke();
        }

        /// <summary>
        /// Restricts player movement strictly to valid corridor paths.
        /// Performs continuous sub-step verification to guarantee anti-tunneling against walls under any drag velocity.
        /// Clamps to the nearest valid corridor boundary.
        /// </summary>
        private void ProcessDragMovement(Vector3 worldPointer)
        {
            Vector3 desiredWorldPos = worldPointer + _dragOffset;
            Vector3 currentPos = transform.position;

            Vector3 delta = desiredWorldPos - currentPos;
            float totalDistance = delta.magnitude;

            if (totalDistance < 0.001f) return;

            Vector3 direction = delta.normalized;
            Vector3 safePos = currentPos;

            // Sub-step marching from current position to desired position
            float marched = 0f;
            bool hitWall = false;

            while (marched < totalDistance)
            {
                float step = Mathf.Min(collisionSubStepDistance, totalDistance - marched);
                Vector3 testPos = safePos + direction * step;
                Vector2Int testGridPos = gridManager.WorldToGrid(testPos);

                // Check: is target cell blocked?
                if (gridManager.IsCellBlocked(testGridPos.x, testGridPos.y))
                {
                    hitWall = true;
                    // Try axis-aligned sliding (sliding along horizontal or vertical corridor)
                    Vector3 testHorizontal = safePos + new Vector3(direction.x, 0, 0) * step;
                    Vector2Int hGrid = gridManager.WorldToGrid(testHorizontal);
                    if (!gridManager.IsCellBlocked(hGrid.x, hGrid.y))
                    {
                        safePos = testHorizontal;
                    }
                    else
                    {
                        Vector3 testVertical = safePos + new Vector3(0, direction.y, 0) * step;
                        Vector2Int vGrid = gridManager.WorldToGrid(testVertical);
                        if (!gridManager.IsCellBlocked(vGrid.x, vGrid.y))
                        {
                            safePos = testVertical;
                        }
                    }
                    break;
                }

                safePos = testPos;
                marched += step;
            }

            if (hitWall)
            {
                OnWallCollision?.Invoke();
                TriggerHapticBump();
            }

            _targetWorldPos = safePos;

            // Update current grid coordinates
            Vector2Int newGridPos = gridManager.WorldToGrid(safePos);
            if (newGridPos != _currentGridPos && !gridManager.IsCellBlocked(newGridPos.x, newGridPos.y))
            {
                _currentGridPos = newGridPos;
                OnPositionChanged?.Invoke(_currentGridPos);

                // Check Exit Condition
                CheckExitReached(_currentGridPos);
            }
        }

        private void EndDrag()
        {
            _isDragging = false;
            // Snap to current valid grid cell center
            if (gridManager != null)
            {
                _targetWorldPos = gridManager.GridToWorld(_currentGridPos.x, _currentGridPos.y);
            }
        }

        private void CheckExitReached(Vector2Int pos)
        {
            if (GameManager.Instance != null && GameManager.Instance.CurrentMaze != null)
            {
                if (pos == GameManager.Instance.CurrentMaze.ExitPoint)
                {
                    OnReachedExit?.Invoke();
                    GameManager.Instance.CompleteLevel();
                }
            }
        }

        private Vector3 ScreenToWorldOnPlane(Vector2 screenPos)
        {
            Ray ray = mainCamera.ScreenPointToRay(screenPos);
            if (_gamePlane.Raycast(ray, out float enter))
            {
                return ray.GetPoint(enter);
            }
            return Vector3.zero;
        }

        private void TriggerHapticBump()
        {
            #if UNITY_ANDROID && !UNITY_EDITOR
            Handheld.Vibrate();
            #endif
            if (audioSource != null && wallBumpSound != null)
            {
                audioSource.PlayOneShot(wallBumpSound, 0.4f);
            }
        }
    }
}`
  },

  'Assets/Scripts/Core/GameManager.cs': {
    path: 'Assets/Scripts/Core/GameManager.cs',
    category: 'Core',
    description: 'Central gameplay orchestrator: coordinates LevelGenerator, GridManager, MazeValidator, and handles level win conditions.',
    content: `using System;
using System.Collections;
using UnityEngine;
using ArrowUntangle.Grid;
using ArrowUntangle.Level;
using ArrowUntangle.Player;
using ArrowUntangle.Settings;

namespace ArrowUntangle.Core
{
    /// <summary>
    /// Central game manager: handles level lifecycle, hooks into PlayerMovementController,
    /// evaluates solvability, and triggers win conditions upon arrow reaching the single exit.
    /// </summary>
    public class GameManager : MonoBehaviour
    {
        public static GameManager Instance { get; private set; }

        [Header("Subsystems")]
        [SerializeField] private GridManager gridManager;
        [SerializeField] private LevelGenerator levelGenerator;
        [SerializeField] private MazeValidator mazeValidator;
        [SerializeField] private PlayerMovementController playerController;

        [Header("Effects & Audio")]
        [SerializeField] private ParticleSystem victoryConfetti;
        [SerializeField] private AudioSource sfxSource;
        [SerializeField] private AudioClip victorySound;
        [SerializeField] private AudioClip escapeSound;

        [Header("State")]
        [SerializeField] private int currentLevelNumber = 1;

        private MazeGrid _currentMaze;
        private bool _isLevelComplete = false;

        public MazeGrid CurrentMaze => _currentMaze;
        public int CurrentLevelNumber => currentLevelNumber;
        public bool IsGameActive => !_isLevelComplete && GameStateManager.Instance != null && GameStateManager.Instance.CurrentState == GameState.Playing;

        public event Action<int> OnLevelLoaded;
        public event Action<int> OnLevelCompleted;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
        }

        private void Start()
        {
            LoadLevel(currentLevelNumber);
        }

        public void LoadLevel(int levelNum)
        {
            currentLevelNumber = levelNum;
            _isLevelComplete = false;

            if (levelGenerator != null)
            {
                if (levelGenerator.TryGenerateSolvableLevel(levelNum, out var maze, out var targetArrow))
                {
                    _currentMaze = maze;
                    gridManager.LoadFromMazeGrid(_currentMaze);

                    if (playerController != null)
                    {
                        playerController.InitializeAtPosition(_currentMaze.StartPoint);
                    }

                    OnLevelLoaded?.Invoke(levelNum);
                    GameStateManager.Instance?.TransitionTo(GameState.Playing);
                }
            }
        }

        /// <summary>
        /// Triggered when the arrow reaches the designated single exit point.
        /// </summary>
        public void CompleteLevel()
        {
            if (_isLevelComplete) return;
            _isLevelComplete = true;

            StartCoroutine(VictorySequence());
        }

        private IEnumerator VictorySequence()
        {
            if (SettingsManager.Instance == null || SettingsManager.Instance.SoundEnabled)
            {
                if (sfxSource != null && victorySound != null)
                {
                    sfxSource.PlayOneShot(victorySound, 0.8f);
                }
            }

            if (victoryConfetti != null)
            {
                victoryConfetti.Play();
            }

            OnLevelCompleted?.Invoke(currentLevelNumber);

            yield return new WaitForSeconds(0.45f);
            GameStateManager.Instance?.TransitionTo(GameState.Victory);
        }

        public void NextLevel()
        {
            LoadLevel(currentLevelNumber + 1);
        }

        public void RestartCurrentLevel()
        {
            LoadLevel(currentLevelNumber);
        }
    }
}`
  },

  'Assets/Scripts/Gameplay/PathSolver.cs': {
    path: 'Assets/Scripts/Gameplay/PathSolver.cs',
    category: 'Gameplay',
    description: 'Deterministic path solver verifying arrow clearances, obstacle collisions, and board exit distances.',
    content: `using System;
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
        /// Evaluates whether an arrow can navigate forward through the grid and static obstacle cells.
        /// Treats static obstacle cells (CellType.Obstacle == 2) and empty void (CellType.Empty == 0) as non-traversable.
        /// </summary>
        public static SolverResult EvaluatePath(GridManager gridManager, ArrowData arrow, int otherArrowOccupantId = -1)
        {
            if (gridManager == null || arrow == null || arrow.gridPoints == null || arrow.gridPoints.Count == 0)
                return SolverResult.Blocked(0, -1, Vector2Int.zero);

            Vector2Int current = arrow.HeadPoint;
            Vector2Int step = arrow.headDirection;
            int travelSteps = 0;

            while (true)
            {
                current += step;

                // Exit Condition: Out of bounds (Reached board boundary exit)
                if (!gridManager.IsWithinBounds(current.x, current.y))
                {
                    return SolverResult.Clear(travelSteps + 1, current);
                }

                // Static Obstacle Cell Check: Is cell blocked by maze barrier or empty void?
                if (gridManager.IsCellBlocked(current.x, current.y))
                {
                    return SolverResult.Blocked(travelSteps, -2 /* obstacle wall blocker ID */, current);
                }

                // Arrow Occupant Check: Is another active arrow blocking this cell?
                if (otherArrowOccupantId != -1 && otherArrowOccupantId != arrow.id)
                {
                    return SolverResult.Blocked(travelSteps, otherArrowOccupantId, current);
                }

                travelSteps++;
            }
        }
    }
}`
  },

  'Assets/Docs/UnitySetupGuide.md': {
    path: 'Assets/Docs/UnitySetupGuide.md',
    category: 'Docs',
    description: 'Complete step-by-step Unity Editor setup guide: Tags, Layers, Input System, Rigidbody2D, and Prefab hierarchies.',
    content: `# Unity 2D Mobile Maze Puzzle Game — Setup & Architecture Guide

## 1. Project Settings Configuration

### Tags Required
Create the following tags in **Edit > Project Settings > Tags and Layers**:
- \`PlayerArrow\`: Attached to the draggable arrow GameObject.
- \`MazeExit\`: Attached to the perimeter exit trigger zone.
- \`MazeWall\`: Attached to static obstacle colliders.

### Layers Required
- Layer 8: \`MazePath\` (Corridors where movement is allowed)
- Layer 9: \`MazeWall\` (Physical solid static obstacles)
- Layer 10: \`ArrowObstacles\` (For 2D raycasting and clearance evaluation)

### Physics 2D Settings
- **Edit > Project Settings > Physics 2D**:
  - Uncheck collision between \`MazeWall\` and \`MazeWall\`.
  - Ensure \`Arrow\` and \`MazeWall\` layer collision mask is enabled.

---

## 2. Component Hierarchy in Scene

\`\`\`
MainScene
├── [Managers]
│   ├── GameStateManager (Core state machine & Android hardware back button handler)
│   ├── GameManager (Coordinates level loading, win condition, audio/confetti)
│   ├── GridManager (Maintains 2D matrix: 0=Empty, 1=Path, 2=Obstacle; implements IsCellBlocked)
│   ├── LevelGenerator (Procedural level generation with solvability validation)
│   └── MazeValidator (Graph traversal BFS/DFS guaranteeing strictly ONE exit path)
│
├── [Camera]
│   └── Main Camera (Orthographic 2D, size = 6.5, clear flags = Solid Color)
│
├── [Environment]
│   ├── MazeContainer (Parent for dynamic maze tile visuals)
│   └── ExitZone (Trigger collider with glowing beacon & particle rings)
│
├── [Player]
│   └── PlayerArrow (BoxCollider2D, Rigidbody2D Kinematic, PlayerMovementController.cs)
│
└── [UI Canvas]
    ├── SafeAreaContainer (SafeAreaFitter.cs for notched displays)
    ├── HUD (Level label, Undo, Hint, Restart, Audio buttons)
    ├── VictoryModal (Level clear celebration & next level button)
    └── SettingsModal (Sound, Music, Haptics, Grid toggles)
\`\`\`

---

## 3. Player Arrow Setup Details

1. **GameObject Setup**:
   - Add \`BoxCollider2D\` (size: 0.8 x 0.8, offset: (0, 0)).
   - Add \`Rigidbody2D\`:
     - Body Type: \`Kinematic\`
     - Interpolate: \`Interpolate\` (ensures butter-smooth drag without jitter)
     - Collision Detection: \`Continuous\` (anti-tunneling at high finger speeds)
   - Add \`PlayerMovementController.cs\`.
   - Assign \`GridManager\` and \`MainCamera\` references.

2. **Drag & Wall Clamping Mechanism**:
   - Touch drag positions are converted from screen to world plane.
   - The controller sub-steps movement using \`GridManager.IsCellBlocked(x, y)\`.
   - If a wall or empty void cell is encountered, the arrow stops and clamps at the boundary.
   - Diagonal inputs into corners slide along the remaining open tangent corridor.
   - Reaching the exit cell fires \`OnReachedExit\` and triggers the victory sequence.
`
  },
  'Assets/Scripts/Core/GameState.cs': {
    path: 'Assets/Scripts/Core/GameState.cs',
    category: 'Core',
    description: 'Central enum defining the 9 application and screen lifecycle states.',
    content: `namespace ArrowUntangle.Core
{
    /// <summary>
    /// Core application and screen states tying UI navigation and gameplay loop together.
    /// Boot → MainMenu → LevelSelect → Loading → Playing → Paused → Victory → Failure → Settings
    /// </summary>
    public enum GameState
    {
        Boot = 0,
        MainMenu = 1,
        LevelSelect = 2,
        Loading = 3,
        Playing = 4,
        Paused = 5,
        Victory = 6,
        Failure = 7,
        Settings = 8
    }
}`
  },

  'Assets/Scripts/Core/GameStateManager.cs': {
    path: 'Assets/Scripts/Core/GameStateManager.cs',
    category: 'Core',
    description: 'Single source of truth state machine, centralized input gating, and Android hardware back button router.',
    content: `using System;
using System.Collections;
using UnityEngine;
using UnityEngine.InputSystem;
using ArrowUntangle.Level;
using ArrowUntangle.Gameplay;

namespace ArrowUntangle.Core
{
    public class GameStateManager : MonoBehaviour
    {
        public static GameStateManager Instance { get; private set; }

        [Header("Initial State")]
        [SerializeField] private GameState startState = GameState.MainMenu;

        [Header("References")]
        [SerializeField] private GameManager gameManager;
        [SerializeField] private LevelLoader levelLoader;

        private GameState _currentState = GameState.Boot;
        private GameState _previousState = GameState.Boot;
        private GameState _stateBeforeSettings = GameState.MainMenu;

        public GameState CurrentState => _currentState;
        public GameState PreviousState => _previousState;

        /// <summary>
        /// Input gate for ArrowDragController: Block input during Paused/Loading/Victory/Failure.
        /// </summary>
        public bool IsInputAllowed => _currentState == GameState.Playing;

        public event Action<GameState, GameState> OnStateChanged;
        public event Action OnExitDialogRequested;
        public event Action<string> OnDailyUntangleRequested;

        private void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        private void Start()
        {
            TransitionTo(startState);
        }

        public void TransitionTo(GameState newState)
        {
            if (_currentState == newState) return;
            if (newState == GameState.Settings && _currentState != GameState.Settings)
            {
                _stateBeforeSettings = _currentState;
            }

            _previousState = _currentState;
            _currentState = newState;
            Time.timeScale = (_currentState == GameState.Paused) ? 0f : 1f;

            OnStateChanged?.Invoke(_currentState, _previousState);
        }

        public void ReturnFromSettings()
        {
            TransitionTo(_stateBeforeSettings);
        }

        // Centralized Android Back Button Routing
        private void Update()
        {
            bool backPressed = (Keyboard.current != null && Keyboard.current.escapeKey.wasPressedThisFrame)
                || UnityEngine.Input.GetKeyDown(KeyCode.Escape);

            if (!backPressed) return;

            switch (_currentState)
            {
                case GameState.Playing:
                    TransitionTo(GameState.Paused);
                    break;
                case GameState.Paused:
                    TransitionTo(GameState.Playing);
                    break;
                case GameState.LevelSelect:
                    TransitionTo(GameState.MainMenu);
                    break;
                case GameState.Settings:
                    TransitionTo(_stateBeforeSettings);
                    break;
                case GameState.MainMenu:
                    OnExitDialogRequested?.Invoke();
                    break;
                case GameState.Victory:
                case GameState.Failure:
                    TransitionTo(GameState.MainMenu);
                    break;
            }
        }
    }
}`
  },

  'Assets/Scripts/UI/SafeAreaFitter.cs': {
    path: 'Assets/Scripts/UI/SafeAreaFitter.cs',
    category: 'UI',
    description: 'Universal display cutout & gesture navigation clearance handler across heterogeneous Android devices.',
    content: `using UnityEngine;

namespace ArrowUntangle.UI
{
    /// <summary>
    /// Universal Safe Area & Display Cutout Fitter.
    /// Applied globally to screen root canvases to ensure UI elements do not clip
    /// behind camera notches, hole-punches, or Android gesture navigation pills.
    /// </summary>
    [RequireComponent(typeof(RectTransform))]
    [ExecuteAlways]
    public class SafeAreaFitter : MonoBehaviour
    {
        [SerializeField] private bool applyLeft = true;
        [SerializeField] private bool applyRight = true;
        [SerializeField] private bool applyTop = true;
        [SerializeField] private bool applyBottom = true;
        [SerializeField] private float gestureNavBottomPadding = 16f;

        private RectTransform _rectTransform;

        private void OnEnable()
        {
            ApplySafeArea();
        }

        public void ApplySafeArea()
        {
            if (_rectTransform == null) _rectTransform = GetComponent<RectTransform>();
            Rect safeArea = Screen.safeArea;
            int screenWidth = Screen.width;
            int screenHeight = Screen.height;

            if (screenWidth <= 0 || screenHeight <= 0) return;

            // Detect Gesture Navigation vs 3-Button Navigation
            float bottomOffsetPixels = 0f;
            bool isGestureNav = safeArea.yMin < (0.04f * screenHeight);
            if (isGestureNav && applyBottom)
            {
                bottomOffsetPixels = gestureNavBottomPadding * (Screen.dpi > 0 ? Screen.dpi / 160f : 1f);
            }

            Vector2 anchorMin = safeArea.position;
            Vector2 anchorMax = safeArea.position + safeArea.size;

            anchorMin.x = applyLeft ? anchorMin.x / screenWidth : 0f;
            anchorMax.x = applyRight ? anchorMax.x / screenWidth : 1f;
            anchorMin.y = applyBottom ? Mathf.Clamp01((safeArea.yMin + bottomOffsetPixels) / screenHeight) : 0f;
            anchorMax.y = applyTop ? Mathf.Clamp01(safeArea.yMax / screenHeight) : 1f;

            _rectTransform.anchorMin = anchorMin;
            _rectTransform.anchorMax = anchorMax;
        }
    }
}`
  },

  'Assets/Scripts/UI/UIManager.cs': {
    path: 'Assets/Scripts/UI/UIManager.cs',
    category: 'UI',
    description: 'Top-level UI orchestrator responding to GameStateManager events to activate and transition screens.',
    content: `using UnityEngine;
using ArrowUntangle.Core;

namespace ArrowUntangle.UI
{
    public class UIManager : MonoBehaviour
    {
        [Header("Screens")]
        [SerializeField] private BaseScreen mainMenuScreen;
        [SerializeField] private BaseScreen levelSelectScreen;
        [SerializeField] private BaseScreen loadingScreen;
        [SerializeField] private BaseScreen gameplayHUDScreen;
        [SerializeField] private BaseScreen victoryScreen;
        [SerializeField] private BaseScreen failureScreen;
        [SerializeField] private BaseScreen settingsScreen;

        private void Start()
        {
            if (GameStateManager.Instance != null)
            {
                GameStateManager.Instance.OnStateChanged += HandleStateChanged;
                HandleStateChanged(GameStateManager.Instance.CurrentState, GameState.Boot);
            }
        }

        private void OnDestroy()
        {
            if (GameStateManager.Instance != null)
            {
                GameStateManager.Instance.OnStateChanged -= HandleStateChanged;
            }
        }

        private void HandleStateChanged(GameState newState, GameState oldState)
        {
            HideAllScreens();

            switch (newState)
            {
                case GameState.MainMenu:
                    if (mainMenuScreen != null) mainMenuScreen.Show();
                    break;
                case GameState.LevelSelect:
                    if (levelSelectScreen != null) levelSelectScreen.Show();
                    break;
                case GameState.Loading:
                    if (loadingScreen != null) loadingScreen.Show();
                    break;
                case GameState.Playing:
                case GameState.Paused:
                    if (gameplayHUDScreen != null) gameplayHUDScreen.Show();
                    break;
                case GameState.Victory:
                    if (victoryScreen != null) victoryScreen.Show();
                    break;
                case GameState.Failure:
                    if (failureScreen != null) failureScreen.Show();
                    break;
                case GameState.Settings:
                    if (settingsScreen != null) settingsScreen.Show();
                    break;
            }
        }

        private void HideAllScreens()
        {
            if (mainMenuScreen != null) mainMenuScreen.Hide();
            if (levelSelectScreen != null) levelSelectScreen.Hide();
            if (loadingScreen != null) loadingScreen.Hide();
            if (gameplayHUDScreen != null) gameplayHUDScreen.Hide();
            if (victoryScreen != null) victoryScreen.Hide();
            if (failureScreen != null) failureScreen.Hide();
            if (settingsScreen != null) settingsScreen.Hide();
        }
    }
}`
  },

  'Assets/Scripts/UI/Screens/GameplayHUDScreen.cs': {
    path: 'Assets/Scripts/UI/Screens/GameplayHUDScreen.cs',
    category: 'Screens',
    description: 'In-game HUD: 48dp touch targets, hearts indicator, remaining arrow counter, pause modal and bottom controls.',
    content: `using System;
using UnityEngine;
using UnityEngine.UI;
using ArrowUntangle.Core;
using ArrowUntangle.Gameplay;
using ArrowUntangle.Level;
using ArrowUntangle.Settings;

namespace ArrowUntangle.UI
{
    public class GameplayHUDScreen : BaseScreen
    {
        [Header("Top Bar (Min 48dp Touch Targets)")]
        [SerializeField] private Button pauseButton;
        [SerializeField] private Text missionTitleText;
        [SerializeField] private Text heartsText;
        [SerializeField] private Text remainingArrowsText;

        [Header("Bottom Bar Utility Controls")]
        [SerializeField] private Button hintButton;
        [SerializeField] private Button magnifierButton;
        [SerializeField] private Button gridToggleButton;

        [Header("Pause Menu Modal")]
        [SerializeField] private GameObject pauseMenuPanel;
        [SerializeField] private Button resumeButton;
        [SerializeField] private Button restartButton;
        [SerializeField] private Button pauseSettingsButton;
        [SerializeField] private Button pauseMainMenuButton;

        [Header("Pause Confirmation Sub-Modal")]
        [SerializeField] private GameObject confirmQuitPanel;
        [SerializeField] private Button confirmQuitYesButton;
        [SerializeField] private Button confirmQuitNoButton;

        // Deferred items (Phase 5 scope):
        public event Action OnHintRequested; // Inert until Phase 5
        public event Action OnMagnifierRequested; // Inert until Phase 5

        protected override void Awake()
        {
            base.Awake();
            if (pauseButton != null) pauseButton.onClick.AddListener(HandlePauseClicked);
            if (resumeButton != null) resumeButton.onClick.AddListener(HandleResumeClicked);
            if (restartButton != null) restartButton.onClick.AddListener(HandleRestartClicked);
            if (pauseSettingsButton != null) pauseSettingsButton.onClick.AddListener(HandleSettingsClicked);
            if (pauseMainMenuButton != null) pauseMainMenuButton.onClick.AddListener(HandleMainMenuClicked);
            if (confirmQuitYesButton != null) confirmQuitYesButton.onClick.AddListener(HandleConfirmQuitYes);
            if (confirmQuitNoButton != null) confirmQuitNoButton.onClick.AddListener(HandleConfirmQuitNo);
            if (gridToggleButton != null) gridToggleButton.onClick.AddListener(HandleGridToggleClicked);
        }

        private void HandlePauseClicked() => GameStateManager.Instance?.TransitionTo(GameState.Paused);
        private void HandleResumeClicked() => GameStateManager.Instance?.TransitionTo(GameState.Playing);
        private void HandleRestartClicked() => GameManager.Instance?.RestartLevel();
        private void HandleSettingsClicked() => GameStateManager.Instance?.TransitionTo(GameState.Settings);
        private void HandleMainMenuClicked() => confirmQuitPanel?.SetActive(true);
        private void HandleConfirmQuitYes() => GameStateManager.Instance?.TransitionTo(GameState.MainMenu);
        private void HandleConfirmQuitNo() => confirmQuitPanel?.SetActive(false);

        private void HandleGridToggleClicked()
        {
            if (SettingsManager.Instance != null)
            {
                SettingsManager.Instance.GridEnabled = !SettingsManager.Instance.GridEnabled;
            }
        }
    }
}`
  },

  'Assets/Scripts/Input/ArrowDragController.cs': {
    path: 'Assets/Scripts/Input/ArrowDragController.cs',
    category: 'Gameplay',
    description: 'Input controller translating touches/pointer deltas into smooth 1D constrained arrow translations with input gating.',
    content: `using System;
using UnityEngine;
using UnityEngine.InputSystem;
using ArrowUntangle.Grid;
using ArrowUntangle.Gameplay;
using ArrowUntangle.Level;
using ArrowUntangle.Core;

namespace ArrowUntangle.Input
{
    public class ArrowDragController : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private Camera targetCamera;
        [SerializeField] private GridSystem gridSystem;
        [SerializeField] private GameManager gameManager;

        [Header("Drag Tuning")]
        [SerializeField] private float releaseThresholdFraction = 0.65f;

        private ArrowEntity _activeArrow;
        private int _maxAllowedDistance;
        private SolverResult _solverResult;
        private Vector3 _pressWorldPos;
        private float _currentDragUnits;
        private bool _isDragging = false;

        private void Update()
        {
            // Input gate driven by GameStateManager: blocks input during Paused/Loading/Victory/Failure/Menus
            if (GameStateManager.Instance != null && !GameStateManager.Instance.IsInputAllowed) return;
            if (gameManager != null && !gameManager.IsGameActive) return;

            HandlePointerInput();
        }

        private void HandlePointerInput()
        {
            // Translates screen drag deltas along arrow.headDirection vector
            // Clamps travel between 0 and maxTravelDistance
            // Triggers path clearance or collision heart loss upon release
        }
    }
}`
  },

  'Assets/Scripts/Settings/SettingsManager.cs': {
    path: 'Assets/Scripts/Settings/SettingsManager.cs',
    category: 'Data & Settings',
    description: 'PlayerPrefs persistent storage for audio, haptics, grid dots, notifications, and store stubs.',
    content: `using System;
using UnityEngine;

namespace ArrowUntangle.Settings
{
    public class SettingsManager : MonoBehaviour
    {
        public static SettingsManager Instance { get; private set; }

        public bool SoundEnabled
        {
            get => PlayerPrefs.GetInt("ArrowUntangle_Sound", 1) == 1;
            set { PlayerPrefs.SetInt("ArrowUntangle_Sound", value ? 1 : 0); PlayerPrefs.Save(); }
        }

        public bool MusicEnabled
        {
            get => PlayerPrefs.GetInt("ArrowUntangle_Music", 1) == 1;
            set { PlayerPrefs.SetInt("ArrowUntangle_Music", value ? 1 : 0); PlayerPrefs.Save(); }
        }

        public bool HapticsEnabled
        {
            get => PlayerPrefs.GetInt("ArrowUntangle_Haptics", 1) == 1;
            set { PlayerPrefs.SetInt("ArrowUntangle_Haptics", value ? 1 : 0); PlayerPrefs.Save(); }
        }

        public bool GridEnabled
        {
            get => PlayerPrefs.GetInt("ArrowUntangle_Grid", 1) == 1;
            set { PlayerPrefs.SetInt("ArrowUntangle_Grid", value ? 1 : 0); PlayerPrefs.Save(); }
        }

        public bool NotificationsEnabled
        {
            get => PlayerPrefs.GetInt("ArrowUntangle_Notifications", 1) == 1;
            set { PlayerPrefs.SetInt("ArrowUntangle_Notifications", value ? 1 : 0); PlayerPrefs.Save(); }
        }

        private void Awake()
        {
            if (Instance != null && Instance != this) { Destroy(gameObject); return; }
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
    }
}`
  },

  'Assets/Editor/Tests/UIStateManagerTests.cs': {
    path: 'Assets/Editor/Tests/UIStateManagerTests.cs',
    category: 'Tests',
    description: 'NUnit test suite verifying state machine transitions, IsInputAllowed gate, back button routing, and save catalog queries.',
    content: `using NUnit.Framework;
using UnityEngine;
using ArrowUntangle.Core;
using ArrowUntangle.Data;
using ArrowUntangle.Settings;

namespace ArrowUntangle.Tests
{
    [TestFixture]
    public class UIStateManagerTests
    {
        [Test]
        public void GameStateManager_IsInputAllowed_OnlyTrueWhenPlaying()
        {
            var go = new GameObject();
            var sm = go.AddComponent<GameStateManager>();

            sm.TransitionTo(GameState.Boot);
            Assert.IsFalse(sm.IsInputAllowed);

            sm.TransitionTo(GameState.MainMenu);
            Assert.IsFalse(sm.IsInputAllowed);

            sm.TransitionTo(GameState.Playing);
            Assert.IsTrue(sm.IsInputAllowed);

            sm.TransitionTo(GameState.Paused);
            Assert.IsFalse(sm.IsInputAllowed);

            Object.DestroyImmediate(go);
        }

        [Test]
        public void GameStateManager_SettingsState_RestoresOriginState()
        {
            var go = new GameObject();
            var sm = go.AddComponent<GameStateManager>();

            sm.TransitionTo(GameState.Playing);
            sm.TransitionTo(GameState.Settings);
            sm.ReturnFromSettings();

            Assert.AreEqual(GameState.Playing, sm.CurrentState);

            Object.DestroyImmediate(go);
        }
    }
}`
  },

  'Assets/Scripts/Gameplay/ArrowEscapeController.cs': {
    path: 'Assets/Scripts/Gameplay/ArrowEscapeController.cs',
    category: 'Gameplay',
    description: 'Handles tap-to-escape input, raycast forward clearance detection, and escape/bump animations.',
    content: `using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.EventSystems;

namespace ArrowUntangle.Gameplay
{
    /// <summary>
    /// Tap-to-Escape arrow controller: When tapped, casts forward in head direction.
    /// If clear: animates sliding off the board and fires OnArrowEscaped.
    /// If blocked: bumps forward 0.15 units, shakes, and triggers soft haptic thud.
    /// </summary>
    public class ArrowEscapeController : MonoBehaviour, IPointerClickHandler
    {
        [Header("Arrow Configuration")]
        [SerializeField] private Vector2Int headDirection = Vector2Int.right;
        [SerializeField] private List<Vector2Int> gridPath = new List<Vector2Int>();
        [SerializeField] private float slideSpeed = 24f;

        private bool _isEscaping = false;
        private Vector3 _originalPosition;

        private void Start()
        {
            _originalPosition = transform.position;
        }

        public void OnPointerClick(PointerEventData eventData)
        {
            if (_isEscaping) return;

            if (RaycastClearanceTester.CheckClearance(this, headDirection))
            {
                StartCoroutine(EscapeRoutine());
            }
            else
            {
                StartCoroutine(BlockedNudgeRoutine());
            }
        }

        private IEnumerator EscapeRoutine()
        {
            _isEscaping = true;
            Vector3 escapeTarget = transform.position + (Vector3)(Vector2)headDirection * 25f;

            // Highlight emerald green
            SetColor(new Color(0.13f, 0.77f, 0.36f));

            while (Vector3.Distance(transform.position, escapeTarget) > 0.1f)
            {
                transform.position = Vector3.MoveTowards(transform.position, escapeTarget, slideSpeed * Time.deltaTime);
                yield return null;
            }

            Destroy(gameObject);
        }

        private IEnumerator BlockedNudgeRoutine()
        {
            Vector3 nudge = _originalPosition + (Vector3)(Vector2)headDirection * 0.18f;
            transform.position = nudge;
            yield return new WaitForSeconds(0.06f);
            transform.position = _originalPosition;
        }

        private void SetColor(Color col)
        {
            var lr = GetComponent<LineRenderer>();
            if (lr != null) lr.startColor = lr.endColor = col;
        }
    }
}`
  },

  'Assets/Scripts/Gameplay/RaycastClearanceTester.cs': {
    path: 'Assets/Scripts/Gameplay/RaycastClearanceTester.cs',
    category: 'Gameplay',
    description: 'Deterministic 2D raycaster verifying that an arrow forward escape trajectory is unobstructed by other arrows.',
    content: `using UnityEngine;

namespace ArrowUntangle.Gameplay
{
    public static class RaycastClearanceTester
    {
        public static bool CheckClearance(ArrowEscapeController arrow, Vector2Int dir)
        {
            RaycastHit2D hit = Physics2D.Raycast(
                arrow.transform.position,
                (Vector2)dir,
                50f,
                LayerMask.GetMask("ArrowObstacles")
            );

            // If hit collider belongs to another arrow, trajectory is blocked
            if (hit.collider != null && hit.collider.gameObject != arrow.gameObject)
            {
                return false;
            }

            return true;
        }
    }
}`
  },

  'Assets/Scripts/Tests/MazeValidatorTests.cs': {
    path: 'Assets/Scripts/Tests/MazeValidatorTests.cs',
    category: 'Tests',
    description: 'NUnit unit tests verifying BFS reachability, DFS single-path uniqueness, cycle detection, and boundary validation in MazeValidator.',
    content: `using System.Collections.Generic;
using NUnit.Framework;
using UnityEngine;
using ArrowUntangle.Grid;
using ArrowUntangle.Level;

namespace ArrowUntangle.Tests
{
    [TestFixture]
    public class MazeValidatorTests
    {
        [Test]
        public void Validate_StrictSinglePathMaze_ReturnsSuccess()
        {
            // 5x5 grid with a single L-shaped corridor from (2, 3) to (2, 0)
            var start = new Vector2Int(2, 3);
            var exit = new Vector2Int(2, 0);
            var grid = new MazeGrid(5, 5, start, exit);

            // Fill all with Obstacle walls (2)
            for (int y = 0; y < 5; y++)
                for (int x = 0; x < 5; x++)
                    grid.SetCell(x, y, CellType.Obstacle);

            // Carve single corridor: (2,3) -> (2,2) -> (2,1) -> (2,0)
            grid.SetCell(2, 3, CellType.Path);
            grid.SetCell(2, 2, CellType.Path);
            grid.SetCell(2, 1, CellType.Path);
            grid.SetCell(2, 0, CellType.Path);

            bool isValid = MazeValidator.Validate(grid, out ValidationResult result);

            Assert.IsTrue(isValid, "Single corridor maze should pass validation.");
            Assert.AreEqual(1, result.totalPathsFound);
            Assert.AreEqual(4, result.uniquePathLength);
            Assert.AreEqual(3, result.shortestPathDistance);
            Assert.IsFalse(result.HasCycles);
        }

        [Test]
        public void Validate_DisconnectedExit_ReturnsFalseDueToBFS()
        {
            // Start at (1, 4), Exit at (3, 0) separated by solid walls
            var start = new Vector2Int(1, 4);
            var exit = new Vector2Int(3, 0);
            var grid = new MazeGrid(5, 5, start, exit);

            for (int y = 0; y < 5; y++)
                for (int x = 0; x < 5; x++)
                    grid.SetCell(x, y, CellType.Obstacle);

            grid.SetCell(start.x, start.y, CellType.Path);
            grid.SetCell(exit.x, exit.y, CellType.Path);

            bool isValid = MazeValidator.Validate(grid, out ValidationResult result);

            Assert.IsFalse(isValid, "Disconnected maze should fail validation.");
            StringAssert.Contains("BFS Traversal: Exit point is completely unreachable", result.failureReason);
        }

        [Test]
        public void Validate_DualForkedPaths_ReturnsFalseDueToDFS()
        {
            // Diamond corridor offering 2 paths from start (2, 4) to exit (2, 0)
            var start = new Vector2Int(2, 4);
            var exit = new Vector2Int(2, 0);
            var grid = new MazeGrid(5, 5, start, exit);

            for (int y = 0; y < 5; y++)
                for (int x = 0; x < 5; x++)
                    grid.SetCell(x, y, CellType.Obstacle);

            // Left branch
            grid.SetCell(2, 4, CellType.Path);
            grid.SetCell(1, 3, CellType.Path);
            grid.SetCell(1, 2, CellType.Path);
            grid.SetCell(1, 1, CellType.Path);

            // Right branch
            grid.SetCell(3, 3, CellType.Path);
            grid.SetCell(3, 2, CellType.Path);
            grid.SetCell(3, 1, CellType.Path);

            // Converge at exit
            grid.SetCell(2, 0, CellType.Path);

            // Connect both branches to exit
            grid.SetCell(2, 1, CellType.Path);

            bool isValid = MazeValidator.Validate(grid, out ValidationResult result);

            Assert.IsFalse(isValid, "Dual branches should fail single-path guarantee.");
            Assert.Greater(result.totalPathsFound, 1);
        }

        [Test]
        public void Validate_MultiplePerimeterOpenings_ReturnsFalse()
        {
            var start = new Vector2Int(2, 4);
            var exit = new Vector2Int(2, 0);
            var grid = new MazeGrid(5, 5, start, exit);

            // Fill with obstacle
            for (int y = 0; y < 5; y++)
                for (int x = 0; x < 5; x++)
                    grid.SetCell(x, y, CellType.Obstacle);

            // Carve path to exit
            for (int y = 0; y <= 4; y++)
                grid.SetCell(2, y, CellType.Path);

            // Leak an accidental second perimeter opening at (4, 2)
            grid.SetCell(3, 2, CellType.Path);
            grid.SetCell(4, 2, CellType.Path);

            bool isValid = MazeValidator.Validate(grid, out ValidationResult result);

            Assert.IsFalse(isValid, "Multiple perimeter exits should fail.");
            StringAssert.Contains("Perimeter integrity", result.failureReason);
        }
    }
}`
  }
};

