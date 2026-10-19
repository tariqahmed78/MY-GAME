using System.Collections.Generic;
using UnityEngine;
using ArrowUntangle.Level;
using ArrowUntangle.Grid;

namespace ArrowUntangle.Rendering
{
    [RequireComponent(typeof(MeshFilter), typeof(MeshRenderer))]
    public class ArrowMeshRenderer2D : MonoBehaviour
    {
        [Header("Mesh Dimensions")]
        [SerializeField] private float bodyLineWidth = 0.22f;
        [SerializeField] private float arrowHeadLength = 0.45f;
        [SerializeField] private float arrowHeadWidth = 0.5f;

        [Header("Color States")]
        public static readonly Color ColorCyanHighlight = new Color(0.0f, 0.6588f, 1.0f, 1.0f); // #00A8FF
        public static readonly Color ColorCrimsonFlash = new Color(0.9098f, 0.2549f, 0.0941f, 1.0f); // #E84118
        public static readonly Color[] Palette = new Color[]
        {
            new Color(0.24f, 0.51f, 0.96f, 1.0f), // Crisp Royal Blue
            new Color(0.12f, 0.73f, 0.54f, 1.0f), // Emerald Teal
            new Color(0.98f, 0.62f, 0.12f, 1.0f), // Warm Amber
            new Color(0.85f, 0.35f, 0.92f, 1.0f), // Purple Iris
            new Color(0.92f, 0.28f, 0.38f, 1.0f), // Coral Pink
            new Color(0.38f, 0.78f, 0.94f, 1.0f)  // Sky Cyan
        };

        private MeshFilter _meshFilter;
        private MeshRenderer _meshRenderer;
        private Mesh _mesh;

        private MaterialPropertyBlock _propBlock;
        private static readonly int BaseColorProp = Shader.PropertyToID("_BaseColor");
        private static readonly int ColorProp = Shader.PropertyToID("_Color");

        private Color _baseColor;
        private Color _currentColor;

        private void Awake()
        {
            _meshFilter = GetComponent<MeshFilter>();
            _meshRenderer = GetComponent<MeshRenderer>();
            _propBlock = new MaterialPropertyBlock();

            _mesh = new Mesh
            {
                name = "ArrowMesh_Procedural"
            };
            _mesh.MarkDynamic();
            _meshFilter.sharedMesh = _mesh;

            EnsureMaterial();
        }

        private void EnsureMaterial()
        {
            if (_meshRenderer.sharedMaterial == null)
            {
                // Find URP 2D sprite/unlit shader or fallback to Sprites-Default
                Shader shader = Shader.Find("Universal Render Pipeline/2D/Sprite-Unlit");
                if (shader == null)
                {
                    shader = Shader.Find("Sprites/Default");
                }
                if (shader != null)
                {
                    _meshRenderer.sharedMaterial = new Material(shader);
                }
            }
        }

        public void SetColorIndex(int index)
        {
            int safeIndex = Mathf.Abs(index) % Palette.Length;
            _baseColor = Palette[safeIndex];
            SetColor(_baseColor);
        }

        public void SetColor(Color col)
        {
            _currentColor = col;
            if (_meshRenderer != null)
            {
                _meshRenderer.GetPropertyBlock(_propBlock);
                _propBlock.SetColor(BaseColorProp, col);
                _propBlock.SetColor(ColorProp, col);
                _meshRenderer.SetPropertyBlock(_propBlock);
            }
        }

        public void FlashCrimson()
        {
            SetColor(ColorCrimsonFlash);
        }

        public void HighlightCyan()
        {
            SetColor(ColorCyanHighlight);
        }

        public void ResetColor()
        {
            SetColor(_baseColor);
        }

        /// <summary>
        /// Rebuilds the procedural 2D line mesh with quad strips and a triangular arrowhead.
        /// headOffsetWorld allows moving the head dynamically during dragging without altering the tail.
        /// </summary>
        public void RebuildMesh(ArrowData arrow, GridSystem grid, Vector3 headOffsetWorld = default)
        {
            if (arrow == null || arrow.gridPoints == null || arrow.gridPoints.Count < 2 || grid == null)
            {
                if (_mesh != null) _mesh.Clear();
                return;
            }

            List<Vector3> worldPoints = new List<Vector3>(arrow.gridPoints.Count);
            for (int i = 0; i < arrow.gridPoints.Count; i++)
            {
                worldPoints.Add(grid.GridToWorldPosition(arrow.gridPoints[i]));
            }

            // Apply drag offset to head segment
            int headIdx = worldPoints.Count - 1;
            worldPoints[headIdx] += headOffsetWorld;

            BuildMeshGeometry(worldPoints, (Vector2)arrow.headDirection);
        }

        private void BuildMeshGeometry(List<Vector3> points, Vector2 headDir)
        {
            int count = points.Count;
            if (count < 2) return;

            List<Vector3> vertices = new List<Vector3>();
            List<int> triangles = new List<int>();
            List<Vector2> uvs = new List<Vector2>();

            float halfW = bodyLineWidth * 0.5f;

            // Generate quads along segments
            for (int i = 0; i < count - 1; i++)
            {
                Vector3 p0 = points[i];
                Vector3 p1 = points[i + 1];

                // For the last segment, trim back so arrowhead has space
                Vector3 segDir = (p1 - p0).normalized;
                float segLen = Vector3.Distance(p0, p1);

                if (i == count - 2)
                {
                    float trimmedLen = Mathf.Max(0.01f, segLen - arrowHeadLength);
                    p1 = p0 + segDir * trimmedLen;
                }

                Vector3 normal = new Vector3(-segDir.y, segDir.x, 0f) * halfW;

                int vStart = vertices.Count;

                vertices.Add(p0 - normal); // 0
                vertices.Add(p0 + normal); // 1
                vertices.Add(p1 + normal); // 2
                vertices.Add(p1 - normal); // 3

                uvs.Add(new Vector2(0, 0));
                uvs.Add(new Vector2(1, 0));
                uvs.Add(new Vector2(1, 1));
                uvs.Add(new Vector2(0, 1));

                triangles.Add(vStart + 0);
                triangles.Add(vStart + 1);
                triangles.Add(vStart + 2);

                triangles.Add(vStart + 0);
                triangles.Add(vStart + 2);
                triangles.Add(vStart + 3);
            }

            // Generate triangular arrow head
            Vector3 tip = points[count - 1];
            Vector3 forward = new Vector3(headDir.x, headDir.y, 0f).normalized;
            Vector3 right = new Vector3(-forward.y, forward.x, 0f);

            Vector3 headBase = tip - forward * arrowHeadLength;
            Vector3 leftWing = headBase - right * (arrowHeadWidth * 0.5f);
            Vector3 rightWing = headBase + right * (arrowHeadWidth * 0.5f);

            int headVStart = vertices.Count;
            vertices.Add(tip);        // 0: tip
            vertices.Add(leftWing);   // 1: left
            vertices.Add(rightWing);  // 2: right

            uvs.Add(new Vector2(0.5f, 1f));
            uvs.Add(new Vector2(0f, 0f));
            uvs.Add(new Vector2(1f, 0f));

            triangles.Add(headVStart + 0);
            triangles.Add(headVStart + 1);
            triangles.Add(headVStart + 2);

            _mesh.Clear();
            _mesh.SetVertices(vertices);
            _mesh.SetUVs(0, uvs);
            _mesh.SetTriangles(triangles, 0);
            _mesh.RecalculateBounds();
        }
    }
}
