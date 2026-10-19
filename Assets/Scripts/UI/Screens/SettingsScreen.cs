using UnityEngine;
using UnityEngine.UI;
using ArrowUntangle.Core;
using ArrowUntangle.Settings;

namespace ArrowUntangle.UI
{
    public class SettingsScreen : BaseScreen
    {
        [Header("Navigation")]
        [SerializeField] private Button backButton;

        [Header("Toggles")]
        [SerializeField] private Toggle soundToggle;
        [SerializeField] private Toggle musicToggle;
        [SerializeField] private Toggle hapticsToggle;
        [SerializeField] private Toggle gridToggle;
        [SerializeField] private Toggle notificationsToggle;

        [Header("Buttons")]
        [SerializeField] private Button restorePurchasesButton;
        [SerializeField] private Button privacyPolicyButton;
        [SerializeField] private Button termsOfServiceButton;
        [SerializeField] private Button creditsButton;

        [Header("Credits/Toast Modal")]
        [SerializeField] private GameObject toastModalPanel;
        [SerializeField] private Text toastModalText;
        [SerializeField] private Button toastModalCloseButton;

        protected override void Awake()
        {
            base.Awake();

            if (backButton != null) backButton.onClick.AddListener(HandleBackClicked);

            // Toggles
            if (soundToggle != null) soundToggle.onValueChanged.AddListener(val => SettingsManager.Instance.SoundEnabled = val);
            if (musicToggle != null) musicToggle.onValueChanged.AddListener(val => SettingsManager.Instance.MusicEnabled = val);
            if (hapticsToggle != null) hapticsToggle.onValueChanged.AddListener(val => SettingsManager.Instance.HapticsEnabled = val);
            if (gridToggle != null) gridToggle.onValueChanged.AddListener(val => SettingsManager.Instance.GridEnabled = val);
            if (notificationsToggle != null) notificationsToggle.onValueChanged.AddListener(val => SettingsManager.Instance.NotificationsEnabled = val);

            // Buttons
            if (restorePurchasesButton != null) restorePurchasesButton.onClick.AddListener(HandleRestorePurchasesClicked);
            if (privacyPolicyButton != null) privacyPolicyButton.onClick.AddListener(HandlePrivacyPolicyClicked);
            if (termsOfServiceButton != null) termsOfServiceButton.onClick.AddListener(HandleTermsClicked);
            if (creditsButton != null) creditsButton.onClick.AddListener(HandleCreditsClicked);

            if (toastModalCloseButton != null)
            {
                toastModalCloseButton.onClick.AddListener(() =>
                {
                    if (toastModalPanel != null) toastModalPanel.SetActive(false);
                });
            }
        }

        private void Start()
        {
            if (SettingsManager.Instance != null)
            {
                SettingsManager.Instance.OnToastMessage += ShowToast;
            }
        }

        private void OnDestroy()
        {
            if (SettingsManager.Instance != null)
            {
                SettingsManager.Instance.OnToastMessage -= ShowToast;
            }
        }

        protected override void OnShown()
        {
            base.OnShown();
            SyncTogglesWithSettings();
        }

        private void SyncTogglesWithSettings()
        {
            if (SettingsManager.Instance == null) return;

            if (soundToggle != null) soundToggle.isOn = SettingsManager.Instance.SoundEnabled;
            if (musicToggle != null) musicToggle.isOn = SettingsManager.Instance.MusicEnabled;
            if (hapticsToggle != null) hapticsToggle.isOn = SettingsManager.Instance.HapticsEnabled;
            if (gridToggle != null) gridToggle.isOn = SettingsManager.Instance.GridEnabled;
            if (notificationsToggle != null) notificationsToggle.isOn = SettingsManager.Instance.NotificationsEnabled;
        }

        private void HandleBackClicked()
        {
            GameStateManager.Instance.ReturnToSettingsPreviousState();
        }

        private void HandleRestorePurchasesClicked()
        {
            SettingsManager.Instance.RestorePurchases();
        }

        private void HandlePrivacyPolicyClicked()
        {
            SettingsManager.Instance.OpenPrivacyPolicy();
        }

        private void HandleTermsClicked()
        {
            SettingsManager.Instance.OpenTermsOfService();
        }

        private void HandleCreditsClicked()
        {
            SettingsManager.Instance.OpenCredits();
        }

        public void ShowToast(string message)
        {
            if (toastModalPanel != null && toastModalText != null)
            {
                toastModalText.text = message;
                toastModalPanel.SetActive(true);
            }
        }
    }
}
