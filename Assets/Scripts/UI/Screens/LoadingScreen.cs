using UnityEngine;
using UnityEngine.UI;

namespace ArrowUntangle.UI
{
    public class LoadingScreen : BaseScreen
    {
        [SerializeField] private RectTransform spinnerTransform;
        [SerializeField] private float rotationSpeed = 360f;
        [SerializeField] private Text loadingText;

        private void Update()
        {
            if (spinnerTransform != null)
            {
                spinnerTransform.Rotate(0f, 0f, -rotationSpeed * Time.unscaledDeltaTime);
            }
        }

        protected override void OnShown()
        {
            base.OnShown();
            if (loadingText != null)
            {
                loadingText.text = "Loading Puzzle...";
            }
        }
    }
}
