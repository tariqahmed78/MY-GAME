using System.Collections.Generic;
using NUnit.Framework;
using UnityEngine;
using ArrowUntangle.Grid;
using ArrowUntangle.Gameplay;
using ArrowUntangle.Level;

namespace ArrowUntangle.Tests
{
    [TestFixture]
    public class PathSolverTests
    {
        private GameObject _holder;
        private GridSystem _grid;

        [SetUp]
        public void SetUp()
        {
            _holder = new GameObject("TestGridHolder");
            _grid = _holder.AddComponent<GridSystem>();
            _grid.Initialize(6, 6, 1.0f);
        }

        [TearDown]
        public void TearDown()
        {
            if (_holder != null)
            {
                Object.DestroyImmediate(_holder);
            }
        }

        [Test]
        public void Solve_ArrowAtBoundary_ReturnsClear()
        {
            // Head is at (3, 5), pointing UP (0, 1). Next step is (3, 6) which is outside bounds.
            var arrow = new ArrowData
            {
                id = 1,
                gridPoints = new List<Vector2Int> { new Vector2Int(3, 4), new Vector2Int(3, 5) },
                headDirection = new Vector2Int(0, 1),
                isActive = true
            };

            _grid.RegisterArrow(arrow);

            SolverResult result = PathSolver.Solve(_grid, arrow);

            Assert.IsTrue(result.isClear, "Arrow with head at boundary pointing outwards must be clear.");
            Assert.AreEqual(1, result.maxTravelDistance, "Max travel distance to exterior boundary is 1 step.");
        }

        [Test]
        public void Solve_ArrowBlockedByOtherArrow_ReturnsBlocked()
        {
            // Arrow 1: Head at (2, 2) pointing RIGHT (1, 0)
            var arrow1 = new ArrowData
            {
                id = 1,
                gridPoints = new List<Vector2Int> { new Vector2Int(1, 2), new Vector2Int(2, 2) },
                headDirection = new Vector2Int(1, 0),
                isActive = true
            };

            // Arrow 2: Vertical path intersecting x=4 at y=2
            var arrow2 = new ArrowData
            {
                id = 2,
                gridPoints = new List<Vector2Int> { new Vector2Int(4, 1), new Vector2Int(4, 2), new Vector2Int(4, 3) },
                headDirection = new Vector2Int(0, 1),
                isActive = true
            };

            _grid.RegisterArrow(arrow1);
            _grid.RegisterArrow(arrow2);

            SolverResult result = PathSolver.Solve(_grid, arrow1);

            Assert.IsFalse(result.isClear, "Arrow1 forward path hits Arrow2 at (4,2). Must be blocked.");
            Assert.AreEqual(2, arrow2.id, "Blocking arrow ID must match Arrow 2.");
            Assert.AreEqual(new Vector2Int(4, 2), result.blockedCell, "Blocked cell must be (4, 2).");
            Assert.AreEqual(1, result.maxTravelDistance, "Can only travel 1 step (to x=3) before being blocked at x=4.");
        }

        [Test]
        public void Solve_ArrowIgnoringOwnPath_DoesNotSelfBlock()
        {
            // Arrow with a U-turn or L-bend whose trajectory passes near its own segments
            // Segment at (2, 1) -> (2, 2) -> (3, 2) -> (3, 3), pointing UP (0, 1).
            var arrow = new ArrowData
            {
                id = 5,
                gridPoints = new List<Vector2Int> { new Vector2Int(2, 1), new Vector2Int(2, 2), new Vector2Int(3, 2), new Vector2Int(3, 3) },
                headDirection = new Vector2Int(0, 1),
                isActive = true
            };

            _grid.RegisterArrow(arrow);

            SolverResult result = PathSolver.Solve(_grid, arrow);

            Assert.IsTrue(result.isClear, "Arrow must not self-block and must have clear path to top boundary.");
        }

        [Test]
        public void Solve_AfterBlockerCleared_ReturnsClear()
        {
            var arrow1 = new ArrowData
            {
                id = 1,
                gridPoints = new List<Vector2Int> { new Vector2Int(1, 2), new Vector2Int(2, 2) },
                headDirection = new Vector2Int(1, 0),
                isActive = true
            };

            var blocker = new ArrowData
            {
                id = 2,
                gridPoints = new List<Vector2Int> { new Vector2Int(3, 1), new Vector2Int(3, 2) },
                headDirection = new Vector2Int(0, 1),
                isActive = true
            };

            _grid.RegisterArrow(arrow1);
            _grid.RegisterArrow(blocker);

            // Initially blocked
            Assert.IsFalse(PathSolver.Solve(_grid, arrow1).isClear);

            // Unregister blocker (simulating player clearing the blocker arrow)
            _grid.UnregisterArrow(blocker);

            // Now arrow 1 is clear!
            Assert.IsTrue(PathSolver.Solve(_grid, arrow1).isClear, "Once blocker is unregistered, path must be clear.");
        }
    }
}
