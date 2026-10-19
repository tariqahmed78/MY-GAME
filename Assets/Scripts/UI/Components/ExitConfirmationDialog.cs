using System;
using UnityEngine;
using UnityEngine.UI;

namespace ArrowUntangle.UI
{
    public class ExitConfirmationDialog : MonoBehaviour
    {
        [SerializeField] private CanvasGroup dialogCanvasGroup;
        [SerializeField] private Button yesButton;
        [SerializeField] private Button noButton;

        public event Action OnDismissed;

        private void Awake()
        {
            if (dialogCanvasGroup == null) dialogCanvasGroup = GetComponent<CanvasGroup>();

            if (yesButton != null)
            {
                yesButton.onClick.AddListener(HandleYesClicked);
            }

            if (noButton != null)
            {
                noButton.onClick.AddListener(HandleNoClicked);
            }

            Hide();
        }

        public void Show()
        {
            gameObject.SetActive(true);
            if (dialogCanvasGroup != null)
            {
                dialogCanvasGroup.alpha = 1f;
                dialogCanvasGroup.interactable = true;
                dialogCanvasGroup.blocksRaycasts = true;
            }
        }

        public void Hide()
        {
            if (dialogCanvasGroup != null)
            {
                dialogCanvasGroup.alpha = 0f;
                dialogCanvasGroup.interactable = false;
                dialogCanvasGroup.blocksRaycasts = false;
            }
            gameObject.SetActive(false);
            OnDismissed?.Invoke();
        }

        private void HandleYesClicked()
        {
            Debug.Log("[ExitConfirmationDialog] Quitting application.");
#if UNITY_EDITOR
            UnityEditor.EditorApplication.isPlaying = false;
#else
            Application.Quit();
#endif
        }

        private void HandleNoClicked()
        {
            Hide();
        }
    }
}
