using UnityEngine;
using ArrowUntangle.Gameplay;

namespace ArrowUntangle.UI
{
    public class MinimalHUD : MonoBehaviour
    {
        [SerializeField] private GameManager gameManager;
        [SerializeField] private TestLevelBuilder levelBuilder;

        private void Start()
        {
            if (gameManager == null) gameManager = FindObjectOfType<GameManager>();
            if (levelBuilder == null) levelBuilder = FindObjectOfType<TestLevelBuilder>();
        }

        private void OnGUI()
        {
            if (gameManager == null) return;

            GUI.skin.label.fontSize = 22;
            GUI.skin.button.fontSize = 18;

            GUILayout.BeginArea(new Rect(20, 20, Screen.width - 40, 160));
            GUILayout.BeginHorizontal();

            // Heart counter
            string heartString = "";
            for (int i = 0; i < gameManager.MaxHearts; i++)
            {
                heartString += (i < gameManager.CurrentHearts) ? "<color=#E84118>♥</color> " : "<color=#888888>♡</color> ";
            }

            GUILayout.Label($"Lives: {heartString}", GUILayout.Width(220));

            GUILayout.FlexibleSpace();

            if (GUILayout.Button("Restart Level", GUILayout.Width(140), GUILayout.Height(40)))
            {
                if (levelBuilder != null)
                {
                    levelBuilder.BuildTestLevel();
                }
            }

            GUILayout.EndHorizontal();

            // Win / Lose State Banner
            if (gameManager.CurrentState == RoundState.Won)
            {
                GUI.color = Color.cyan;
                GUILayout.Label("<b>LEVEL CLEARED! ALL ARROWS UNTANGLED!</b>");
                GUI.color = Color.white;
            }
            else if (gameManager.CurrentState == RoundState.Lost)
            {
                GUI.color = Color.red;
                GUILayout.Label("<b>OUT OF LIVES! PUZZLE FAILED. TAP RESTART.</b>");
                GUI.color = Color.white;
            }

            GUILayout.EndArea();
        }
    }
}
