using UnityEngine;
using UnityEngine.UI;
using ArrowUntangle.Core;
using ArrowUntangle.Gameplay;
using ArrowUntangle.Level;

namespace ArrowUntangle.UI
{
    public class FailureScreen : BaseScreen
    {
        [Header("UI Text Fields")]
        [SerializeField] private Text titleText;
        [SerializeField] private Text remainingArrowsText;

        [Header("Buttons")]
        [SerializeField] private Button watchAdHeartButton;
        [SerializeField] private Button retryButton;
        [SerializeField] private Button homeButton;

        [Header("Scene References")]
        [SerializeField] private LevelLoader levelLoader;
        [SerializeField] private GameManager gameManager;

        protected override void Awake()
        {
            base.Awake();

            if (levelLoader == null) levelLoader = FindObjectOfType<LevelLoader>();
            if (gameManager == null) gameManager = FindObjectOfType<GameManager>();

            if (watchAdHeartButton != null) watchAdHeartButton.onClick.AddListener(HandleWatchAdHeartClicked);
            if (retryButton != null) retryButton.onClick.AddListener(HandleRetryClicked);
            if (homeButton != null) homeButton.onClick.AddListener(HandleHomeClicked);
        }

        protected override void OnShown()
        {
            base.OnShown();

            if (titleText != null) titleText.text = "OUT OF HEARTS";

            // Count remaining active arrows
            int remaining = 0;
            if (levelLoader != null && levelLoader.InstantiatedEntities != null)
            {
                for (int i = 0; i < levelLoader.InstantiatedEntities.Count; i++)
                {
                    var ent = levelLoader.InstantiatedEntities[i];
                    if (ent != null && ent.Data.isActive && !ent.Data.hasBeenCleared)
                    {
                        remaining++;
                    }
                }
            }

            if (remainingArrowsText != null)
            {
                remainingArrowsText.text = $"Arrows Remaining: {remaining}";
            }
        }

        private void HandleWatchAdHeartClicked()
        {
            // ASSUMPTION: rewarded-ad call stubbed to instant-grant until Phase 5 monetization
            Debug.Log("[FailureScreen] Watch Ad +1 Heart clicked — granting 1 heart to test loop end-to-end.");

            if (gameManager != null)
            {
                gameManager.RestartLevel(); // Restores hearts and resumes game
                GameStateManager.Instance.TransitionTo(GameState.Playing);
            }
        }

        private void HandleRetryClicked()
        {
            if (levelLoader != null && levelLoader.CurrentLevel != null)
            {
                // Reloads the exact same level (same seed/arrangement, hearts reset)
                GameStateManager.Instance.LoadAndPlayLevel(levelLoader.CurrentLevel.Clone());
            }
            else
            {
                GameStateManager.Instance.TransitionTo(GameState.LevelSelect);
            }
        }

        private void HandleHomeClicked()
        {
            GameStateManager.Instance.TransitionTo(GameState.MainMenu);
        }
    }
}
