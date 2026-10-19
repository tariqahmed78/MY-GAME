using System;
using System.Collections;
using UnityEngine;
using ArrowUntangle.Level;
using ArrowUntangle.Grid;
using ArrowUntangle.Rendering;

namespace ArrowUntangle.Gameplay
{
    public enum ArrowAnimState
    {
        Idle,
        Dragging,
        Escaping,
        Recoiling,
        SnappingBack
    }

    [RequireComponent(typeof(ArrowMeshRenderer2D), typeof(CircleCollider2D))]
    public class ArrowEntity : MonoBehaviour
    {
        [Header("Components")]
        [SerializeField] private ArrowMeshRenderer2D meshRenderer;
        [SerializeField] private CircleCollider2D headCollider;

        [Header("Animation Timings")]
        [SerializeField] private float escapeDuration = 0.35f;
        [SerializeField] private float recoilDuration = 0.28f;
        [SerializeField] private float snapBackDuration = 0.18f;

        private ArrowData _data;
        private GridSystem _grid;
        private ArrowAnimState _state = ArrowAnimState.Idle;
        private Vector3 _currentHeadDragOffset = Vector3.zero;
        private Coroutine _activeAnimRoutine;

        public ArrowData Data => _data;
        public ArrowAnimState State => _state;
        public bool IsInteractable => _state == ArrowAnimState.Idle && _data != null && _data.isActive && !_data.hasBeenCleared;

        public event Action<ArrowEntity> OnEscapeCompleted;
        public event Action<ArrowEntity> OnRecoilCompleted;

        private void Awake()
        {
            if (meshRenderer == null) meshRenderer = GetComponent<ArrowMeshRenderer2D>();
            if (headCollider == null) headCollider = GetComponent<CircleCollider2D>();
        }

        public void Setup(ArrowData arrowData, GridSystem gridSystem)
        {
            _data = arrowData;
            _grid = gridSystem;
            _state = ArrowAnimState.Idle;
            _currentHeadDragOffset = Vector3.zero;

            meshRenderer.SetColorIndex(_data.colorIndex);
            meshRenderer.RebuildMesh(_data, _grid, Vector3.zero);

            UpdateColliderHitbox();
        }

        public void UpdateColliderHitbox()
        {
            if (_data == null || _grid == null || headCollider == null) return;

            Vector3 headWorldPos = _grid.GridToWorldPosition(_data.HeadPoint);
            // Minimum 48dp touch target hit radius (approximately 0.5 - 0.7 units in 2D ortho)
            headCollider.offset = transform.InverseTransformPoint(headWorldPos);
            headCollider.radius = Mathf.Max(0.48f, _grid.CellSize * 0.5f);
            headCollider.isTrigger = true;
        }

        public void SetDragOffset(Vector3 offsetWorld)
        {
            if (_state != ArrowAnimState.Idle && _state != ArrowAnimState.Dragging) return;

            _state = ArrowAnimState.Dragging;
            _currentHeadDragOffset = offsetWorld;
            meshRenderer.RebuildMesh(_data, _grid, _currentHeadDragOffset);
        }

        /// <summary>
        /// Player dragged past boundary: smooth escape off-screen, cyan highlight.
        /// </summary>
        public void TriggerEscape(Vector2Int exitBoundaryPoint)
        {
            if (_activeAnimRoutine != null) StopCoroutine(_activeAnimRoutine);
            _activeAnimRoutine = StartCoroutine(EscapeRoutine(exitBoundaryPoint));
        }

        private IEnumerator EscapeRoutine(Vector2Int exitBoundaryPoint)
        {
            _state = ArrowAnimState.Escaping;
            meshRenderer.HighlightCyan();

            Vector3 startPos = transform.position;
            Vector3 exitWorld = _grid.GridToWorldPosition(exitBoundaryPoint);
            Vector3 escapeVector = (exitWorld - _grid.GridToWorldPosition(_data.HeadPoint)).normalized * (_grid.CellSize * 10f);
            Vector3 targetPos = startPos + escapeVector;

            float elapsed = 0f;
            while (elapsed < escapeDuration)
            {
                elapsed += Time.deltaTime;
                float t = Mathf.Clamp01(elapsed / escapeDuration);
                // Ease-in acceleration off-screen (QuadIn)
                float curvedT = t * t;

                transform.position = Vector3.Lerp(startPos, targetPos, curvedT);
                yield return null;
            }

            _data.hasBeenCleared = true;
            _data.isActive = false;
            gameObject.SetActive(false);

            OnEscapeCompleted?.Invoke(this);
        }

        /// <summary>
        /// Player dragged into obstacle: crimson flash, recoil shake back to origin, heart penalty.
        /// </summary>
        public void TriggerRecoil()
        {
            if (_activeAnimRoutine != null) StopCoroutine(_activeAnimRoutine);
            _activeAnimRoutine = StartCoroutine(RecoilRoutine());
        }

        private IEnumerator RecoilRoutine()
        {
            _state = ArrowAnimState.Recoiling;
            meshRenderer.FlashCrimson();

            Vector3 originalHeadOffset = _currentHeadDragOffset;
            Vector3 originalPos = transform.position;
            float elapsed = 0f;

            while (elapsed < recoilDuration)
            {
                elapsed += Time.deltaTime;
                float t = Mathf.Clamp01(elapsed / recoilDuration);

                // Spring-recoil interpolation back to zero offset
                float smoothT = 1f - Mathf.Sin(t * Mathf.PI * 0.5f);
                _currentHeadDragOffset = Vector3.Lerp(Vector3.zero, originalHeadOffset, smoothT);

                // Squash/shake oscillation perpendicular to travel
                Vector2 perp = new Vector2(-_data.headDirection.y, _data.headDirection.x);
                float shakeMagnitude = (1f - t) * 0.12f * Mathf.Sin(t * Mathf.PI * 8f);
                transform.position = originalPos + new Vector3(perp.x, perp.y, 0f) * shakeMagnitude;

                meshRenderer.RebuildMesh(_data, _grid, _currentHeadDragOffset);
                yield return null;
            }

            transform.position = originalPos;
            _currentHeadDragOffset = Vector3.zero;
            meshRenderer.ResetColor();
            meshRenderer.RebuildMesh(_data, _grid, Vector3.zero);

            _state = ArrowAnimState.Idle;
            OnRecoilCompleted?.Invoke(this);
        }

        /// <summary>
        /// Player released mid-path without hitting obstruction or boundary.
        /// Snaps smoothly back to start with no penalty.
        /// // ASSUMPTION: Per Section 4.1.5, release mid-path snaps smoothly back to start position with zero penalty.
        /// </summary>
        public void TriggerSnapBack()
        {
            if (_activeAnimRoutine != null) StopCoroutine(_activeAnimRoutine);
            _activeAnimRoutine = StartCoroutine(SnapBackRoutine());
        }

        private IEnumerator SnapBackRoutine()
        {
            _state = ArrowAnimState.SnappingBack;
            Vector3 startOffset = _currentHeadDragOffset;
            float elapsed = 0f;

            while (elapsed < snapBackDuration)
            {
                elapsed += Time.deltaTime;
                float t = Mathf.Clamp01(elapsed / snapBackDuration);
                // Ease out cubic
                float curvedT = 1f - Mathf.Pow(1f - t, 3f);

                _currentHeadDragOffset = Vector3.Lerp(startOffset, Vector3.zero, curvedT);
                meshRenderer.RebuildMesh(_data, _grid, _currentHeadDragOffset);
                yield return null;
            }

            _currentHeadDragOffset = Vector3.zero;
            meshRenderer.RebuildMesh(_data, _grid, Vector3.zero);
            _state = ArrowAnimState.Idle;
        }
    }
}
