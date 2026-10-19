using System.Collections;
using UnityEngine;
using UnityEngine.UI;
using ArrowUntangle.Core;
using ArrowUntangle.Data;
using ArrowUntangle.Gameplay;
using ArrowUntangle.Level;

namespace ArrowUntangle.UI
{
    public class VictoryScreen : BaseScreen
    {
        [Header("UI Text Fields")]
        [SerializeField] private Text titleText;
        [SerializeField] private Text mistakesText;
        [SerializeField] private Text arrowsClearedText;

        [Header("Buttons")]
        [SerializeField] private Button nextLevelButton;
        [SerializeField] private Button replayButton;
        [SerializeField] private Button homeButton;

        [Header("Animation Beats")]
        [SerializeField] private GameObject silhouetteGraphic;
        [SerializeField] private ParticleSystem celebrationParticles;

        [Header("Scene References")]
        [SerializeField] private LevelLoader levelLoader;
        [SerializeField] private GameManager gameManager;

        private int _mistakes = 0;
        private int _totalArrows = 0;

        protected override void Awake()
        {
            base.Awake();

            if (levelLoader == null) levelLoader = FindObjectOfType<LevelLoader>();
            if (gameManager == null) gameManager = FindObjectOfType<GameManager>();

            if (nextLevelButton != null) nextLevelButton.onClick.AddListener(HandleNextLevelClicked);
            if (replayButton != null) replayButton.onClick.AddListener(HandleReplayClicked);
            if (homeButton != null) homeButton.onClick.AddListener(HandleHomeClicked);
        }

        protected override void OnShown()
        {
            base.OnShown();

            if (levelLoader != null && levelLoader.CurrentLevel != null)
            {
                var lvl = levelLoader.CurrentLevel;
                _totalArrows = lvl.arrows.Count;
                if (gameManager != null)
                {
                    _mistakes = gameManager.MaxHearts - gameManager.CurrentHearts;
                }

                // Record progress in SaveManager
                if (SaveManager.Instance != null)
                {
                    int stars = (_mistakes == 0) ? 3 : (_mistakes == 1 ? 2 : 1);
                    SaveManager.Instance.RecordMissionSuccess(lvl.patternName, lvl.missionNumber, stars);
                }
            }

            StartCoroutine(PlayVictoryBeatsSequence());
        }

        private IEnumerator PlayVictoryBeatsSequence()
        {
            if (titleText != null) titleText.text = "LEVEL COMPLETE!";

            // Initial blanking for animated beat reveal
            if (mistakesText != null) mistakesText.text = "";
            if (arrowsClearedText != null) arrowsClearedText.text = "";

            if (silhouetteGraphic != null)
            {
                silhouetteGraphic.SetActive(false);
            }

            // Beat 1: Brief pause (0.25s)
            yield return new WaitForSecondsRealtime(0.25f);

            // Beat 2: Silhouette reveal
            if (silhouetteGraphic != null)
            {
                silhouetteGraphic.SetActive(true);
            }

            // Beat 3: Particles & sound burst
            if (celebrationParticles != null)
            {
                celebrationParticles.Play();
            }

            yield return new WaitForSecondsRealtime(0.3f);

            // Beat 4: Animated stat counters
            string rating = (_mistakes == 0) ? "♥ Perfect (0 mistakes)" : $"Mistakes: {_mistakes}";
            if (mistakesText != null) mistakesText.text = rating;

            yield return new WaitForSecondsRealtime(0.2f);
            if (arrowsClearedText != null) arrowsClearedText.text = $"Arrows: {_totalArrows}";
        }

        private void HandleNextLevelClicked()
        {
            if (levelLoader == null || levelLoader.CurrentLevel == null)
            {
                GameStateManager.Instance.TransitionTo(GameState.LevelSelect);
                return;
            }

            var current = levelLoader.CurrentLevel;
            int nextMissionNum = current.missionNumber + 1;

            if (SaveManager.Instance != null)
            {
                var nextMission = SaveManager.Instance.FindMission(current.patternName, nextMissionNum);
                if (nextMission != null && !nextMission.isLocked)
                {
                    SaveManager.Instance.SetLastPlayedMission(current.patternName, nextMissionNum);
                    GameStateManager.Instance.LoadAndPlayLevel(nextMission);
                    return;
                }
            }

            // Pattern exhausted or next is locked: safely fall back to Level Select
            GameStateManager.Instance.TransitionTo(GameState.LevelSelect);
        }

        private void HandleReplayClicked()
        {
            if (levelLoader != null && levelLoader.CurrentLevel != null)
            {
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
