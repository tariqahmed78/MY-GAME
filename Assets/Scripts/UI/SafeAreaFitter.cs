using UnityEngine;

namespace ArrowUntangle.UI
{
    /// <summary>
    /// Section 9: Universal Safe Area & Display Cutout Fitter.
    /// Applied globally to screen root canvases or HUD panels to ensure UI elements
    /// do not clip behind camera notches, hole-punches, or Android gesture navigation pills.
    /// </summary>
    [RequireComponent(typeof(RectTransform))]
    [ExecuteAlways]
    public class SafeAreaFitter : MonoBehaviour
    {
        [Header("Sides to Constrain")]
        [SerializeField] private bool applyLeft = true;
        [SerializeField] private bool applyRight = true;
        [SerializeField] private bool applyTop = true;
        [SerializeField] private bool applyBottom = true;

        [Header("Android Gesture Navigation Clearance")]
        [Tooltip("Additional padding in pixels applied when Android gesture navigation is detected.")]
        [SerializeField] private float gestureNavBottomPadding = 16f;

        private RectTransform _rectTransform;
        private Rect _lastSafeArea = Rect.zero;
        private Vector2Int _lastScreenSize = Vector2Int.zero;
        private ScreenOrientation _lastOrientation = ScreenOrientation.AutoRotation;

        private void Awake()
        {
            _rectTransform = GetComponent<RectTransform>();
            ApplySafeArea();
        }

        private void Update()
        {
            if (Screen.width != _lastScreenSize.x ||
                Screen.height != _lastScreenSize.y ||
                Screen.safeArea != _lastSafeArea ||
                Screen.orientation != _lastOrientation)
            {
                ApplySafeArea();
            }
        }

        public void ApplySafeArea()
        {
            if (_rectTransform == null) _rectTransform = GetComponent<RectTransform>();
            if (_rectTransform == null) return;

            Rect safeArea = Screen.safeArea;
            int screenWidth = Screen.width;
            int screenHeight = Screen.height;

            if (screenWidth <= 0 || screenHeight <= 0) return;

            _lastSafeArea = safeArea;
            _lastScreenSize = new Vector2Int(screenWidth, screenHeight);
            _lastOrientation = Screen.orientation;

            // Step 1: Incorporate Display Cutouts if any are defined beyond safeArea
            Rect[] cutouts = Screen.cutouts;
            float topCutoutY = 0f;
            float bottomCutoutY = 0f;

            if (cutouts != null && cutouts.Length > 0)
            {
                for (int i = 0; i < cutouts.Length; i++)
                {
                    Rect c = cutouts[i];
                    // If cutout is along the top boundary
                    if (c.yMax >= screenHeight - 10)
                    {
                        topCutoutY = Mathf.Max(topCutoutY, screenHeight - c.yMin);
                    }
                    // If cutout is along the bottom boundary
                    if (c.yMin <= 10)
                    {
                        bottomCutoutY = Mathf.Max(bottomCutoutY, c.yMax);
                    }
                }
            }

            // Step 2: Detect Gesture Navigation vs 3-Button Navigation on Android
            // In 3-button navigation, safeArea.yMin is typically >= 48dp (~100-140px on FHD).
            // In gesture navigation, safeArea.yMin is small or 0 (< 35px), requiring a safety clearance.
            float bottomOffsetPixels = 0f;
            bool isGestureNav = safeArea.yMin < (0.04f * screenHeight);
            if (isGestureNav && applyBottom)
            {
                bottomOffsetPixels = gestureNavBottomPadding * (Screen.dpi > 0 ? Screen.dpi / 160f : 1f);
            }

            // Step 3: Compute normalized anchors
            Vector2 anchorMin = safeArea.position;
            Vector2 anchorMax = safeArea.position + safeArea.size;

            if (applyLeft) anchorMin.x /= screenWidth;
            else anchorMin.x = 0f;

            if (applyRight) anchorMax.x /= screenWidth;
            else anchorMax.x = 1f;

            if (applyBottom)
            {
                float effBottom = Mathf.Max(safeArea.yMin, bottomCutoutY) + bottomOffsetPixels;
                anchorMin.y = Mathf.Clamp01(effBottom / screenHeight);
            }
            else
            {
                anchorMin.y = 0f;
            }

            if (applyTop)
            {
                float effTop = Mathf.Min(safeArea.yMax, screenHeight - topCutoutY);
                anchorMax.y = Mathf.Clamp01(effTop / screenHeight);
            }
            else
            {
                anchorMax.y = 1f;
            }

            _rectTransform.anchorMin = anchorMin;
            _rectTransform.anchorMax = anchorMax;
            _rectTransform.offsetMin = Vector2.zero;
            _rectTransform.offsetMax = Vector2.zero;
        }
    }
}
