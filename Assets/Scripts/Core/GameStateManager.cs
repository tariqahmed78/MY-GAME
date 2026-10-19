using System;
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
        /// Input gate for Phase 1 ArrowDragController: Block input during Paused/Loading/Victory/Failure.
        /// Only allowed strictly while Playing.
        /// </summary>
        public bool IsInputAllowed => _currentState == GameState.Playing;

        public event Action<GameState, GameState> OnStateChanged; // (newState, previousState)
        public event Action OnExitDialogRequested;
        public event Action<string> OnDailyUntangleRequested; // Handled as placeholder until Phase 5

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }

            Instance = this;
            DontDestroyOnLoad(gameObject);

            if (gameManager == null) gameManager = FindObjectOfType<GameManager>();
            if (levelLoader == null) levelLoader = FindObjectOfType<LevelLoader>();
        }

        private void Start()
        {
            if (gameManager != null)
            {
                gameManager.OnLevelWon += HandleLevelWon;
                gameManager.OnLevelLost += HandleLevelLost;
            }

            TransitionTo(startState);
        }

        private void OnDestroy()
        {
            if (gameManager != null)
            {
                gameManager.OnLevelWon -= HandleLevelWon;
                gameManager.OnLevelLost -= HandleLevelLost;
            }
        }

        private void Update()
        {
            HandleAndroidBackButton();
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

            // Pause or unpause timeScale if appropriate
            if (_currentState == GameState.Paused)
            {
                Time.timeScale = 0f;
            }
            else if (_previousState == GameState.Paused)
            {
                Time.timeScale = 1f;
            }

            OnStateChanged?.Invoke(_currentState, _previousState);
        }

        /// <summary>
        /// Section 8: Android Back Button Routing
        /// Centralized hardware back button handler following the spec's exact state matrix.
        /// </summary>
        private void HandleAndroidBackButton()
        {
            bool backPressed = false;

            // Check New Input System Escape key
            if (Keyboard.current != null && Keyboard.current.escapeKey.wasPressedThisFrame)
            {
                backPressed = true;
            }
            // Check legacy / Android hardware back button
            else if (UnityEngine.Input.GetKeyDown(KeyCode.Escape))
            {
                backPressed = true;
            }

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

                case GameState.Loading:
                case GameState.Boot:
                default:
                    // Block back navigation during boot or async loading
                    break;
            }
        }

        /// <summary>
        /// Runs level setup off the main frame to show a lightweight loading indicator
        /// without freezing or hitching during generation or validation.
        /// </summary>
        public void LoadAndPlayLevel(LevelData level)
        {
            StartCoroutine(RoutineLoadAndPlay(level));
        }

        public void GenerateAndPlayLevel(int levelId, DifficultyTier tier, int seed = -1)
        {
            StartCoroutine(RoutineGenerateAndPlay(levelId, tier, seed));
        }

        private IEnumerator RoutineLoadAndPlay(LevelData level)
        {
            TransitionTo(GameState.Loading);

            // Yield a frame so UI draws the spinner
            yield return null;

            if (levelLoader != null)
            {
                levelLoader.LoadLevel(level);
            }

            yield return null;
            TransitionTo(GameState.Playing);
        }

        private IEnumerator RoutineGenerateAndPlay(int levelId, DifficultyTier tier, int seed)
        {
            TransitionTo(GameState.Loading);
            yield return null;

            LevelData generated = LevelGenerator.GenerateLevel(levelId, tier, seed);

            yield return null;

            if (levelLoader != null)
            {
                levelLoader.LoadLevel(generated);
            }

            yield return null;
            TransitionTo(GameState.Playing);
        }

        private void HandleLevelWon()
        {
            TransitionTo(GameState.Victory);
        }

        private void HandleLevelLost()
        {
            TransitionTo(GameState.Failure);
        }

        public void ResumeGame()
        {
            if (_currentState == GameState.Paused)
            {
                TransitionTo(GameState.Playing);
            }
        }

        public void RestartCurrentLevel()
        {
            if (levelLoader != null && levelLoader.CurrentLevel != null)
            {
                LoadAndPlayLevel(levelLoader.CurrentLevel.Clone());
            }
        }

        public void ReturnToSettingsPreviousState()
        {
            TransitionTo(_stateBeforeSettings);
        }

        public void RequestDailyUntangle()
        {
            // ASSUMPTION: Daily Untangle stubbed until Phase 5
            OnDailyUntangleRequested?.Invoke("Daily Untangle is coming soon in Phase 5!");
        }
    }
}
