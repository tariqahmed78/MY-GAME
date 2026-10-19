using System.Collections.Generic;
using UnityEngine;
using ArrowUntangle.Grid;
using ArrowUntangle.Level;
using ArrowUntangle.Rendering;

namespace ArrowUntangle.Gameplay
{
    public class TestLevelBuilder : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private GridSystem gridSystem;
        [SerializeField] private GameManager gameManager;
        [SerializeField] private Camera mainCamera;

        [Header("Board Config")]
        [SerializeField] private int boardWidth = 6;
        [SerializeField] private int boardHeight = 6;
        [SerializeField] private float cellSize = 1.0f;

        private readonly List<ArrowEntity> _spawnedEntities = new List<ArrowEntity>();

        private void Start()
        {
            if (gridSystem == null) gridSystem = FindObjectOfType<GridSystem>();
            if (gameManager == null) gameManager = FindObjectOfType<GameManager>();
            if (mainCamera == null) mainCamera = Camera.main;

            BuildTestLevel();
        }

        [ContextMenu("Rebuild Test Level")]
        public void BuildTestLevel()
        {
            // Clean up existing spawned entities
            for (int i = 0; i < _spawnedEntities.Count; i++)
            {
                if (_spawnedEntities[i] != null)
                {
                    Destroy(_spawnedEntities[i].gameObject);
                }
            }
            _spawnedEntities.Clear();

            // Initialize Grid
            gridSystem.Initialize(boardWidth, boardHeight, cellSize);

            // Position 2D Orthographic Camera to frame the board
            if (mainCamera != null)
            {
                mainCamera.orthographic = true;
                mainCamera.transform.position = new Vector3(0, 0, -10f);
                // Portrait height framing with comfortable padding
                mainCamera.orthographicSize = (boardHeight * cellSize * 0.5f) + 1.8f;
            }

            // Hand-authored test level designed with clear interlocking dependencies:
            //
            // Arrow 1 (ID 1, Green): Starts at (3,2) -> (3,4), headDirection UP (0, 1).
            // Path ahead is clear to top boundary (y=5). Can be cleared immediately!
            //
            // Arrow 2 (ID 2, Blue): Starts at (1,3) -> (2,3) -> (4,3), headDirection RIGHT (1, 0).
            // Crosses x=3 at y=3, blocked by Arrow 1! Once Arrow 1 is cleared, Arrow 2 can escape RIGHT.
            //
            // Arrow 3 (ID 3, Amber): Starts at (4,5) -> (4,2) -> (4,1), headDirection DOWN (0, -1).
            // Crosses (4,3), blocked by Arrow 2! Once Arrow 2 clears, Arrow 3 can escape DOWN.
            //
            // Arrow 4 (ID 4, Purple): Starts at (5,1) -> (2,1), headDirection LEFT (-1, 0).
            // Crosses (4,1), blocked by Arrow 3! Once Arrow 3 clears, Arrow 4 can escape LEFT.

            var arrow1 = new ArrowData
            {
                id = 1,
                gridPoints = new List<Vector2Int> { new Vector2Int(3, 2), new Vector2Int(3, 3), new Vector2Int(3, 4) },
                headDirection = new Vector2Int(0, 1), // UP
                colorIndex = 1, // Teal/Green
                layer = 1,
                isActive = true
            };

            var arrow2 = new ArrowData
            {
                id = 2,
                gridPoints = new List<Vector2Int> { new Vector2Int(1, 3), new Vector2Int(2, 3), new Vector2Int(3, 3), new Vector2Int(4, 3) },
                headDirection = new Vector2Int(1, 0), // RIGHT
                colorIndex = 0, // Blue
                layer = 2,
                isActive = true
            };

            var arrow3 = new ArrowData
            {
                id = 3,
                gridPoints = new List<Vector2Int> { new Vector2Int(4, 5), new Vector2Int(4, 4), new Vector2Int(4, 3), new Vector2Int(4, 2) },
                headDirection = new Vector2Int(0, -1), // DOWN
                colorIndex = 2, // Warm Amber
                layer = 3,
                isActive = true
            };

            var arrow4 = new ArrowData
            {
                id = 4,
                gridPoints = new List<Vector2Int> { new Vector2Int(5, 1), new Vector2Int(4, 1), new Vector2Int(3, 1), new Vector2Int(2, 1) },
                headDirection = new Vector2Int(-1, 0), // LEFT
                colorIndex = 3, // Purple
                layer = 4,
                isActive = true
            };

            List<ArrowData> testArrows = new List<ArrowData> { arrow1, arrow2, arrow3, arrow4 };

            // Register each arrow in the grid
            for (int i = 0; i < testArrows.Count; i++)
            {
                gridSystem.RegisterArrow(testArrows[i]);
            }

            // Spawn GameObjects
            for (int i = 0; i < testArrows.Count; i++)
            {
                ArrowData data = testArrows[i];
                GameObject go = new GameObject($"Arrow_{data.id}_{data.headDirection}");
                go.transform.SetParent(transform);
                go.transform.localPosition = Vector3.zero;

                var meshComp = go.AddComponent<ArrowMeshRenderer2D>();
                var col = go.AddComponent<CircleCollider2D>();
                var entity = go.AddComponent<ArrowEntity>();

                entity.Setup(data, gridSystem);
                _spawnedEntities.Add(entity);
            }

            gameManager.RegisterEntities(_spawnedEntities);
        }
    }
}
