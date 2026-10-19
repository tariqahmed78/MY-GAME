using System;
using System.Collections.Generic;
using UnityEngine;

namespace ArrowUntangle.Level
{
    [Serializable]
    public class ArrowData
    {
        public int id;
        public List<Vector2Int> gridPoints = new List<Vector2Int>(); // ordered waypoints, tail -> head
        public Vector2Int headDirection;                             // Up/Down/Left/Right, unit vector
        public int colorIndex;
        public int layer;
        public bool isActive = true;
        public bool hasBeenCleared = false;

        public Vector2Int HeadPoint => (gridPoints != null && gridPoints.Count > 0) ? gridPoints[gridPoints.Count - 1] : Vector2Int.zero;
        public Vector2Int TailPoint => (gridPoints != null && gridPoints.Count > 0) ? gridPoints[0] : Vector2Int.zero;

        public ArrowData Clone()
        {
            var clone = new ArrowData
            {
                id = this.id,
                headDirection = this.headDirection,
                colorIndex = this.colorIndex,
                layer = this.layer,
                isActive = this.isActive,
                hasBeenCleared = this.hasBeenCleared,
                gridPoints = new List<Vector2Int>(this.gridPoints.Count)
            };

            for (int i = 0; i < this.gridPoints.Count; i++)
            {
                clone.gridPoints.Add(this.gridPoints[i]);
            }

            return clone;
        }
    }
}
