using System.Collections;
using UnityEngine;

namespace ArrowUntangle.UI
{
    [RequireComponent(typeof(CanvasGroup))]
    public abstract class BaseScreen : MonoBehaviour
    {
        [SerializeField] private bool hideOnAwake = true;
        [SerializeField] private float fadeDuration = 0.2f;

        private CanvasGroup _canvasGroup;
        protected CanvasGroup CanvasGroup
        {
            get
            {
                if (_canvasGroup == null) _canvasGroup = GetComponent<CanvasGroup>();
                return _canvasGroup;
            }
        }

        protected virtual void Awake()
        {
            if (_canvasGroup == null) _canvasGroup = GetComponent<CanvasGroup>();
            if (hideOnAwake)
            {
                HideImmediate();
            }
        }

        public virtual void Show(bool animate = true)
        {
            gameObject.SetActive(true);
            StopAllCoroutines();
            if (animate && Application.isPlaying && fadeDuration > 0f)
            {
                StartCoroutine(FadeRoutine(1f));
            }
            else
            {
                SetCanvasGroupState(1f, true, true);
            }
            OnShown();
        }

        public virtual void Hide(bool animate = true)
        {
            StopAllCoroutines();
            if (animate && Application.isPlaying && fadeDuration > 0f && gameObject.activeInHierarchy)
            {
                StartCoroutine(FadeRoutine(0f, () =>
                {
                    SetCanvasGroupState(0f, false, false);
                    gameObject.SetActive(false);
                }));
            }
            else
            {
                HideImmediate();
            }
            OnHidden();
        }

        public void HideImmediate()
        {
            SetCanvasGroupState(0f, false, false);
            gameObject.SetActive(false);
        }

        private void SetCanvasGroupState(float alpha, bool interactable, bool blocksRaycasts)
        {
            CanvasGroup.alpha = alpha;
            CanvasGroup.interactable = interactable;
            CanvasGroup.blocksRaycasts = blocksRaycasts;
        }

        private IEnumerator FadeRoutine(float targetAlpha, System.Action onComplete = null)
        {
            float startAlpha = CanvasGroup.alpha;
            float elapsed = 0f;

            CanvasGroup.interactable = targetAlpha > 0.5f;
            CanvasGroup.blocksRaycasts = targetAlpha > 0.5f;

            while (elapsed < fadeDuration)
            {
                elapsed += Time.unscaledDeltaTime;
                CanvasGroup.alpha = Mathf.Lerp(startAlpha, targetAlpha, elapsed / fadeDuration);
                yield return null;
            }

            CanvasGroup.alpha = targetAlpha;
            onComplete?.Invoke();
        }

        protected virtual void OnShown() { }
        protected virtual void OnHidden() { }
    }
}
