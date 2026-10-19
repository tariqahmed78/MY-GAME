import { CreatureDefinition } from './types';

export const CREATURES: CreatureDefinition[] = [
  // 1. Reptiles
  {
    id: 'emerald-adder',
    name: 'Emerald Adder',
    category: 'reptile',
    species: 'Crotalus Viridis',
    unlockStage: 1,
    requiredScore: 0,
    missionsWonRequired: 0,
    title: 'Verdant Viper',
    description: 'Sleek serpentine predator with diamond-scaled skin and rapid corridor reflexes.',
    primaryColor: '#10B981',
    secondaryColor: '#047857',
    glowColor: '#34D399',
    trailType: 'spores',
    locomotionType: 'slither',
  },
  {
    id: 'sun-gecko',
    name: 'Sun Gecko',
    category: 'reptile',
    species: 'Phelsuma Aurum',
    unlockStage: 5,
    requiredScore: 5000,
    missionsWonRequired: 5,
    title: 'Solar Climber',
    description: 'Vibrant amber lizard with adhesive footpads that traverse tight labyrinth bends.',
    primaryColor: '#F59E0B',
    secondaryColor: '#B45309',
    glowColor: '#FBBF24',
    trailType: 'sparks',
    locomotionType: 'crawl',
  },
  {
    id: 'shadow-chameleon',
    name: 'Shadow Chameleon',
    category: 'reptile',
    species: 'Furcifer Umbra',
    unlockStage: 10,
    requiredScore: 12000,
    missionsWonRequired: 10,
    title: 'Void Shifter',
    description: 'Camouflaged reptile with an independent scanning gaze and prehensile tail coil.',
    primaryColor: '#8B5CF6',
    secondaryColor: '#5B21B6',
    glowColor: '#A78BFA',
    trailType: 'rings',
    locomotionType: 'crawl',
  },
  {
    id: 'coral-basilisk',
    name: 'Coral Basilisk',
    category: 'reptile',
    species: 'Basiliscus Ruber',
    unlockStage: 15,
    requiredScore: 22000,
    missionsWonRequired: 15,
    title: 'Tide Strider',
    description: 'Spined crimson runner with high-velocity stride across hazard thresholds.',
    primaryColor: '#F43F5E',
    secondaryColor: '#9F1239',
    glowColor: '#FB7185',
    trailType: 'embers',
    locomotionType: 'slither',
  },
  {
    id: 'obsidian-ouroboros',
    name: 'Obsidian Ouroboros',
    category: 'reptile',
    species: 'Wyrm Aeternus',
    unlockStage: 20,
    requiredScore: 35000,
    missionsWonRequired: 20,
    title: 'Infinite Serpent',
    description: 'Ancient draconic wyrm clad in volcanic armor plates, immune to cognitive disorientation.',
    primaryColor: '#E2E8F0',
    secondaryColor: '#334155',
    glowColor: '#38BDF8',
    trailType: 'stardust',
    locomotionType: 'slither',
  },
  {
    id: 'cosmic-wyvern',
    name: 'Cosmic Wyvern',
    category: 'reptile',
    species: 'Draco Solaris',
    unlockStage: 30,
    requiredScore: 70000,
    missionsWonRequired: 30,
    title: 'Astral Drake',
    description: 'Winged stellar serpent that charts planetary ley lines and magnetic currents.',
    primaryColor: '#38BDF8',
    secondaryColor: '#0369A1',
    glowColor: '#00F0FF',
    trailType: 'stardust',
    locomotionType: 'glide',
  },

  // 2. Insects
  {
    id: 'amber-scarab',
    name: 'Amber Scarab',
    category: 'insect',
    species: 'Scarabaeus Solis',
    unlockStage: 5,
    requiredScore: 6000,
    missionsWonRequired: 5,
    title: 'Gilded Vanguard',
    description: 'Heavy iridescent chitin carapace shielding against static labyrinth shockwaves.',
    primaryColor: '#EAB308',
    secondaryColor: '#854D0E',
    glowColor: '#FDE047',
    trailType: 'sparks',
    locomotionType: 'crawl',
  },
  {
    id: 'glow-firefly',
    name: 'Glow Firefly',
    category: 'insect',
    species: 'Photinus Lucis',
    unlockStage: 10,
    requiredScore: 14000,
    missionsWonRequired: 10,
    title: 'Lantern Pulse',
    description: 'Bioluminescent wanderer whose phosphorescent abdomen pierces the deepest fog-of-war.',
    primaryColor: '#84CC16',
    secondaryColor: '#3F6212',
    glowColor: '#A3E635',
    trailType: 'spores',
    locomotionType: 'flutter',
  },
  {
    id: 'plasma-dragonfly',
    name: 'Plasma Dragonfly',
    category: 'insect',
    species: 'Anax Electricus',
    unlockStage: 15,
    requiredScore: 24000,
    missionsWonRequired: 15,
    title: 'Aero Dart',
    description: 'Four counter-oscillating wings granting instantaneous zero-radius course correction.',
    primaryColor: '#06B6D4',
    secondaryColor: '#0E7490',
    glowColor: '#22D3EE',
    trailType: 'sparks',
    locomotionType: 'flutter',
  },
  {
    id: 'jade-mantis',
    name: 'Jade Mantis',
    category: 'insect',
    species: 'Hierodula Viridis',
    unlockStage: 20,
    requiredScore: 38000,
    missionsWonRequired: 20,
    title: 'Silent Scythe',
    description: 'Crystalline raptorial limbs carved from pure jadeite with surgical trajectory focus.',
    primaryColor: '#22C55E',
    secondaryColor: '#15803D',
    glowColor: '#4ADE80',
    trailType: 'spores',
    locomotionType: 'crawl',
  },
  {
    id: 'chrono-cicada',
    name: 'Chrono Cicada',
    category: 'insect',
    species: 'Magicicada Temporalis',
    unlockStage: 25,
    requiredScore: 50000,
    missionsWonRequired: 25,
    title: 'Time Resonator',
    description: 'Brass clockwork elytra that emit temporal acoustic pulses, extending reflex windows.',
    primaryColor: '#F59E0B',
    secondaryColor: '#78350F',
    glowColor: '#FCD34D',
    trailType: 'rings',
    locomotionType: 'flutter',
  },

  // 3. Butterflies & Moths
  {
    id: 'neon-monarch',
    name: 'Neon Monarch',
    category: 'butterfly',
    species: 'Danaus Lumina',
    unlockStage: 5,
    requiredScore: 7500,
    missionsWonRequired: 5,
    title: 'Solar Lepidopteran',
    description: 'Stained-glass stained wings charged with high-frequency harmonic energy.',
    primaryColor: '#FB923C',
    secondaryColor: '#C2410C',
    glowColor: '#FDBA74',
    trailType: 'stardust',
    locomotionType: 'flutter',
  },
  {
    id: 'lunar-moth',
    name: 'Lunar Moth',
    category: 'butterfly',
    species: 'Actias Selene',
    unlockStage: 10,
    requiredScore: 16000,
    missionsWonRequired: 10,
    title: 'Crescent Phantom',
    description: 'Silken emerald wings with trailing lunar ribbons that glide silently through obstacles.',
    primaryColor: '#6EE7B7',
    secondaryColor: '#065F46',
    glowColor: '#A7F3D0',
    trailType: 'spores',
    locomotionType: 'flutter',
  },
  {
    id: 'prismatic-papilio',
    name: 'Prismatic Papilio',
    category: 'butterfly',
    species: 'Papilio Iris',
    unlockStage: 15,
    requiredScore: 28000,
    missionsWonRequired: 15,
    title: 'Spectrum Sovereign',
    description: 'Micro-prism wing scales diffracting labyrinth light into iridescent optical mirages.',
    primaryColor: '#EC4899',
    secondaryColor: '#9D174D',
    glowColor: '#F472B6',
    trailType: 'stardust',
    locomotionType: 'flutter',
  },
  {
    id: 'singularity-moth',
    name: 'Singularity Moth',
    category: 'butterfly',
    species: 'Eventus Papilio',
    unlockStage: 35,
    requiredScore: 90000,
    missionsWonRequired: 35,
    title: 'Void Loom',
    description: 'Gravitational wings spun from condensed spacetime, drawing nearby photons into its wake.',
    primaryColor: '#C084FC',
    secondaryColor: '#4C1D95',
    glowColor: '#E9D5FF',
    trailType: 'rings',
    locomotionType: 'flutter',
  },

  // 4. Ethereal Winged Organisms
  {
    id: 'abyssal-void-ray',
    name: 'Abyssal Void Ray',
    category: 'ethereal',
    species: 'Manta Abyssus',
    unlockStage: 20,
    requiredScore: 40000,
    missionsWonRequired: 20,
    title: 'Deep Ether Wanderer',
    description: 'Pelagic phantom gliding through vacuum matrices with undulating bioluminescent fins.',
    primaryColor: '#38BDF8',
    secondaryColor: '#0C4A6E',
    glowColor: '#7DD3FC',
    trailType: 'stardust',
    locomotionType: 'glide',
  },
  {
    id: 'phoenix-sprite',
    name: 'Phoenix Sprite',
    category: 'ethereal',
    species: 'Ignis Volans',
    unlockStage: 25,
    requiredScore: 55000,
    missionsWonRequired: 25,
    title: 'Solar Emissary',
    description: 'Eternal avian wisp born from dying stars, shedding blazing embers of resurrection.',
    primaryColor: '#EF4444',
    secondaryColor: '#7F1D1D',
    glowColor: '#FCA5A5',
    trailType: 'embers',
    locomotionType: 'glide',
  },
  {
    id: 'celestial-wisp',
    name: 'Celestial Wisp',
    category: 'ethereal',
    species: 'Animus Astralis',
    unlockStage: 30,
    requiredScore: 80000,
    missionsWonRequired: 30,
    title: 'Star Core',
    description: 'Concentrated spark of universal consciousness surrounded by twin orbital plasma orbs.',
    primaryColor: '#67E8F9',
    secondaryColor: '#164E63',
    glowColor: '#A5F3FC',
    trailType: 'rings',
    locomotionType: 'hover',
  },
  {
    id: 'aurora-seraph',
    name: 'Aurora Seraph',
    category: 'ethereal',
    species: 'Seraphim Borealis',
    unlockStage: 40,
    requiredScore: 120000,
    missionsWonRequired: 40,
    title: 'Prismatic Archon',
    description: 'Six-winged herald of crystalline light radiating electromagnetic polar curtains.',
    primaryColor: '#F43F5E',
    secondaryColor: '#831843',
    glowColor: '#FDA4AF',
    trailType: 'stardust',
    locomotionType: 'glide',
  },
  {
    id: 'genesis-leviathan',
    name: 'Genesis Leviathan',
    category: 'ethereal',
    species: 'Primordius Rex',
    unlockStage: 40,
    title: 'Cosmic Architect',
    description: 'The primordial entity from which all maze dimensions were first woven. Ultimate mastery.',
    primaryColor: '#A855F7',
    secondaryColor: '#3B0764',
    glowColor: '#D8B4FE',
    trailType: 'rings',
    locomotionType: 'hover',
  },
];

/**
 * Dynamic Contrast Engine:
 * Evaluates the ambient mission background color and produces contrast-optimized
 * palettes for the creature avatar ensuring 100% crisp visibility against both
 * dark nebulae and pale parchment backgrounds.
 */
export function getAdaptedCreatureColors(
  creature: CreatureDefinition,
  bgHex: string
): {
  primary: string;
  secondary: string;
  glow: string;
  outline: string;
  isDarkBg: boolean;
  filter: string;
} {
  // Convert hex to relative luminance
  const cleanHex = bgHex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2) || '0', 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4) || '0', 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6) || '0', 16) / 255;

  // Standard luminance formula
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const isDarkBg = luminance < 0.38;

  if (isDarkBg) {
    // Dark background: use hyper-vibrant glowing hues with intense drop-shadow
    return {
      primary: creature.primaryColor,
      secondary: creature.secondaryColor,
      glow: creature.glowColor,
      outline: 'rgba(255, 255, 255, 0.4)',
      isDarkBg: true,
      filter: `drop-shadow(0 0 8px ${creature.glowColor}) drop-shadow(0 0 16px ${creature.primaryColor}88)`,
    };
  } else {
    // Light background: boost contrast with deep saturated jewel tones and dark outline
    return {
      primary: creature.secondaryColor,
      secondary: '#0F172A',
      glow: creature.primaryColor,
      outline: '#0F172A',
      isDarkBg: false,
      filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.45))',
    };
  }
}

export function getCreatureUnlockedAtStage(stage: number): CreatureDefinition | undefined {
  return CREATURES.find((c) => c.unlockStage === stage);
}

export function getCreatureUnlockedAtMilestone(
  stagesCleared: number,
  score: number,
  unlockedIds: string[]
): CreatureDefinition | undefined {
  return CREATURES.find((c) => {
    if (unlockedIds.includes(c.id)) return false;
    const meetsStage = stagesCleared >= (c.missionsWonRequired ?? c.unlockStage);
    const meetsScore = c.requiredScore ? score >= c.requiredScore : true;
    return meetsStage && meetsScore;
  });
}
