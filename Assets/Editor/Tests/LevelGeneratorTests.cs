using NUnit.Framework;
using UnityEngine;
using ArrowUntangle.Level;

namespace ArrowUntangle.Tests
{
    [TestFixture]
    public class LevelGeneratorTests
    {
        [Test]
        [TestCase(DifficultyTier.Tutorial, 20)]
        [TestCase(DifficultyTier.Easy, 20)]
        [TestCase(DifficultyTier.Medium, 20)]
        [TestCase(DifficultyTier.Hard, 20)]
        [TestCase(DifficultyTier.Expert, 20)]
        public void Generator_GeneratesValidSolvableLevels_AcrossAllTiers(DifficultyTier tier, int count)
        {
            for (int i = 0; i < count; i++)
            {
                int levelSeed = (int)tier * 1000 + i;
                LevelData level = LevelGenerator.GenerateLevel(i + 1, tier, levelSeed);

                Assert.IsNotNull(level, $"Level {i + 1} for tier {tier} must not be null.");
                Assert.GreaterOrEqual(level.arrows.Count, 2, $"Level must have at least 2 arrows.");

                ValidationResult result = LevelValidator.Validate(level);
                Assert.IsTrue(result.isValid, $"Level {i + 1} (Tier {tier}, Seed {levelSeed}) failed validation: {result.errorMessage}");
                Assert.AreEqual(level.arrows.Count, result.resolvedSequence.Count, $"Resolved sequence length must equal arrow count for Level {i + 1}.");
            }
        }

        [Test]
        public void Generator_Produces100ConsecutiveLevels_AllPassValidation()
        {
            // Exit criteria test: Generator produces and validates 100+ levels with all tests green
            for (int id = 1; id <= 100; id++)
            {
                DifficultyTier tier = (DifficultyTier)((id / 20) % 5);
                LevelData level = LevelGenerator.GenerateLevel(id, tier, 42000 + id);

                Assert.IsNotNull(level);
                ValidationResult validation = LevelValidator.Validate(level);
                Assert.IsTrue(validation.isValid, $"Level {id} failed validation: {validation.errorMessage}");
            }
        }
    }
}
