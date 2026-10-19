using System;
using System.Collections.Generic;
using UnityEngine;
using ArrowUntangle.Grid;
using ArrowUntangle.Level;

namespace ArrowUntangle.Gameplay
{
    public enum RoundState
    {
        Ready,
        Playing,
        Won,
        Lost,
        Paused
    }

    public class GameManager : MonoBehaviour
    {
        [Header("Rules & Lives")]
        [SerializeField] private int maxHearts = 3;

        [Header("Scene References")]
        [SerializeField] private GridSystem gridSystem;

        private int _currentHearts;
        private RoundState _currentState = RoundState.Ready;
        private List<ArrowEntity> _allArrowEntities = new List<ArrowEntity>();
        private int _remainingArrowCount;

        public int CurrentHearts => _currentHearts;
        public int MaxHearts => maxHearts;
        public RoundState CurrentState => _currentState;
        public bool IsGameActive => _currentState == RoundState.Playing;

        public event Action<int, int> OnHeartsChanged; // (current, max)
        public event Action<ArrowData> OnArrowCleared;
        public event Action<ArrowData> OnArrowBlocked;
        public event Action OnLevelWon;
        public event Action OnLevelLost;

        private void Awake()
        {
            if (gridSystem == null) gridSystem = FindObjectOfType<GridSystem>();
            _currentHearts = maxHearts;
        }

        public void RegisterEntities(IEnumerable<ArrowEntity> entities)
        {
            _allArrowEntities.Clear();
            _allArrowEntities.AddRange(entities);
            _remainingArrowCount = _allArrowEntities.Count;

            _currentHearts = maxHearts;
            _currentState = RoundState.Playing;

            OnHeartsChanged?.Invoke(_currentHearts, maxHearts);
        }

        public void NotifyArrowCleared(ArrowEntity arrowEntity, Vector2Int exitBoundaryPoint)
        {
            if (_currentState != RoundState.Playing || arrowEntity == null) return;

            // Remove from grid matrix so subsequent arrows can pass through vacated cells
            gridSystem.UnregisterArrow(arrowEntity.Data);

            arrowEntity.OnEscapeCompleted += HandleArrowEscapeCompleted;
            arrowEntity.TriggerEscape(exitBoundaryPoint);

            OnArrowCleared?.Invoke(arrowEntity.Data);
        }

        private void HandleArrowEscapeCompleted(ArrowEntity arrowEntity)
        {
            arrowEntity.OnEscapeCompleted -= HandleArrowEscapeCompleted;

            _remainingArrowCount--;

            if (_remainingArrowCount <= 0)
            {
                _currentState = RoundState.Won;
                OnLevelWon?.Invoke();
            }
        }

        public void NotifyArrowBlocked(ArrowEntity arrowEntity)
        {
            if (_currentState != RoundState.Playing || arrowEntity == null) return;

            arrowEntity.TriggerRecoil();

            _currentHearts = Mathf.Max(0, _currentHearts - 1);
            OnHeartsChanged?.Invoke(_currentHearts, maxHearts);
            OnArrowBlocked?.Invoke(arrowEntity.Data);

            if (_currentHearts <= 0)
            {
                _currentState = RoundState.Lost;
                OnLevelLost?.Invoke();
            }
        }

        public void RestartLevel()
        {
            _currentHearts = maxHearts;
            _currentState = RoundState.Playing;
            OnHeartsChanged?.Invoke(_currentHearts, maxHearts);
        }
    }
}
