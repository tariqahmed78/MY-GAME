using System;
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
        [SerializeField] private Button pauseButton; // 48dp minimum touch target
        [SerializeField] private Text missionTitleText;
        [SerializeField] private Text heartsText;
        [SerializeField] private Text remainingArrowsText;

        [Header("Bottom Bar Utility Controls")]
        [SerializeField] private Button hintButton;
        [SerializeField] private Button magnifierButton;
        [SerializeField] private Button gridToggleButton;
        [SerializeField] private Image gridToggleIcon;

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

        [Header("Scene References")]
        [SerializeField] private GameManager gameManager;
        [SerializeField] private LevelLoader levelLoader;

        // Second deferred item for this phase:
        public event Action OnHintRequested; // Inert until Phase 5
        public event Action OnMagnifierRequested; // Inert until Phase 5

        private int _totalArrows = 0;
        private int _arrowsRemaining = 0;

        protected override void Awake()
        {
            base.Awake();

            if (gameManager == null) gameManager = FindObjectOfType<GameManager>();
            if (levelLoader == null) levelLoader = FindObjectOfType<LevelLoader>();

            // Top Bar
            if (pauseButton != null) pauseButton.onClick.AddListener(HandlePauseClicked);

            // Bottom Bar
            if (hintButton != null) hintButton.onClick.AddListener(HandleHintClicked);
            if (magnifierButton != null) magnifierButton.onClick.AddListener(HandleMagnifierClicked);
            if (gridToggleButton != null) gridToggleButton.onClick.AddListener(HandleGridToggleClicked);

            // Pause Modal Buttons
            if (resumeButton != null) resumeButton.onClick.AddListener(HandleResumeClicked);
            if (restartButton != null) restartButton.onClick.AddListener(HandleRestartClicked);
            if (pauseSettingsButton != null) pauseSettingsButton.onClick.AddListener(HandlePauseSettingsClicked);
            if (pauseMainMenuButton != null) pauseMainMenuButton.onClick.AddListener(HandlePauseMainMenuClicked);

            // Confirm Quit Sub-Modal
            if (confirmQuitYesButton != null) confirmQuitYesButton.onClick.AddListener(HandleConfirmQuitYes);
            if (confirmQuitNoButton != null) confirmQuitNoButton.onClick.AddListener(HandleConfirmQuitNo);

            HidePauseMenu();
        }

        private void Start()
        {
            if (gameManager != null)
            {
                gameManager.OnHeartsChanged += UpdateHeartsUI;
                gameManager.OnArrowCleared += HandleArrowCleared;
            }

            if (levelLoader != null)
            {
                levelLoader.OnLevelLoaded += HandleLevelLoaded;
            }

            if (GameStateManager.Instance != null)
            {
                GameStateManager.Instance.OnStateChanged += HandleGameStateChanged;
            }

            UpdateGridIconVisual();
        }

        private void OnDestroy()
        {
            if (gameManager != null)
            {
                gameManager.OnHeartsChanged -= UpdateHeartsUI;
                gameManager.OnArrowCleared -= HandleArrowCleared;
            }

            if (levelLoader != null)
            {
                levelLoader.OnLevelLoaded -= HandleLevelLoaded;
            }

            if (GameStateManager.Instance != null)
            {
                GameStateManager.Instance.OnStateChanged -= HandleGameStateChanged;
            }
        }

        private void HandleGameStateChanged(GameState newState, GameState previousState)
        {
            if (newState == GameState.Playing)
            {
                Show(true);
                HidePauseMenu();
            }
            else if (newState == GameState.Paused)
            {
                Show(false);
                ShowPauseMenu();
            }
            else if (newState == GameState.MainMenu || newState == GameState.LevelSelect || newState == GameState.Boot)
            {
                Hide(false);
                HidePauseMenu();
            }
        }

        private void HandleLevelLoaded(LevelData level)
        {
            if (level == null) return;

            if (missionTitleText != null)
            {
                missionTitleText.text = string.IsNullOrEmpty(level.missionName) ? $"Level {level.levelId}" : level.missionName;
            }

            _totalArrows = level.arrows != null ? level.arrows.Count : 0;
            _arrowsRemaining = _totalArrows;
            UpdateRemainingArrowsUI();

            if (gameManager != null)
            {
                UpdateHeartsUI(gameManager.CurrentHearts, gameManager.MaxHearts);
            }
        }

        private void HandleArrowCleared(ArrowData arrow)
        {
            _arrowsRemaining = Mathf.Max(0, _arrowsRemaining - 1);
            UpdateRemainingArrowsUI();
        }

        private void UpdateRemainingArrowsUI()
        {
            if (remainingArrowsText != null)
            {
                remainingArrowsText.text = $"Arrows: {_arrowsRemaining} / {_totalArrows}";
            }
        }

        private void UpdateHeartsUI(int current, int max)
        {
            if (heartsText == null) return;

            string heartsDisplay = "";
            for (int i = 0; i < max; i++)
            {
                heartsDisplay += (i < current) ? "<color=#E84118>♥</color> " : "<color=#555555>♡</color> ";
            }
            heartsText.text = heartsDisplay.Trim();
        }

        // --- Bottom Bar Controls ---

        private void HandleHintClicked()
        {
            // ASSUMPTION: Hint button inert until Phase 5
            Debug.Log("[GameplayHUDScreen] Hint clicked (deferred to Phase 5).");
            OnHintRequested?.Invoke();
        }

        private void HandleMagnifierClicked()
        {
            // ASSUMPTION: Magnifier button inert until Phase 5
            Debug.Log("[GameplayHUDScreen] Magnifier clicked (deferred to Phase 5).");
            OnMagnifierRequested?.Invoke();
        }

        private void HandleGridToggleClicked()
        {
            if (SettingsManager.Instance != null)
            {
                SettingsManager.Instance.GridEnabled = !SettingsManager.Instance.GridEnabled;
                UpdateGridIconVisual();
            }
        }

        private void UpdateGridIconVisual()
        {
            if (gridToggleIcon != null && SettingsManager.Instance != null)
            {
                gridToggleIcon.color = SettingsManager.Instance.GridEnabled ? Color.white : new Color(1f, 1f, 1f, 0.4f);
            }
        }

        // --- Pause Menu Handling ---

        private void HandlePauseClicked()
        {
            GameStateManager.Instance.TransitionTo(GameState.Paused);
        }

        private void ShowPauseMenu()
        {
            if (pauseMenuPanel != null) pauseMenuPanel.SetActive(true);
            if (confirmQuitPanel != null) confirmQuitPanel.SetActive(false);
        }

        private void HidePauseMenu()
        {
            if (pauseMenuPanel != null) pauseMenuPanel.SetActive(false);
            if (confirmQuitPanel != null) confirmQuitPanel.SetActive(false);
        }

        private void HandleResumeClicked()
        {
            GameStateManager.Instance.ResumeGame();
        }

        private void HandleRestartClicked()
        {
            HidePauseMenu();
            GameStateManager.Instance.RestartCurrentLevel();
        }

        private void HandlePauseSettingsClicked()
        {
            GameStateManager.Instance.TransitionTo(GameState.Settings);
        }

        private void HandlePauseMainMenuClicked()
        {
            // Show confirmation modal: "In-progress mission would be lost"
            if (confirmQuitPanel != null)
            {
                confirmQuitPanel.SetActive(true);
            }
            else
            {
                GameStateManager.Instance.TransitionTo(GameState.MainMenu);
            }
        }

        private void HandleConfirmQuitYes()
        {
            HidePauseMenu();
            GameStateManager.Instance.TransitionTo(GameState.MainMenu);
        }

        private void HandleConfirmQuitNo()
        {
            if (confirmQuitPanel != null) confirmQuitPanel.SetActive(false);
        }
    }
}
