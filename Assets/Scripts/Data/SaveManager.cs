using System.Collections.Generic;
using UnityEngine;
using ArrowUntangle.Level;

namespace ArrowUntangle.Data
{
    // ASSUMPTION: SaveManager stub returns in-memory data only until Phase 5.
    public class SaveManager : MonoBehaviour, ISaveManager
    {
        public static SaveManager Instance { get; private set; }

        private readonly Dictionary<string, List<LevelData>> _patternMissions = new Dictionary<string, List<LevelData>>();
        private string _lastPlayedPattern = "Classic";
        private int _lastPlayedMission = 1;
        private bool _hasInProgress = false;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);

            InitializeInMemoryCatalog();
        }

        private void InitializeInMemoryCatalog()
        {
            // Seed 4 initial patterns: Classic, Geometric, Labyrinth, Master
            string[] patterns = new string[] { "Classic", "Geometric", "Labyrinth", "Master" };
            DifficultyTier[] tiers = new DifficultyTier[]
            {
                DifficultyTier.Tutorial,
                DifficultyTier.Easy,
                DifficultyTier.Medium,
                DifficultyTier.Hard
            };

            for (int p = 0; p < patterns.Length; p++)
            {
                string pat = patterns[p];
                DifficultyTier tier = tiers[p];
                var list = new List<LevelData>();

                for (int m = 1; m <= 6; m++)
                {
                    int id = p * 100 + m;
                    var lvl = LevelGenerator.GenerateLevel(id, tier, 50000 + id);
                    lvl.patternName = pat;
                    lvl.missionNumber = m;
                    lvl.missionName = $"{pat} #{m}";
                    
                    // Mission 1 of any pattern is unlocked; later missions unlock upon completing earlier ones
                    lvl.isCompleted = (m == 1 && p == 0); // Mission 1 of Classic is completed initially for demo
                    lvl.isLocked = (m > 2 && p > 0);
                    lvl.bestScore = (m == 1 && p == 0) ? 3 : 0;

                    list.Add(lvl);
                }

                _patternMissions[pat] = list;
            }

            _hasInProgress = true;
            _lastPlayedPattern = "Classic";
            _lastPlayedMission = 2;
        }

        public bool HasInProgressMission() => _hasInProgress;
        public string GetLastPlayedPattern() => _lastPlayedPattern;
        public int GetLastPlayedMission() => _lastPlayedMission;

        public void SetLastPlayedMission(string patternName, int missionNumber)
        {
            _lastPlayedPattern = patternName;
            _lastPlayedMission = missionNumber;
            _hasInProgress = true;
        }

        public bool IsMissionCompleted(string patternName, int missionNumber)
        {
            var level = FindMission(patternName, missionNumber);
            return level != null && level.isCompleted;
        }

        public bool IsMissionLocked(string patternName, int missionNumber)
        {
            var level = FindMission(patternName, missionNumber);
            return level == null || level.isLocked;
        }

        public int GetBestScore(string patternName, int missionNumber)
        {
            var level = FindMission(patternName, missionNumber);
            return level != null ? level.bestScore : 0;
        }

        public void RecordMissionSuccess(string patternName, int missionNumber, int score)
        {
            var level = FindMission(patternName, missionNumber);
            if (level != null)
            {
                level.isCompleted = true;
                level.bestScore = Mathf.Max(level.bestScore, score);

                // Unlock next mission in pattern
                var nextLevel = FindMission(patternName, missionNumber + 1);
                if (nextLevel != null)
                {
                    nextLevel.isLocked = false;
                }
            }
        }

        public IReadOnlyList<string> GetAllPatterns()
        {
            return new List<string>(_patternMissions.Keys);
        }

        public IReadOnlyList<LevelData> GetMissionsForPattern(string patternName)
        {
            if (_patternMissions.TryGetValue(patternName, out var list))
            {
                return list;
            }
            return new List<LevelData>();
        }

        public LevelData FindMission(string patternName, int missionNumber)
        {
            if (_patternMissions.TryGetValue(patternName, out var list))
            {
                return list.Find(l => l.missionNumber == missionNumber);
            }
            return null;
        }
    }
}
