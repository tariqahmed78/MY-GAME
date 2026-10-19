import { MazeArchitecture, LevelSilhouette, ArrowDefinition, ArrowDirection } from './types';

/**
 * 52 Distinct Maze Architectures & Geometries
 * Evaluated mathematically in normalized space [-1..1] and grid coordinates.
 */
export const MAZE_ARCHITECTURES: MazeArchitecture[] = [
  // 1. Concentric Rings (Circular)
  {
    id: 'concentric_rings',
    name: 'Concentric Astrolabe',
    category: 'Circular',
    description: 'Orbital nested rings with staggered celestial gate transitions.',
    minStage: 1,
    shapeMask: (nx, ny) => {
      const r = Math.hypot(nx, ny);
      return r <= 0.96;
    },
  },
  // 2. Hexagonal Honeycomb
  {
    id: 'hexagonal_honeycomb',
    name: 'Hexagonal Chitin',
    category: 'Polygonal',
    description: 'Six-sided geometric matrix mirroring natural insect hives.',
    minStage: 1,
    shapeMask: (nx, ny) => {
      const q2x = Math.abs(nx);
      const q2y = Math.abs(ny);
      return q2x * 0.866025 + q2y * 0.5 <= 0.88 && q2y <= 0.88;
    },
  },
  // 3. Jagged Lightning
  {
    id: 'jagged_lightning',
    name: 'Volt Fulgurite',
    category: 'Jagged',
    description: 'High-voltage lightning fracture carved by electric discharges.',
    minStage: 1,
    shapeMask: (nx, ny) => {
      // Step zig-zag lightning corridor
      const offset = ny * 0.6 + (ny > 0 ? 0.2 : -0.2);
      return Math.abs(nx - offset) <= 0.48;
    },
  },
  // 4. Fractal Dendrite / Tree
  {
    id: 'fractal_tree',
    name: 'Dendritic Canopy',
    category: 'Fractal',
    description: 'Self-similar recursive branching channels following botanical growth.',
    minStage: 2,
    shapeMask: (nx, ny) => {
      if (ny < -0.3) {
        return Math.abs(nx) <= 0.35; // Trunk
      }
      const spread = (ny + 0.3) * 0.8;
      return Math.abs(nx) <= spread + 0.32 && ny <= 0.95;
    },
  },
  // 5. Asymmetrical Vortex
  {
    id: 'asymmetric_vortex',
    name: 'Abyssal Charybdis',
    category: 'Asymmetric',
    description: 'Logarithmic asymmetric swirl pulling inwards toward singularity.',
    minStage: 2,
    shapeMask: (nx, ny) => {
      const r = Math.hypot(nx + 0.15, ny - 0.1);
      const theta = Math.atan2(ny - 0.1, nx + 0.15);
      const spiralR = 0.5 + 0.45 * Math.sin(theta * 1.5);
      return r <= spiralR + 0.35 && r <= 0.95;
    },
  },
  // 6. Classic Heart
  {
    id: 'heart',
    name: 'Crimson Heart',
    category: 'Organic',
    description: 'Cardioid geometry with bilateral ventricles and tapered apex.',
    minStage: 2,
    shapeMask: (nx, ny) => {
      const hx = nx * 1.15;
      const hy = (ny + 0.15) * 1.15;
      const term = hx * hx + hy * hy - 1;
      return term * term * term - hx * hx * hy * hy * hy <= 0;
    },
  },
  // 7. Sunflower Core
  {
    id: 'sunflower',
    name: 'Solar Helianthus',
    category: 'Organic',
    description: 'Radiant disk surrounded by undulating golden petal lobes.',
    minStage: 3,
    shapeMask: (nx, ny) => {
      const r = Math.hypot(nx, ny);
      const theta = Math.atan2(ny, nx);
      const petalBoundary = 0.58 + 0.36 * Math.pow(Math.cos(4 * theta), 2);
      return r <= petalBoundary;
    },
  },
  // 8. Stepped Pyramid
  {
    id: 'pyramid',
    name: 'Ziggurat of Ur',
    category: 'Polygonal',
    description: 'Stepped monumental temple tapering to a solitary apex gateway.',
    minStage: 3,
    shapeMask: (nx, ny) => {
      const pY = (1 - ny) / 2; // 0 at top, 1 at bottom
      return Math.abs(nx) <= pY * 0.9 + 0.18 && ny >= -0.95 && ny <= 0.95;
    },
  },
  // 9. Faceted Diamond
  {
    id: 'diamond',
    name: 'Brilliant Gemstone',
    category: 'Polygonal',
    description: 'Octahedral crystalline gem cut with light-refracting pavilion facets.',
    minStage: 3,
    shapeMask: (nx, ny) => {
      if (ny > 0.6) return false;
      if (ny >= 0.1) {
        const t = (0.6 - ny) / 0.5;
        return Math.abs(nx) <= 0.6 + 0.35 * t;
      } else {
        const t = (ny + 1) / 1.1;
        return Math.abs(nx) <= t * 0.95;
      }
    },
  },
  // 10. Imperial Crown
  {
    id: 'crown',
    name: 'Regal Coronet',
    category: 'Royal',
    description: 'Three-tiered monarchical crest crowned with pointed spires.',
    minStage: 4,
    shapeMask: (nx, ny) => {
      if (ny < -0.85 || ny > 0.85) return false;
      if (ny < -0.3) {
        return Math.abs(nx) <= 0.92;
      }
      return Math.abs(nx) <= 0.28 || Math.abs(nx - 0.72) <= 0.24 || Math.abs(nx + 0.72) <= 0.24;
    },
  },
  // 11. Celestial Starburst
  {
    id: 'star_nova',
    name: 'Eight-Point Nova',
    category: 'Celestial',
    description: 'Pulsing cosmic starburst emitting radiant gravitational rays.',
    minStage: 4,
    shapeMask: (nx, ny) => {
      const r = Math.hypot(nx, ny);
      const theta = Math.atan2(ny, nx);
      const star = 0.45 + 0.48 * Math.pow(Math.cos(4 * theta), 4);
      return r <= star;
    },
  },
  // 12. Chrono Hourglass
  {
    id: 'hourglass',
    name: 'Chronos Sands',
    category: 'Temporal',
    description: 'Pinched temporal chambers funneling through a narrow event horizon.',
    minStage: 4,
    shapeMask: (nx, ny) => {
      const waist = Math.abs(ny);
      return Math.abs(nx) <= 0.25 + waist * 0.7 && Math.abs(ny) <= 0.95;
    },
  },
  // 13. Winged Scarab
  {
    id: 'scarab',
    name: 'Khepri Scarab',
    category: 'Organic',
    description: 'Sacred Egyptian coleoptera with vaulted carapace and spread wings.',
    minStage: 5,
    shapeMask: (nx, ny) => {
      const r = Math.hypot(nx * 0.9, ny * 1.1);
      if (r <= 0.6) return true; // Central body
      return Math.abs(nx) <= 0.95 && ny >= -0.2 && ny <= 0.5; // Wing extensions
    },
  },
  // 14. Ouroboros Infinity
  {
    id: 'ouroboros_infinity',
    name: 'Lemniscate Loop',
    category: 'Mythic',
    description: 'Mathematical figure-eight infinity track symbolizing eternal return.',
    minStage: 5,
    shapeMask: (nx, ny) => {
      // (x^2 + y^2)^2 <= a^2 * (x^2 - y^2) expanded
      const d1 = Math.hypot(nx - 0.45, ny);
      const d2 = Math.hypot(nx + 0.45, ny);
      return (d1 <= 0.48 && d1 >= 0.1) || (d2 <= 0.48 && d2 >= 0.1);
    },
  },
  // 15. Crescent Moon
  {
    id: 'crescent_moon',
    name: 'Lunar Crescent',
    category: 'Celestial',
    description: 'Sickle of twilight traversing the perimeter of the celestial sphere.',
    minStage: 5,
    shapeMask: (nx, ny) => {
      const r1 = Math.hypot(nx, ny);
      const r2 = Math.hypot(nx - 0.4, ny - 0.1);
      return r1 <= 0.92 && r2 >= 0.55;
    },
  },
  // 16. Poseidon Trident
  {
    id: 'trident_fork',
    name: 'Abyssal Trident',
    category: 'Mythic',
    description: 'Tri-pointed nautical scepter commanding currents and whirlpools.',
    minStage: 6,
    shapeMask: (nx, ny) => {
      if (ny < 0) {
        return Math.abs(nx) <= 0.22; // Shaft
      }
      // Prongs
      return Math.abs(nx) <= 0.18 || Math.abs(nx - 0.65) <= 0.18 || Math.abs(nx + 0.65) <= 0.18;
    },
  },
  // 17. Nautilus Shell
  {
    id: 'nautilus_spiral',
    name: 'Fibonacci Shell',
    category: 'Fractal',
    description: 'Golden ratio logarithmic expansion found in prehistoric ammonites.',
    minStage: 6,
    shapeMask: (nx, ny) => {
      const r = Math.hypot(nx, ny);
      const theta = Math.atan2(ny, nx) + Math.PI;
      const goldenR = 0.25 + 0.1 * theta;
      return r <= goldenR + 0.35 && r <= 0.95;
    },
  },
  // 18. Butterfly Wings
  {
    id: 'butterfly_wings',
    name: 'Papilio Loom',
    category: 'Organic',
    description: 'Bilateral symmetrical wings with sweeping upper and lower costal lobes.',
    minStage: 7,
    shapeMask: (nx, ny) => {
      if (Math.abs(nx) <= 0.18) return true; // Thorax
      const r = Math.hypot(Math.abs(nx) - 0.5, ny);
      return r <= 0.5;
    },
  },
  // 19. Bio Amoeba
  {
    id: 'bio_amoeba',
    name: 'Cytoplasmic Amoeba',
    category: 'Organic',
    description: 'Flexible undulating eukaryotic membrane responding to stimuli.',
    minStage: 7,
    shapeMask: (nx, ny) => {
      const r = Math.hypot(nx, ny);
      const theta = Math.atan2(ny, nx);
      const pseudopod = 0.62 + 0.2 * Math.sin(3 * theta) + 0.12 * Math.cos(5 * theta);
      return r <= pseudopod;
    },
  },
  // 20. Crystal Geode
  {
    id: 'crystal_geode',
    name: 'Amethyst Geode',
    category: 'Mineral',
    description: 'Hollow mineral sphere lined with inward-facing quartz crystal shards.',
    minStage: 8,
    shapeMask: (nx, ny) => {
      const r = Math.hypot(nx, ny);
      return r <= 0.95 && r >= 0.28;
    },
  },
  // 21. Cyber Skull
  {
    id: 'cyber_skull',
    name: 'Bionic Cranium',
    category: 'Cybernetic',
    description: 'Synthetic titanium cranium protecting biometric data cores.',
    minStage: 8,
    shapeMask: (nx, ny) => {
      if (ny > -0.1) {
        return Math.hypot(nx, ny - 0.2) <= 0.72; // Cranial vault
      }
      return Math.abs(nx) <= 0.42 && ny >= -0.85; // Mandible
    },
  },
  // 22. Solar Eclipse
  {
    id: 'solar_eclipse',
    name: 'Umbral Corona',
    category: 'Celestial',
    description: 'Blazing photonic rim exposed around a central gravitational void.',
    minStage: 9,
    shapeMask: (nx, ny) => {
      const r = Math.hypot(nx, ny);
      return r <= 0.92 && r >= 0.38;
    },
  },
  // 23. Triforce Delta
  {
    id: 'triforce_delta',
    name: 'Tripartite Monolith',
    category: 'Polygonal',
    description: 'Three interlocking equilateral triangles enclosing a central rift.',
    minStage: 9,
    shapeMask: (nx, ny) => {
      const yNorm = (ny + 0.8) / 1.6;
      if (yNorm < 0 || yNorm > 1) return false;
      const halfW = yNorm * 0.9;
      if (Math.abs(nx) > halfW) return false;
      // Invert center triangle
      if (ny < 0.1 && Math.abs(nx) < (0.1 - ny) * 0.5) return false;
      return true;
    },
  },
  // 24. Menger Sponge Grid
  {
    id: 'menger_sponge',
    name: 'Menger Cross',
    category: 'Fractal',
    description: 'Recursive topological sponge with perpendicular cross cutouts.',
    minStage: 10,
    shapeMask: (nx, ny) => {
      if (Math.abs(nx) > 0.88 || Math.abs(ny) > 0.88) return false;
      // Center cutout
      if (Math.abs(nx) < 0.28 && Math.abs(ny) < 0.28) return false;
      return true;
    },
  },
  // 25. Celtic Labyrinth Rune
  {
    id: 'labyrinth_rune',
    name: 'Celtic Triskelion',
    category: 'Mythic',
    description: 'Triple spiral interlocking rune traced by ancient megalithic architects.',
    minStage: 10,
    shapeMask: (nx, ny) => {
      const r = Math.hypot(nx, ny);
      const theta = Math.atan2(ny, nx);
      const tris = 0.5 + 0.42 * Math.cos(3 * theta);
      return r <= tris && r <= 0.94;
    },
  },
  // 26. Dragon Fang
  {
    id: 'dragon_fang',
    name: 'Wyrm Talon',
    category: 'Organic',
    description: 'Curved serrated ivory talon from a primordial mountain drake.',
    minStage: 11,
    shapeMask: (nx, ny) => {
      const curveX = nx - Math.pow((ny + 1) * 0.5, 2) * 0.6;
      const width = (1 - ny) * 0.45;
      return Math.abs(curveX) <= width && Math.abs(ny) <= 0.95;
    },
  },
  // 27. Phoenix Crest
  {
    id: 'phoenix_crest',
    name: 'Ascendant Phoenix',
    category: 'Mythic',
    description: 'Flaring wings and flame plumage ascending from ashes.',
    minStage: 11,
    shapeMask: (nx, ny) => {
      if (ny < -0.6) return Math.abs(nx) <= 0.25; // Tail
      return Math.abs(nx) <= 0.3 + (ny + 0.6) * 0.5 && ny <= 0.92;
    },
  },
  // 28. Seraph Wings
  {
    id: 'seraph_wings',
    name: 'Six-Fold Seraph',
    category: 'Celestial',
    description: 'Multi-tiered angelic plumage framing an inner sanctum.',
    minStage: 12,
    shapeMask: (nx, ny) => {
      const r = Math.hypot(nx * 0.8, ny * 1.2);
      return r <= 0.92 && Math.abs(nx) >= 0.15;
    },
  },
  // 29. Cyber Cross
  {
    id: 'cyber_cross',
    name: 'Crux Matrix',
    category: 'Cybernetic',
    description: 'Orthogonal high-frequency cross junction bridging four sectors.',
    minStage: 12,
    shapeMask: (nx, ny) => {
      return (Math.abs(nx) <= 0.35 && Math.abs(ny) <= 0.92) || (Math.abs(ny) <= 0.35 && Math.abs(nx) <= 0.92);
    },
  },
  // 30. Orbital Astrolabe
  {
    id: 'orbital_astrolabe',
    name: 'Gyroscopic Armillary',
    category: 'Celestial',
    description: 'Intersecting elliptical brass rings aligning with cosmic coordinates.',
    minStage: 13,
    shapeMask: (nx, ny) => {
      const e1 = Math.hypot(nx * 1.4, ny * 0.8);
      const e2 = Math.hypot(nx * 0.8, ny * 1.4);
      return (e1 <= 0.95 && e1 >= 0.6) || (e2 <= 0.95 && e2 >= 0.6);
    },
  },
  // 31. Stealth Chevron
  {
    id: 'chevron_arrowhead',
    name: 'Stealth Delta',
    category: 'Polygonal',
    description: 'Aggressive swept-wing arrowhead penetrating aerodynamic turbulence.',
    minStage: 14,
    shapeMask: (nx, ny) => {
      const wingY = ny + Math.abs(nx) * 0.8;
      return wingY >= -0.3 && wingY <= 0.65 && Math.abs(nx) <= 0.92;
    },
  },
  // 32. Octagonal Fortress
  {
    id: 'octagonal_fortress',
    name: 'Bastion Citadel',
    category: 'Polygonal',
    description: 'Eight-bastioned fortification with corner turrets and moat perimeter.',
    minStage: 15,
    shapeMask: (nx, ny) => {
      const qx = Math.abs(nx);
      const qy = Math.abs(ny);
      return qx <= 0.88 && qy <= 0.88 && qx + qy <= 1.25;
    },
  },
  // 33. Four Leaf Clover
  {
    id: 'four_leaf_clover',
    name: 'Verdant Trifolium',
    category: 'Organic',
    description: 'Four reciprocal harmonic lobes woven into biological symmetry.',
    minStage: 16,
    shapeMask: (nx, ny) => {
      const r = Math.hypot(nx, ny);
      const theta = Math.atan2(ny, nx);
      const clover = 0.5 + 0.42 * Math.abs(Math.sin(2 * theta));
      return r <= clover;
    },
  },
  // 34. Whirlpool Maelstrom
  {
    id: 'whirlpool_maelstrom',
    name: 'Maelstrom Vortex',
    category: 'Asymmetric',
    description: 'S-shaped ocean vortex dragging debris into oceanic trenches.',
    minStage: 17,
    shapeMask: (nx, ny) => {
      const r = Math.hypot(nx, ny);
      const theta = Math.atan2(ny, nx);
      return r <= 0.9 && (r >= 0.35 || Math.abs(theta) < 1.2);
    },
  },
  // 35. Meteor Crater
  {
    id: 'meteor_crater',
    name: 'Tunguska Crater',
    category: 'Mineral',
    description: 'Impact basin circled by radial ejecta splatters and shock fractures.',
    minStage: 18,
    shapeMask: (nx, ny) => {
      const r = Math.hypot(nx, ny);
      const theta = Math.atan2(ny, nx);
      const ejecta = 0.65 + 0.28 * Math.pow(Math.cos(6 * theta), 2);
      return r <= ejecta;
    },
  },
  // 36. Double Helix
  {
    id: 'double_helix',
    name: 'Genome Helix',
    category: 'Fractal',
    description: 'Intertwined biological strands connected by base pair corridors.',
    minStage: 19,
    shapeMask: (nx, ny) => {
      const wave1 = 0.55 * Math.sin(ny * 4);
      const wave2 = -0.55 * Math.sin(ny * 4);
      return Math.abs(nx - wave1) <= 0.26 || Math.abs(nx - wave2) <= 0.26 || Math.abs(nx) <= 0.55;
    },
  },
  // 37. Spider Web
  {
    id: 'spider_web',
    name: 'Arachnid Loom',
    category: 'Organic',
    description: 'Eight radial silk strands connected by concentric spiral anchor threads.',
    minStage: 20,
    shapeMask: (nx, ny) => {
      const r = Math.hypot(nx, ny);
      return r <= 0.95 && r >= 0.15;
    },
  },
  // 38. Chrono Gear
  {
    id: 'chrono_gear',
    name: 'Horology Cog',
    category: 'Cybernetic',
    description: 'Twelve-toothed brass clockwork cog synchronizing temporal escapements.',
    minStage: 21,
    shapeMask: (nx, ny) => {
      const r = Math.hypot(nx, ny);
      const theta = Math.atan2(ny, nx);
      const tooth = 0.72 + 0.22 * Math.round((Math.sin(12 * theta) + 1) / 2);
      return r <= tooth && r >= 0.2;
    },
  },
  // 39. Shuriken Blade
  {
    id: 'shuriken_ninja',
    name: 'Vortex Shuriken',
    category: 'Polygonal',
    description: 'Four-pointed curved throwing blade carved from folded Damascus steel.',
    minStage: 22,
    shapeMask: (nx, ny) => {
      const r = Math.hypot(nx, ny);
      const theta = Math.atan2(ny, nx);
      const blade = 0.35 + 0.55 * Math.pow(Math.cos(2 * theta + 0.4), 2);
      return r <= blade;
    },
  },
  // 40. Tesseract Fold
  {
    id: 'tesseract_cube',
    name: 'Hypercube Projection',
    category: 'Dimensional',
    description: 'Four-dimensional hypercube flattened into 2D isometric corridors.',
    minStage: 24,
    shapeMask: (nx, ny) => {
      const outer = Math.max(Math.abs(nx), Math.abs(ny)) <= 0.88;
      const inner = Math.max(Math.abs(nx), Math.abs(ny)) <= 0.32;
      return outer && !inner;
    },
  },
  // 41. Falcon Talon
  {
    id: 'falcon_talon',
    name: 'Peregrine Clutches',
    category: 'Organic',
    description: 'Grasping predatory raptor talons ready to clamp down on prey.',
    minStage: 26,
    shapeMask: (nx, ny) => {
      if (ny < -0.3) return Math.abs(nx) <= 0.3;
      return Math.abs(nx) <= 0.88 && Math.hypot(nx, ny - 0.2) <= 0.8;
    },
  },
  // 42. Biosphere Dome
  {
    id: 'biosphere_dome',
    name: 'Geodesic Biosphere',
    category: 'Polygonal',
    description: 'Triangulated geodesic dome sheltering self-sustaining flora.',
    minStage: 28,
    shapeMask: (nx, ny) => {
      return ny <= 0.85 && Math.hypot(nx, ny - 0.1) <= 0.85;
    },
  },
  // 43. Magma Rift
  {
    id: 'magma_rift',
    name: 'Tectonic Fissure',
    category: 'Mineral',
    description: 'Seismic fault line splitting continental plates with molten rivers.',
    minStage: 30,
    shapeMask: (nx, ny) => {
      const crack = Math.sin(ny * 5) * 0.35;
      return Math.abs(nx - crack) <= 0.48;
    },
  },
  // 44. Iceberg Spire
  {
    id: 'iceberg_spire',
    name: 'Glacial Monolith',
    category: 'Mineral',
    description: 'Sharp crystalline arctic spire towering above submerged icy shelves.',
    minStage: 32,
    shapeMask: (nx, ny) => {
      const topTaper = (1 - ny) * 0.45;
      return Math.abs(nx) <= topTaper + 0.15 && Math.abs(ny) <= 0.95;
    },
  },
  // 45. Prismatic Prism
  {
    id: 'prismatic_pyramid',
    name: 'Newton Prism',
    category: 'Dimensional',
    description: 'Refracting optical quartz prism splitting monochromatic light.',
    minStage: 34,
    shapeMask: (nx, ny) => {
      const pY = (1 - ny) / 2;
      return Math.abs(nx) <= pY * 0.85 && ny >= -0.95 && ny <= 0.95;
    },
  },
  // 46. Ouroboros Dragon
  {
    id: 'ouroboros_dragon',
    name: 'Coiled Jormungandr',
    category: 'Mythic',
    description: 'World-encircling midgard serpent clutching its own tail.',
    minStage: 36,
    shapeMask: (nx, ny) => {
      const r = Math.hypot(nx, ny);
      return r <= 0.95 && r >= 0.42;
    },
  },
  // 47. Hypercube Lattice
  {
    id: 'hypercube_lattice',
    name: 'Matrix Lattice',
    category: 'Cybernetic',
    description: 'Interconnected quantum grid nodes vibrating in phase.',
    minStage: 38,
    shapeMask: (nx, ny) => {
      return Math.abs(nx) <= 0.92 && Math.abs(ny) <= 0.92;
    },
  },
  // 48. Singularity Event
  {
    id: 'singularity_event',
    name: 'Schwarzschild Horizon',
    category: 'Dimensional',
    description: 'Extreme gravitational lens warping light into orbiting photon rings.',
    minStage: 40,
    shapeMask: (nx, ny) => {
      const r = Math.hypot(nx, ny);
      return r <= 0.96 && r >= 0.2;
    },
  },
  // 49. Void Monolith
  {
    id: 'void_monolith',
    name: 'Alien Megalith',
    category: 'Dimensional',
    description: 'Extraterrestrial obsidian pillar etched with mathematical axioms.',
    minStage: 42,
    shapeMask: (nx, ny) => {
      return Math.abs(nx) <= 0.48 && Math.abs(ny) <= 0.95;
    },
  },
  // 50. Sacred Lotus Mandala
  {
    id: 'lotus_mandala',
    name: 'Twelve-Fold Mandala',
    category: 'Mythic',
    description: 'Sacred geometric lotus radiating harmonic frequencies in all directions.',
    minStage: 45,
    shapeMask: (nx, ny) => {
      const r = Math.hypot(nx, ny);
      const theta = Math.atan2(ny, nx);
      const mandala = 0.55 + 0.38 * Math.cos(6 * theta);
      return r <= mandala;
    },
  },
  // 51. Aegis Shield
  {
    id: 'shield_aegis',
    name: 'Heraldic Aegis',
    category: 'Royal',
    description: 'Forged crest of Athena capable of reflecting gorgon stares.',
    minStage: 48,
    shapeMask: (nx, ny) => {
      if (ny > 0.3) {
        return Math.abs(nx) <= 0.88;
      }
      const taper = (ny + 1) * 0.65;
      return Math.abs(nx) <= taper;
    },
  },
  // 52. Primordial Hydra
  {
    id: 'hydra_heads',
    name: 'Lernean Hydra',
    category: 'Mythic',
    description: 'Seven serpentine necks rising from subterranean swamp waters.',
    minStage: 50,
    shapeMask: (nx, ny) => {
      if (ny < -0.4) return Math.abs(nx) <= 0.4;
      const r = Math.hypot(nx, ny - 0.2);
      return r <= 0.85;
    },
  },
];

/**
 * Procedural Matrix & Obstacle Sculptor for any of the 52 architectures:
 * Carves out corridors, obstacles, start point, and single target exit point!
 */
export function buildMazeForArchitecture(
  arch: MazeArchitecture,
  stage: number
): LevelSilhouette {
  // Scale grid dimensions based on stage (start at 11x11, progress to 19x19)
  const baseDim = Math.min(19, 11 + Math.floor(stage / 5) * 2);
  const w = baseDim % 2 === 0 ? baseDim + 1 : baseDim;
  const h = w;

  const cx = (w - 1) / 2;
  const cy = (h - 1) / 2;

  const gridMatrix: number[][] = Array.from({ length: h }, () => Array(w).fill(0));
  const validPathCoords: { x: number; y: number }[] = [];

  // 1. Carve initial silhouette inside architecture boundary
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const nx = (x - cx) / (cx * 0.95);
      const ny = -(y - cy) / (cy * 0.95);

      if (arch.shapeMask(nx, ny, x, y, w, h)) {
        gridMatrix[y][x] = 1; // Mark as path candidate
        validPathCoords.push({ x, y });
      } else {
        gridMatrix[y][x] = 0; // Void outside geometry
      }
    }
  }

  // Ensure at least 15 valid path cells if mask is too restrictive
  if (validPathCoords.length < 15) {
    for (let y = 2; y < h - 2; y++) {
      for (let x = 2; x < w - 2; x++) {
        gridMatrix[y][x] = 1;
        validPathCoords.push({ x, y });
      }
    }
  }

  // 2. Determine Start Point (near bottom/center) and Exit Point (near boundary/top)
  let startPoint = validPathCoords[0];
  let exitPoint = validPathCoords[validPathCoords.length - 1];

  let maxDist = -1;
  for (const p1 of validPathCoords) {
    for (const p2 of validPathCoords) {
      const d = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      if (d > maxDist) {
        maxDist = d;
        startPoint = p1;
        exitPoint = p2;
      }
    }
  }

  // 3. Procedurally generate maze corridors & obstacles using randomized Prim/DFS on the silhouette
  const obstacles: { x: number; y: number }[] = [];
  const obstacleDensity = Math.min(0.28, 0.14 + (stage * 0.008)); // Scale obstacle density with stage

  for (const pt of validPathCoords) {
    if (
      (pt.x === startPoint.x && pt.y === startPoint.y) ||
      (pt.x === exitPoint.x && pt.y === exitPoint.y)
    ) {
      continue;
    }

    // Never block adjacent to start/exit to guarantee clearance
    if (Math.hypot(pt.x - startPoint.x, pt.y - startPoint.y) <= 1.2) continue;
    if (Math.hypot(pt.x - exitPoint.x, pt.y - exitPoint.y) <= 1.2) continue;

    // Patterned obstacles creating winding labyrinth paths
    const isLabyrinthWall =
      (pt.x % 2 === 1 && pt.y % 2 === 1) ||
      (Math.random() < obstacleDensity && (pt.x + pt.y) % 2 === 0);

    if (isLabyrinthWall) {
      gridMatrix[pt.y][pt.x] = 2; // Obstacle
      obstacles.push(pt);
    }
  }

  // 4. BFS Solvability Check & Corridor Drilling:
  // Ensure a guaranteed clear path exists between startPoint and exitPoint!
  const hasPath = () => {
    const queue = [startPoint];
    const visited = new Set<string>([`${startPoint.x},${startPoint.y}`]);

    while (queue.length > 0) {
      const curr = queue.shift()!;
      if (curr.x === exitPoint.x && curr.y === exitPoint.y) return true;

      const dirs = [
        { dx: 1, dy: 0 },
        { dx: -1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: 0, dy: -1 },
      ];

      for (const d of dirs) {
        const nx = curr.x + d.dx;
        const ny = curr.y + d.dy;
        const key = `${nx},${ny}`;

        if (
          nx >= 0 &&
          nx < w &&
          ny >= 0 &&
          ny < h &&
          gridMatrix[ny][nx] === 1 && // Must be path
          !visited.has(key)
        ) {
          visited.add(key);
          queue.push({ x: nx, y: ny });
        }
      }
    }
    return false;
  };

  // If maze is partitioned, iteratively drill path from start to exit
  if (!hasPath()) {
    let curr = { ...startPoint };
    while (curr.x !== exitPoint.x || curr.y !== exitPoint.y) {
      const dx = exitPoint.x - curr.x;
      const dy = exitPoint.y - curr.y;

      if (Math.abs(dx) > Math.abs(dy)) {
        curr.x += Math.sign(dx);
      } else {
        curr.y += Math.sign(dy);
      }

      // Convert any obstacle along this drill line to open path
      if (gridMatrix[curr.y][curr.x] === 2) {
        gridMatrix[curr.y][curr.x] = 1;
        const oIdx = obstacles.findIndex((o) => o.x === curr.x && o.y === curr.y);
        if (oIdx >= 0) obstacles.splice(oIdx, 1);
      } else if (gridMatrix[curr.y][curr.x] === 0) {
        // Enforce path within silhouette
        gridMatrix[curr.y][curr.x] = 1;
      }
    }
  }

  // 5. Construct the player creature arrow at startPoint:
  const checkDirs: { dir: ArrowDirection; dx: number; dy: number }[] = [
    { dir: 'UP', dx: 0, dy: -1 },
    { dir: 'RIGHT', dx: 1, dy: 0 },
    { dir: 'DOWN', dx: 0, dy: 1 },
    { dir: 'LEFT', dx: -1, dy: 0 },
  ];
  let chosenDir: ArrowDirection = 'UP';
  for (const d of checkDirs) {
    const nx = startPoint.x + d.dx;
    const ny = startPoint.y + d.dy;
    if (nx >= 0 && nx < w && ny >= 0 && ny < h && gridMatrix[ny][nx] === 1) {
      chosenDir = d.dir;
      break;
    }
  }

  const arrows: ArrowDefinition[] = [
    {
      id: 'arrow-main',
      direction: chosenDir,
      points: [startPoint],
    },
  ];

  // Difficulty tiering
  let difficulty: 'Normal' | 'Hard' | 'Expert' | 'Insane' = 'Normal';
  if (stage >= 20) difficulty = 'Insane';
  else if (stage >= 10) difficulty = 'Expert';
  else if (stage >= 5) difficulty = 'Hard';

  // Mission time clock: tighter for pressure stages (every 5th stage)
  const isPressure = stage % 5 === 0;
  const timeLimit = isPressure
    ? Math.max(25, 50 - Math.floor(stage * 0.4))
    : Math.max(35, 75 - Math.floor(stage * 0.7));

  return {
    id: stage,
    name: `Stage ${stage.toString().padStart(2, '0')}: ${arch.name}`,
    subtitle: arch.description,
    shapeType: 'maze',
    gridWidth: w,
    gridHeight: h,
    arrows,
    obstacles,
    gridMatrix,
    startPoint,
    exitPoint,
    isSingleTargetMaze: true,
    timeLimit,
    difficulty,
    shapeName: arch.name,
  };
}

/**
 * Deterministic or randomized architecture selector for a stage run
 */
export function getRandomArchitectureForStage(stage: number, seedOffset: number = 0): MazeArchitecture {
  const eligible = MAZE_ARCHITECTURES.filter((a) => (a.minStage || 1) <= stage);
  if (eligible.length === 0) return MAZE_ARCHITECTURES[0];

  // Distribute distinct geometries across run
  const idx = (stage - 1 + seedOffset) % eligible.length;
  return eligible[idx];
}
