using System;
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
        [SerializeField] private float releaseThresholdFraction = 0.65f; // Fraction of cell step needed to trigger release action

        private ArrowEntity _activeArrow;
        private int _maxAllowedDistance;
        private SolverResult _solverResult;
        private Vector3 _pressWorldPos;
        private Vector3 _arrowHeadStartWorldPos;
        private float _currentDragUnits;
        private bool _isDragging = false;
        private int _activeTouchId = -1;

        private void Start()
        {
            if (targetCamera == null) targetCamera = Camera.main;
            if (gridSystem == null) gridSystem = FindObjectOfType<GridSystem>();
            if (gameManager == null) gameManager = FindObjectOfType<GameManager>();
        }

        private void Update()
        {
            // Input gate driven by GameStateManager: blocks input during Paused/Loading/Victory/Failure/Menus
            if (GameStateManager.Instance != null && !GameStateManager.Instance.IsInputAllowed) return;
            if (gameManager != null && !gameManager.IsGameActive) return;

            HandlePointerInput();
        }

        private void HandlePointerInput()
        {
            // Support both Touchscreen and Pointer/Mouse via New Input System
            bool pressDown = false;
            bool pressHeld = false;
            bool pressUp = false;
            Vector2 screenPos = Vector2.zero;

            if (Touchscreen.current != null && Touchscreen.current.touches.Count > 0)
            {
                var touch = Touchscreen.current.touches[0];
                screenPos = touch.position.ReadValue();

                if (touch.press.wasPressedThisFrame)
                {
                    pressDown = true;
                    _activeTouchId = touch.touchId.ReadValue();
                }
                else if (touch.press.isPressed && touch.touchId.ReadValue() == _activeTouchId)
                {
                    pressHeld = true;
                }
                else if (touch.press.wasReleasedThisFrame && touch.touchId.ReadValue() == _activeTouchId)
                {
                    pressUp = true;
                }
            }
            else if (Pointer.current != null)
            {
                screenPos = Pointer.current.position.ReadValue();
                pressDown = Pointer.current.press.wasPressedThisFrame;
                pressHeld = Pointer.current.press.isPressed;
                pressUp = Pointer.current.press.wasReleasedThisFrame;
            }

            if (pressDown && !_isDragging)
            {
                OnPointerDown(screenPos);
            }
            else if (pressHeld && _isDragging)
            {
                OnPointerDrag(screenPos);
            }
            else if (pressUp && _isDragging)
            {
                OnPointerUp();
            }
        }

        private void OnPointerDown(Vector2 screenPos)
        {
            if (targetCamera == null) return;

            Vector3 worldPos = targetCamera.ScreenToWorldPoint(new Vector3(screenPos.x, screenPos.y, -targetCamera.transform.position.z));
            worldPos.z = 0f;

            // 48dp minimum touch target is accounted for in the CircleCollider2D radius
            RaycastHit2D hit = Physics2D.Raycast(worldPos, Vector2.zero);
            if (hit.collider != null)
            {
                ArrowEntity entity = hit.collider.GetComponentInParent<ArrowEntity>();
                if (entity != null && entity.IsInteractable)
                {
                    StartDrag(entity, worldPos);
                }
            }
        }

        private void StartDrag(ArrowEntity entity, Vector3 worldStartPos)
        {
            _activeArrow = entity;
            _isDragging = true;
            _pressWorldPos = worldStartPos;

            _arrowHeadStartWorldPos = gridSystem.GridToWorldPosition(_activeArrow.Data.HeadPoint);

            // Compute maxAllowedDistance once at press-start by walking deterministic solver
            _maxAllowedDistance = PathSolver.GetMaxTravelDistance(gridSystem, _activeArrow.Data);
            _solverResult = PathSolver.Solve(gridSystem, _activeArrow.Data);

            _currentDragUnits = 0f;
        }

        private void OnPointerDrag(Vector2 screenPos)
        {
            if (_activeArrow == null || gridSystem == null || targetCamera == null) return;

            Vector3 currentWorldPos = targetCamera.ScreenToWorldPoint(new Vector3(screenPos.x, screenPos.y, -targetCamera.transform.position.z));
            currentWorldPos.z = 0f;

            Vector3 worldDelta = currentWorldPos - _pressWorldPos;

            // Project worldDelta onto arrow's travel direction vector only (no sideways movement)
            Vector2 forwardDir = (Vector2)_activeArrow.Data.headDirection;
            Vector3 forward3D = new Vector3(forwardDir.x, forwardDir.y, 0f).normalized;

            float projectedDistance = Vector3.Dot(worldDelta, forward3D);

            // Convert world distance to grid cell units
            float cellUnits = projectedDistance / gridSystem.CellSize;

            // Clamp to [0, maxAllowedDistance]
            // Stops exactly at clamp point (blocking cell or boundary) even if finger pulls further
            _currentDragUnits = Mathf.Clamp(cellUnits, 0f, _maxAllowedDistance);

            Vector3 dragOffsetWorld = forward3D * (_currentDragUnits * gridSystem.CellSize);
            _activeArrow.SetDragOffset(dragOffsetWorld);
        }

        private void OnPointerUp()
        {
            if (_activeArrow == null) return;

            // Evaluate release outcome
            // 1. Released at/past boundary -> success escape
            // 2. Released at a blocked cell -> failure recoil, lose heart
            // 3. Released mid-path without reaching wall or boundary -> snap back with no penalty
            float thresholdDistance = Mathf.Max(0.5f, _maxAllowedDistance - (1f - releaseThresholdFraction));

            if (_solverResult.isClear && _currentDragUnits >= thresholdDistance)
            {
                // Released near or at boundary: escape!
                gameManager.NotifyArrowCleared(_activeArrow, _solverResult.exitBoundaryPoint);
            }
            else if (!_solverResult.isClear && _currentDragUnits >= _maxAllowedDistance - 0.25f && _maxAllowedDistance > 0)
            {
                // Dragged into obstruction and released
                gameManager.NotifyArrowBlocked(_activeArrow);
            }
            else if (!_solverResult.isClear && _maxAllowedDistance == 0 && _currentDragUnits >= 0.2f)
            {
                // Immediately blocked right in front of head, tried to drag into obstacle
                gameManager.NotifyArrowBlocked(_activeArrow);
            }
            else
            {
                // ASSUMPTION: Released mid-path, not blocked, not at boundary -> snap smoothly back to start with no penalty
                _activeArrow.TriggerSnapBack();
            }

            _isDragging = false;
            _activeArrow = null;
            _activeTouchId = -1;
        }
    }
}
