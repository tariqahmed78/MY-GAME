using System;
using System.Collections.Generic;
using UnityEngine;
using ArrowUntangle.Level;

namespace ArrowUntangle.Grid
{
    public class GridSystem : MonoBehaviour
    {
        [SerializeField] private int width = 8;
        [SerializeField] private int height = 8;
        [SerializeField] private float cellSize = 1.0f;
        [SerializeField] private Vector2 originOffset = Vector2.zero;

        // Flat int[] with manual (x + y * width) indexing for hot-path lookups
        // Measurably faster on IL2CPP/ARM64 and avoids multi-dim array bounds-check overhead
        private int[] _gridMatrix;

        public int Width => width;
        public int Height => height;
        public float CellSize => cellSize;
        public Vector2 OriginOffset => originOffset;

        private void Awake()
        {
            Initialize(width, height, cellSize);
        }

        public void Initialize(int gridWidth, int gridHeight, float size = 1.0f)
        {
            width = Mathf.Max(1, gridWidth);
            height = Mathf.Max(1, gridHeight);
            cellSize = Mathf.Max(0.01f, size);

            _gridMatrix = new int[width * height];
            Clear();

            // Center grid around origin if not explicitly positioned
            originOffset = new Vector2(-((width - 1) * cellSize) * 0.5f, -((height - 1) * cellSize) * 0.5f);
        }

        public void Clear()
        {
            if (_gridMatrix == null || _gridMatrix.Length != width * height)
            {
                _gridMatrix = new int[width * height];
            }

            for (int i = 0; i < _gridMatrix.Length; i++)
            {
                _gridMatrix[i] = -1;
            }
        }

        public bool IsWithinBounds(int x, int y)
        {
            return x >= 0 && x < width && y >= 0 && y < height;
        }

        public bool IsWithinBounds(Vector2Int pos)
        {
            return pos.x >= 0 && pos.x < width && pos.y >= 0 && pos.y < height;
        }

        public int GetCell(int x, int y)
        {
            if (!IsWithinBounds(x, y)) return -1;
            return _gridMatrix[x + y * width];
        }

        public int GetCell(Vector2Int pos)
        {
            return GetCell(pos.x, pos.y);
        }

        public void SetCell(int x, int y, int arrowId)
        {
            if (!IsWithinBounds(x, y)) return;
            _gridMatrix[x + y * width] = arrowId;
        }

        public void SetCell(Vector2Int pos, int arrowId)
        {
            SetCell(pos.x, pos.y, arrowId);
        }

        public void RegisterArrow(ArrowData arrow)
        {
            if (arrow == null || arrow.gridPoints == null) return;

            for (int i = 0; i < arrow.gridPoints.Count; i++)
            {
                Vector2Int pt = arrow.gridPoints[i];
                if (IsWithinBounds(pt))
                {
                    SetCell(pt, arrow.id);
                }
            }
        }

        public void UnregisterArrow(ArrowData arrow)
        {
            if (arrow == null || arrow.gridPoints == null) return;

            for (int i = 0; i < arrow.gridPoints.Count; i++)
            {
                Vector2Int pt = arrow.gridPoints[i];
                if (IsWithinBounds(pt))
                {
                    if (GetCell(pt) == arrow.id)
                    {
                        SetCell(pt, -1);
                    }
                }
            }
        }

        public Vector3 GridToWorldPosition(Vector2Int gridPos)
        {
            return new Vector3(
                originOffset.x + (gridPos.x * cellSize),
                originOffset.y + (gridPos.y * cellSize),
                0f
            );
        }

        public Vector3 GridToWorldPosition(int x, int y)
        {
            return GridToWorldPosition(new Vector2Int(x, y));
        }

        public Vector2Int WorldToGridPosition(Vector3 worldPos)
        {
            float relX = (worldPos.x - originOffset.x) / cellSize;
            float relY = (worldPos.y - originOffset.y) / cellSize;

            return new Vector2Int(
                Mathf.RoundToInt(relX),
                Mathf.RoundToInt(relY)
            );
        }
    }
}
