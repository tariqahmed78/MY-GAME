using System.Collections.Generic;
using ArrowUntangle.Level;

namespace ArrowUntangle.Data
{
    public interface ISaveManager
    {
        bool HasInProgressMission();
        string GetLastPlayedPattern();
        int GetLastPlayedMission();
        void SetLastPlayedMission(string patternName, int missionNumber);

        bool IsMissionCompleted(string patternName, int missionNumber);
        bool IsMissionLocked(string patternName, int missionNumber);
        int GetBestScore(string patternName, int missionNumber);

        void RecordMissionSuccess(string patternName, int missionNumber, int score);
        IReadOnlyList<string> GetAllPatterns();
        IReadOnlyList<LevelData> GetMissionsForPattern(string patternName);
    }
}
