using UnityEngine;
using UnityEngine.UI;
using ArrowUntangle.Core;
using ArrowUntangle.Data;

namespace ArrowUntangle.UI
{
    public class MainMenuScreen : BaseScreen
    {
        [Header("Menu Buttons")]
        [SerializeField] private Button continueButton;
        [SerializeField] private Button levelsButton;
        [SerializeField] private Button dailyUntangleButton;
        [SerializeField] private Button settingsButton;

        [Header("Modals")]
        [SerializeField] private ExitConfirmationDialog exitDialog;
        [SerializeField] private GameObject dailyUntangleModal;
        [SerializeField] private Button dailyUntangleModalCloseButton;

        [Header("Idle Background Animation")]
        [SerializeField] private RectTransform[] idleArrowElements;
        [SerializeField] private float idleFloatSpeed = 0.8f;
        [SerializeField] private float idleFloatAmplitude = 12f;

        private Vector2[] _idleOriginalAnchoredPositions;

        protected override void Awake()
        {
            base.Awake();

            if (continueButton != null) continueButton.onClick.AddListener(HandleContinueClicked);
            if (levelsButton != null) levelsButton.onClick.AddListener(HandleLevelsClicked);
            if (dailyUntangleButton != null) dailyUntangleButton.onClick.AddListener(HandleDailyUntangleClicked);
            if (settingsButton != null) settingsButton.onClick.AddListener(HandleSettingsClicked);

            if (dailyUntangleModalCloseButton != null)
            {
                dailyUntangleModalCloseButton.onClick.AddListener(() =>
                {
                    if (dailyUntangleModal != null) dailyUntangleModal.SetActive(false);
                });
            }

            // Cache positions for zero-allocation idle animation
            if (idleArrowElements != null && idleArrowElements.Length > 0)
            {
                _idleOriginalAnchoredPositions = new Vector2[idleArrowElements.Length];
                for (int i = 0; i < idleArrowElements.Length; i++)
                {
                    if (idleArrowElements[i] != null)
                    {
                        _idleOriginalAnchoredPositions[i] = idleArrowElements[i].anchoredPosition;
                    }
                }
            }
        }

        private void Start()
        {
            if (GameStateManager.Instance != null)
            {
                GameStateManager.Instance.OnExitDialogRequested += ShowExitDialog;
            }
        }

        private void OnDestroy()
        {
            if (GameStateManager.Instance != null)
            {
                GameStateManager.Instance.OnExitDialogRequested -= ShowExitDialog;
            }
        }

        private void Update()
        {
            // Subtle idle background floating animation without per-frame GC allocations
            if (_idleOriginalAnchoredPositions != null)
            {
                float time = Time.unscaledTime * idleFloatSpeed;
                for (int i = 0; i < idleArrowElements.Length; i++)
                {
                    if (idleArrowElements[i] != null)
                    {
                        float offset = Mathf.Sin(time + (i * 1.3f)) * idleFloatAmplitude;
                        idleArrowElements[i].anchoredPosition = _idleOriginalAnchoredPositions[i] + new Vector2(0, offset);
                    }
                }
            }
        }

        private void HandleContinueClicked()
        {
            // If there's an in-progress mission recorded in SaveManager, resume it; else open LevelSelect
            if (SaveManager.Instance != null && SaveManager.Instance.HasInProgressMission())
            {
                string pat = SaveManager.Instance.GetLastPlayedPattern();
                int mission = SaveManager.Instance.GetLastPlayedMission();
                var level = SaveManager.Instance.FindMission(pat, mission);
                if (level != null)
                {
                    GameStateManager.Instance.LoadAndPlayLevel(level);
                    return;
                }
            }

            GameStateManager.Instance.TransitionTo(GameState.LevelSelect);
        }

        private void HandleLevelsClicked()
        {
            GameStateManager.Instance.TransitionTo(GameState.LevelSelect);
        }

        private void HandleDailyUntangleClicked()
        {
            // ASSUMPTION: Daily Untangle stubbed until Phase 5
            Debug.Log("[MainMenuScreen] Daily Untangle clicked — displaying placeholder modal.");
            if (dailyUntangleModal != null)
            {
                dailyUntangleModal.SetActive(true);
            }
            else
            {
                GameStateManager.Instance.RequestDailyUntangle();
            }
        }

        private void HandleSettingsClicked()
        {
            GameStateManager.Instance.TransitionTo(GameState.Settings);
        }

        public void ShowExitDialog()
        {
            if (exitDialog != null)
            {
                exitDialog.Show();
            }
        }
    }
}
