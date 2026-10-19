namespace ArrowUntangle.Level
{
    public enum DifficultyTier
    {
        Tutorial = 0,
        Easy = 1,
        Medium = 2,
        Hard = 3,
        Expert = 4
    }

    [System.Serializable]
    public class TierConfig
    {
        public DifficultyTier tier;
        public int gridWidth;
        public int gridHeight;
        public int minArrows;
        public int maxArrows;
        public int minPathLength;
        public int maxPathLength;
        public int maxBendsPerArrow;

        public static TierConfig GetDefault(DifficultyTier tier)
        {
            switch (tier)
            {
                case DifficultyTier.Tutorial:
                    return new TierConfig
                    {
                        tier = DifficultyTier.Tutorial,
                        gridWidth = 5,
                        gridHeight = 5,
                        minArrows = 3,
                        maxArrows = 4,
                        minPathLength = 2,
                        maxPathLength = 3,
                        maxBendsPerArrow = 0
                    };
                case DifficultyTier.Easy:
                    return new TierConfig
                    {
                        tier = DifficultyTier.Easy,
                        gridWidth = 6,
                        gridHeight = 6,
                        minArrows = 5,
                        maxArrows = 7,
                        minPathLength = 2,
                        maxPathLength = 4,
                        maxBendsPerArrow = 1
                    };
                case DifficultyTier.Medium:
                    return new TierConfig
                    {
                        tier = DifficultyTier.Medium,
                        gridWidth = 7,
                        gridHeight = 7,
                        minArrows = 8,
                        maxArrows = 11,
                        minPathLength = 3,
                        maxPathLength = 5,
                        maxBendsPerArrow = 1
                    };
                case DifficultyTier.Hard:
                    return new TierConfig
                    {
                        tier = DifficultyTier.Hard,
                        gridWidth = 8,
                        gridHeight = 8,
                        minArrows = 12,
                        maxArrows = 16,
                        minPathLength = 3,
                        maxPathLength = 6,
                        maxBendsPerArrow = 2
                    };
                case DifficultyTier.Expert:
                default:
                    return new TierConfig
                    {
                        tier = DifficultyTier.Expert,
                        gridWidth = 9,
                        gridHeight = 9,
                        minArrows = 17,
                        maxArrows = 22,
                        minPathLength = 4,
                        maxPathLength = 7,
                        maxBendsPerArrow = 2
                    };
            }
        }
    }
}
