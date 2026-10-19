using NUnit.Framework;
using UnityEngine;
using ArrowUntangle.Core;
using ArrowUntangle.Data;
using ArrowUntangle.Settings;
using ArrowUntangle.UI;

namespace ArrowUntangle.Tests
{
    [TestFixture]
    public class UIStateManagerTests
    {
        private GameObject _holderObject;
        private GameStateManager _stateManager;

        [SetUp]
        public void Setup()
        {
            _holderObject = new GameObject("Test_GameStateHolder");
            _stateManager = _holderObject.AddComponent<GameStateManager>();
        }

        [TearDown]
        public void Teardown()
        {
            if (_holderObject != null)
            {
                Object.DestroyImmediate(_holderObject);
            }
        }

        [Test]
        public void GameStateManager_InitialState_TransitionsCorrectly()
        {
            _stateManager.TransitionTo(GameState.MainMenu);
            Assert.AreEqual(GameState.MainMenu, _stateManager.CurrentState);

            _stateManager.TransitionTo(GameState.LevelSelect);
            Assert.AreEqual(GameState.LevelSelect, _stateManager.CurrentState);
            Assert.AreEqual(GameState.MainMenu, _stateManager.PreviousState);
        }

        [Test]
        public void GameStateManager_IsInputAllowed_OnlyTrueWhenPlaying()
        {
            _stateManager.TransitionTo(GameState.MainMenu);
            Assert.IsFalse(_stateManager.IsInputAllowed, "Input must be blocked in MainMenu.");

            _stateManager.TransitionTo(GameState.Loading);
            Assert.IsFalse(_stateManager.IsInputAllowed, "Input must be blocked in Loading.");

            _stateManager.TransitionTo(GameState.Playing);
            Assert.IsTrue(_stateManager.IsInputAllowed, "Input must be allowed only while Playing.");

            _stateManager.TransitionTo(GameState.Paused);
            Assert.IsFalse(_stateManager.IsInputAllowed, "Input must be blocked in Paused.");

            _stateManager.TransitionTo(GameState.Victory);
            Assert.IsFalse(_stateManager.IsInputAllowed, "Input must be blocked in Victory.");

            _stateManager.TransitionTo(GameState.Failure);
            Assert.IsFalse(_stateManager.IsInputAllowed, "Input must be blocked in Failure.");

            _stateManager.TransitionTo(GameState.Settings);
            Assert.IsFalse(_stateManager.IsInputAllowed, "Input must be blocked in Settings.");
        }

        [Test]
        public void GameStateManager_SettingsPreviousState_RestoresCorrectly()
        {
            // Opened from Main Menu
            _stateManager.TransitionTo(GameState.MainMenu);
            _stateManager.TransitionTo(GameState.Settings);
            _stateManager.ReturnToSettingsPreviousState();
            Assert.AreEqual(GameState.MainMenu, _stateManager.CurrentState);

            // Opened from Paused
            _stateManager.TransitionTo(GameState.Playing);
            _stateManager.TransitionTo(GameState.Paused);
            _stateManager.TransitionTo(GameState.Settings);
            _stateManager.ReturnToSettingsPreviousState();
            Assert.AreEqual(GameState.Paused, _stateManager.CurrentState);
        }

        [Test]
        public void SaveManager_ProvidesPatternCatalog_AndTracksMissionUnlocks()
        {
            var saveGo = new GameObject("Test_SaveManager");
            var save = saveGo.AddComponent<SaveManager>();

            var patterns = save.GetAllPatterns();
            Assert.IsNotEmpty(patterns, "SaveManager must seed patterns.");
            Assert.IsTrue(patterns.Contains("Classic"), "Classic pattern must exist.");

            var missions = save.GetMissionsForPattern("Classic");
            Assert.GreaterOrEqual(missions.Count, 3, "Classic pattern must have missions.");

            // Mission 1 should be unlocked
            Assert.IsFalse(save.IsMissionLocked("Classic", 1), "Mission 1 must be unlocked.");

            // Complete mission 1 with score 3
            save.RecordMissionSuccess("Classic", 1, 3);
            Assert.IsTrue(save.IsMissionCompleted("Classic", 1), "Mission 1 should be marked completed.");
            Assert.AreEqual(3, save.GetBestScore("Classic", 1), "Score should be saved.");

            // Next mission should now be unlocked
            Assert.IsFalse(save.IsMissionLocked("Classic", 2), "Mission 2 should unlock upon mission 1 completion.");

            Object.DestroyImmediate(saveGo);
        }

        [Test]
        public void SettingsManager_PersistsToggles()
        {
            var settingsGo = new GameObject("Test_SettingsManager");
            var settings = settingsGo.AddComponent<SettingsManager>();

            settings.SoundEnabled = false;
            Assert.IsFalse(settings.SoundEnabled);
            settings.SoundEnabled = true;
            Assert.IsTrue(settings.SoundEnabled);

            settings.GridEnabled = false;
            Assert.IsFalse(settings.GridEnabled);
            settings.GridEnabled = true;
            Assert.IsTrue(settings.GridEnabled);

            Object.DestroyImmediate(settingsGo);
        }

        [Test]
        public void SafeAreaFitter_AppliesNormalizedBoundsWithoutError()
        {
            var root = new GameObject("Test_CanvasRoot", typeof(RectTransform));
            var fitter = root.AddComponent<SafeAreaFitter>();

            Assert.DoesNotThrow(() => fitter.ApplySafeArea());

            var rt = root.GetComponent<RectTransform>();
            Assert.GreaterOrEqual(rt.anchorMin.x, 0f);
            Assert.LessOrEqual(rt.anchorMax.x, 1f);
            Assert.GreaterOrEqual(rt.anchorMin.y, 0f);
            Assert.LessOrEqual(rt.anchorMax.y, 1f);

            Object.DestroyImmediate(root);
        }
    }
}
