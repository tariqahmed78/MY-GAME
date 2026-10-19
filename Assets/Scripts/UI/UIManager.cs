using UnityEngine;
using ArrowUntangle.Core;

namespace ArrowUntangle.UI
{
    public class UIManager : MonoBehaviour
    {
        public static UIManager Instance { get; private set; }

        [Header("Screens")]
        [SerializeField] private MainMenuScreen mainMenuScreen;
        [SerializeField] private LevelSelectScreen levelSelectScreen;
        [SerializeField] private GameplayHUDScreen gameplayHUDScreen;
        [SerializeField] private VictoryScreen victoryScreen;
        [SerializeField] private FailureScreen failureScreen;
        [SerializeField] private SettingsScreen settingsScreen;
        [SerializeField] private LoadingScreen loadingScreen;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);

            // Auto-resolve references if unassigned in Inspector
            if (mainMenuScreen == null) mainMenuScreen = GetComponentInChildren<MainMenuScreen>(true);
            if (levelSelectScreen == null) levelSelectScreen = GetComponentInChildren<LevelSelectScreen>(true);
            if (gameplayHUDScreen == null) gameplayHUDScreen = GetComponentInChildren<GameplayHUDScreen>(true);
            if (victoryScreen == null) victoryScreen = GetComponentInChildren<VictoryScreen>(true);
            if (failureScreen == null) failureScreen = GetComponentInChildren<FailureScreen>(true);
            if (settingsScreen == null) settingsScreen = GetComponentInChildren<SettingsScreen>(true);
            if (loadingScreen == null) loadingScreen = GetComponentInChildren<LoadingScreen>(true);
        }

        private void Start()
        {
            if (GameStateManager.Instance != null)
            {
                GameStateManager.Instance.OnStateChanged += HandleStateChanged;
                // Force sync with initial state
                HandleStateChanged(GameStateManager.Instance.CurrentState, GameState.Boot);
            }
        }

        private void OnDestroy()
        {
            if (GameStateManager.Instance != null)
            {
                GameStateManager.Instance.OnStateChanged -= HandleStateChanged;
            }
        }

        private void HandleStateChanged(GameState newState, GameState previousState)
        {
            // First hide transient screens
            if (newState != GameState.MainMenu && mainMenuScreen != null) mainMenuScreen.Hide();
            if (newState != GameState.LevelSelect && levelSelectScreen != null) levelSelectScreen.Hide();
            if (newState != GameState.Loading && loadingScreen != null) loadingScreen.Hide();
            if (newState != GameState.Victory && victoryScreen != null) victoryScreen.Hide();
            if (newState != GameState.Failure && failureScreen != null) failureScreen.Hide();
            if (newState != GameState.Settings && settingsScreen != null) settingsScreen.Hide();

            // Gameplay HUD handles its own paused overlay, but should hide when returning to menus
            if (newState == GameState.MainMenu || newState == GameState.LevelSelect)
            {
                if (gameplayHUDScreen != null) gameplayHUDScreen.Hide();
            }

            // Show active screen
            switch (newState)
            {
                case GameState.MainMenu:
                    if (mainMenuScreen != null) mainMenuScreen.Show();
                    break;

                case GameState.LevelSelect:
                    if (levelSelectScreen != null) levelSelectScreen.Show();
                    break;

                case GameState.Loading:
                    if (loadingScreen != null) loadingScreen.Show(false);
                    break;

                case GameState.Playing:
                    if (gameplayHUDScreen != null) gameplayHUDScreen.Show();
                    break;

                case GameState.Paused:
                    // GameplayHUD manages the pause overlay
                    break;

                case GameState.Victory:
                    if (victoryScreen != null) victoryScreen.Show();
                    break;

                case GameState.Failure:
                    if (failureScreen != null) failureScreen.Show();
                    break;

                case GameState.Settings:
                    if (settingsScreen != null) settingsScreen.Show();
                    break;
            }
        }
    }
}
