using System;
using System.Collections.Generic;
using UnityEngine;
using Newtonsoft.Json;

namespace ArrowUntangle.Level
{
    [Serializable]
    public class LevelData
    {
        [JsonProperty("levelId")]
        public int levelId;

        [JsonProperty("missionName")]
        public string missionName = "Mission";

        [JsonProperty("difficulty")]
        public DifficultyTier difficulty = DifficultyTier.Easy;

        [JsonProperty("gridWidth")]
        public int gridWidth = 6;

        [JsonProperty("gridHeight")]
        public int gridHeight = 6;

        [JsonProperty("arrows")]
        public List<ArrowData> arrows = new List<ArrowData>();

        [JsonProperty("solutionSequence")]
        public List<int> solutionSequence = new List<int>();

        [JsonProperty("isHandAuthored")]
        public bool isHandAuthored = false;

        [JsonProperty("patternThemeId")]
        public string patternThemeId = "classic";

        [JsonProperty("patternName")]
        public string patternName = "Classic";

        [JsonProperty("missionNumber")]
        public int missionNumber = 1;

        [JsonProperty("isCompleted")]
        public bool isCompleted = false;

        [JsonProperty("isLocked")]
        public bool isLocked = false;

        [JsonProperty("bestScore")]
        public int bestScore = 0;

        /// <summary>
        /// Serializes this level to a JSON string using Newtonsoft.Json.
        /// Preserves nested ArrowData waypoints and solutionSequence reliably.
        /// </summary>
        public string ToJson(bool prettyPrint = false)
        {
            var formatting = prettyPrint ? Formatting.Indented : Formatting.None;
            return JsonConvert.SerializeObject(this, formatting);
        }

        /// <summary>
        /// Deserializes a LevelData instance from a JSON string.
        /// </summary>
        public static LevelData FromJson(string json)
        {
            if (string.IsNullOrEmpty(json)) return null;
            return JsonConvert.DeserializeObject<LevelData>(json);
        }

        public LevelData Clone()
        {
            string serialized = ToJson(false);
            return FromJson(serialized);
        }
    }
}
