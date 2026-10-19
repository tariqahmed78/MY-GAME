using System;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using ArrowUntangle.Grid;
using ArrowUntangle.Gameplay;
using ArrowUntangle.Rendering;

namespace ArrowUntangle.Level
{
    public class LevelLoader : MonoBehaviour
    {
        [Header("Scene References")]
        [SerializeField] private GridSystem gridSystem;
        [SerializeField] private GameManager gameManager;
        [SerializeField] private Camera mainCamera;

        [Header("Arrow Prefab / Components")]
        [SerializeField] private GameObject arrowPrefab;

        private LevelData _currentLevel;
        private readonly List<ArrowEntity> _instantiatedEntities = new List<ArrowEntity>();

        public LevelData CurrentLevel => _currentLevel;
        public IReadOnlyList<ArrowEntity> InstantiatedEntities => _instantiatedEntities;

        public event Action<LevelData> OnLevelLoaded;

        private void Awake()
        {
            if (gridSystem == null) gridSystem = FindObjectOfType<GridSystem>();
            if (gameManager == null) gameManager = FindObjectOfType<GameManager>();
            if (mainCamera == null) mainCamera = Camera.main;
        }

        /// <summary>
        /// Loads a level from a JSON string.
        /// Supports both procedurally generated levels and hand-authored puzzles matching reference images.
        /// </summary>
        public bool LoadFromJson(string json)
        {
            if (string.IsNullOrEmpty(json))
            {
                Debug.LogError("[LevelLoader] Cannot load level: JSON string is empty.");
                return false;
            }

            LevelData data = LevelData.FromJson(json);
            if (data == null)
            {
                Debug.LogError("[LevelLoader] Failed to deserialize LevelData from JSON.");
                return false;
            }

            return LoadLevel(data);
        }

        /// <summary>
        /// Loads a level from a TextAsset resource.
        /// </summary>
        public bool LoadFromTextAsset(TextAsset textAsset)
        {
            if (textAsset == null)
            {
                Debug.LogError("[LevelLoader] TextAsset is null.");
                return false;
            }

            return LoadFromJson(textAsset.text);
        }

        /// <summary>
        /// Loads a level from a file path in Application.persistentDataPath or StreamingAssets.
        /// </summary>
        public bool LoadFromFile(string filePath)
        {
            if (!File.Exists(filePath))
            {
                Debug.LogError($"[LevelLoader] File does not exist at path: {filePath}");
                return false;
            }

            string json = File.ReadAllText(filePath);
            return LoadFromJson(json);
        }

        /// <summary>
        /// Instantiates and binds a LevelData to the GridSystem, Camera, and GameManager.
        /// </summary>
        public bool LoadLevel(LevelData level)
        {
            if (level == null) return false;

            // Validate level before initializing
            var validation = LevelValidator.Validate(level);
            if (!validation.isValid)
            {
                Debug.LogWarning($"[LevelLoader] Loading unvalidated or invalid level {level.levelId}: {validation.errorMessage}");
            }

            _currentLevel = level;

            // Clean up old entities
            ClearActiveLevel();

            // Initialize Grid
            gridSystem.Initialize(level.gridWidth, level.gridHeight, 1.0f);

            // Auto-frame Orthographic Camera
            if (mainCamera != null)
            {
                mainCamera.orthographic = true;
                mainCamera.transform.position = new Vector3(0, 0, -10f);
                float halfHeight = (level.gridHeight * gridSystem.CellSize * 0.5f) + 1.8f;
                mainCamera.orthographicSize = halfHeight;
            }

            // Register all arrows in the logical grid
            for (int i = 0; i < level.arrows.Count; i++)
            {
                gridSystem.RegisterArrow(level.arrows[i]);
            }

            // Spawn Arrow Entities
            for (int i = 0; i < level.arrows.Count; i++)
            {
                ArrowData data = level.arrows[i];
                ArrowEntity entity = SpawnArrowEntity(data);
                _instantiatedEntities.Add(entity);
            }

            // Register with GameManager to start gameplay loop
            if (gameManager != null)
            {
                gameManager.RegisterEntities(_instantiatedEntities);
            }

            OnLevelLoaded?.Invoke(_currentLevel);
            return true;
        }

        private ArrowEntity SpawnArrowEntity(ArrowData data)
        {
            GameObject go;
            if (arrowPrefab != null)
            {
                go = Instantiate(arrowPrefab, transform);
            }
            else
            {
                go = new GameObject($"Arrow_{data.id}");
                go.transform.SetParent(transform);
                go.AddComponent<ArrowMeshRenderer2D>();
                go.AddComponent<CircleCollider2D>();
                go.AddComponent<ArrowEntity>();
            }

            go.transform.localPosition = Vector3.zero;
            var entity = go.GetComponent<ArrowEntity>();
            entity.Setup(data, gridSystem);

            return entity;
        }

        public void ClearActiveLevel()
        {
            for (int i = 0; i < _instantiatedEntities.Count; i++)
            {
                if (_instantiatedEntities[i] != null)
                {
                    Destroy(_instantiatedEntities[i].gameObject);
                }
            }
            _instantiatedEntities.Clear();

            if (gridSystem != null)
            {
                gridSystem.Clear();
            }
        }
    }
}
