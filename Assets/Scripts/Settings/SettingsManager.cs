using System;
using UnityEngine;

namespace ArrowUntangle.Settings
{
    public class SettingsManager : MonoBehaviour
    {
        public static SettingsManager Instance { get; private set; }

        private const string KeySound = "ArrowUntangle_Sound";
        private const string KeyMusic = "ArrowUntangle_Music";
        private const string KeyHaptics = "ArrowUntangle_Haptics";
        private const string KeyGrid = "ArrowUntangle_Grid";
        private const string KeyNotifications = "ArrowUntangle_Notifications";

        public bool SoundEnabled
        {
            get => PlayerPrefs.GetInt(KeySound, 1) == 1;
            set
            {
                PlayerPrefs.SetInt(KeySound, value ? 1 : 0);
                PlayerPrefs.Save();
                OnSoundChanged?.Invoke(value);
            }
        }

        public bool MusicEnabled
        {
            get => PlayerPrefs.GetInt(KeyMusic, 1) == 1;
            set
            {
                PlayerPrefs.SetInt(KeyMusic, value ? 1 : 0);
                PlayerPrefs.Save();
                OnMusicChanged?.Invoke(value);
            }
        }

        public bool HapticsEnabled
        {
            get => PlayerPrefs.GetInt(KeyHaptics, 1) == 1;
            set
            {
                PlayerPrefs.SetInt(KeyHaptics, value ? 1 : 0);
                PlayerPrefs.Save();
                OnHapticsChanged?.Invoke(value);
            }
        }

        public bool GridEnabled
        {
            get => PlayerPrefs.GetInt(KeyGrid, 1) == 1;
            set
            {
                PlayerPrefs.SetInt(KeyGrid, value ? 1 : 0);
                PlayerPrefs.Save();
                OnGridChanged?.Invoke(value);
            }
        }

        public bool NotificationsEnabled
        {
            get => PlayerPrefs.GetInt(KeyNotifications, 1) == 1;
            set
            {
                PlayerPrefs.SetInt(KeyNotifications, value ? 1 : 0);
                PlayerPrefs.Save();
                OnNotificationsChanged?.Invoke(value);
            }
        }

        public event Action<bool> OnSoundChanged;
        public event Action<bool> OnMusicChanged;
        public event Action<bool> OnHapticsChanged;
        public event Action<bool> OnGridChanged;
        public event Action<bool> OnNotificationsChanged;
        public event Action<string> OnToastMessage;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }

        public void RestorePurchases()
        {
            // ASSUMPTION: Restore purchases is a no-op placeholder until Phase 5 IAP
            Debug.Log("[SettingsManager] Restore Purchases requested (Phase 5 IAP scope).");
            OnToastMessage?.Invoke("Purchases restored (Mock).");
        }

        public void OpenPrivacyPolicy()
        {
            string url = "https://example.com/arrow-untangle/privacy-policy";
            Debug.Log($"[SettingsManager] Opening Privacy Policy: {url}");
            Application.OpenURL(url);
        }

        public void OpenTermsOfService()
        {
            string url = "https://example.com/arrow-untangle/terms";
            Debug.Log($"[SettingsManager] Opening Terms of Service: {url}");
            Application.OpenURL(url);
        }

        public void OpenCredits()
        {
            OnToastMessage?.Invoke("Arrow Untangle\nEngineered with Unity 6 & DeepMind");
        }
    }
}
