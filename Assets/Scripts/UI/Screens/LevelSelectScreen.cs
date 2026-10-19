using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using ArrowUntangle.Core;
using ArrowUntangle.Data;
using ArrowUntangle.Level;

namespace ArrowUntangle.UI
{
    public class LevelSelectScreen : BaseScreen
    {
        [Header("Header")]
        [SerializeField] private Button backButton;
        [SerializeField] private Text titleText;

        [Header("Pattern Tabs Container")]
        [SerializeField] private Transform patternTabsContainer;
        [SerializeField] private GameObject patternTabButtonPrefab;

        [Header("Missions Grid Container")]
        [SerializeField] private Transform missionsGridContainer;
        [SerializeField] private GameObject missionItemPrefab;

        private string _selectedPattern = "Classic";
        private readonly List<GameObject> _spawnedTabs = new List<GameObject>();
        private readonly List<GameObject> _spawnedMissions = new List<GameObject>();

        protected override void Awake()
        {
            base.Awake();

            if (backButton != null)
            {
                backButton.onClick.AddListener(HandleBackClicked);
            }
        }

        protected override void OnShown()
        {
            base.OnShown();
            RefreshLevelCatalog();
        }

        private void HandleBackClicked()
        {
            GameStateManager.Instance.TransitionTo(GameState.MainMenu);
        }

        public void SelectPattern(string patternName)
        {
            _selectedPattern = patternName;
            RefreshLevelCatalog();
        }

        /// <summary>
        /// Populates pattern tabs and mission cards from ISaveManager.
        /// </summary>
        public void RefreshLevelCatalog()
        {
            if (SaveManager.Instance == null) return;

            // Clear old items
            for (int i = 0; i < _spawnedTabs.Count; i++) if (_spawnedTabs[i] != null) Destroy(_spawnedTabs[i]);
            _spawnedTabs.Clear();

            for (int i = 0; i < _spawnedMissions.Count; i++) if (_spawnedMissions[i] != null) Destroy(_spawnedMissions[i]);
            _spawnedMissions.Clear();

            // 1. Populate Pattern Tabs
            var allPatterns = SaveManager.Instance.GetAllPatterns();
            if (string.IsNullOrEmpty(_selectedPattern) && allPatterns.Count > 0)
            {
                _selectedPattern = allPatterns[0];
            }

            if (patternTabsContainer != null && patternTabButtonPrefab != null)
            {
                foreach (string pat in allPatterns)
                {
                    GameObject tab = Instantiate(patternTabButtonPrefab, patternTabsContainer);
                    _spawnedTabs.Add(tab);

                    var text = tab.GetComponentInChildren<Text>();
                    if (text != null) text.text = pat;

                    var btn = tab.GetComponent<Button>();
                    string capturedPat = pat;
                    if (btn != null)
                    {
                        btn.onClick.AddListener(() => SelectPattern(capturedPat));
                        // Highlight selected
                        var img = tab.GetComponent<Image>();
                        if (img != null)
                        {
                            img.color = (capturedPat == _selectedPattern) ? new Color(0.2f, 0.6f, 1f, 1f) : new Color(0.15f, 0.15f, 0.2f, 0.8f);
                        }
                    }
                }
            }

            // 2. Populate Missions for Selected Pattern
            var missions = SaveManager.Instance.GetMissionsForPattern(_selectedPattern);
            if (missionsGridContainer != null && missionItemPrefab != null)
            {
                foreach (var mission in missions)
                {
                    GameObject card = Instantiate(missionItemPrefab, missionsGridContainer);
                    _spawnedMissions.Add(card);

                    // Setup mission UI
                    var missionText = card.GetComponentInChildren<Text>();
                    if (missionText != null)
                    {
                        string statusPrefix = mission.isLocked ? "🔒 " : (mission.isCompleted ? "★ " : "");
                        missionText.text = $"{statusPrefix}Mission {mission.missionNumber}";
                    }

                    var btn = card.GetComponent<Button>();
                    if (btn != null)
                    {
                        btn.interactable = !mission.isLocked;
                        var capturedMission = mission;
                        btn.onClick.AddListener(() => OnMissionClicked(capturedMission));
                    }
                }
            }
        }

        private void OnMissionClicked(LevelData mission)
        {
            if (mission.isLocked) return;

            SaveManager.Instance.SetLastPlayedMission(mission.patternName, mission.missionNumber);
            GameStateManager.Instance.LoadAndPlayLevel(mission);
        }
    }
}
