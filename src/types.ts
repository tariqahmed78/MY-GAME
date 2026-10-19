export type ArrowDirection = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export enum CellType {
  EMPTY = 0,    // Void non-walkable space
  PATH = 1,     // Walkable corridor path tile
  OBSTACLE = 2, // Static wall / obstacle cell
}

export interface GridPoint {
  x: number;
  y: number;
}

export interface ArrowDefinition {
  id: string;
  points: GridPoint[]; // Path from tail to head
  direction: ArrowDirection; // Heading of the arrowhead at the final point
  color?: string; // Optional custom color
}

export interface ActiveArrowState extends ArrowDefinition {
  status: 'idle' | 'escaping' | 'blocked' | 'hinted';
  escapeProgress?: number; // 0 to 1 during escape animation
  offset?: { x: number; y: number }; // For blocked nudge bounce
}

export interface LevelSilhouette {
  id: number;
  name: string;
  subtitle: string; // e.g. "Tap to Escape", "Relax & Solve", "Brain Boost", "Mindful Moves"
  shapeType: 'rect' | 'fingerprint' | 'castle' | 'hourglass' | 'cross' | 'diamond' | 'heart' | 'procedural' | 'maze' | 'sunflower' | 'pyramid' | 'crown' | 'star';
  gridWidth: number;
  gridHeight: number;
  arrows: ArrowDefinition[];
  obstacles: GridPoint[]; // Formal 2D grid static obstacles (stone pillars / barriers)
  gridMatrix?: number[][]; // 2D integer matrix (0 = empty, 1 = path, 2 = obstacle)
  startPoint?: GridPoint; // Start tile of single target maze
  exitPoint?: GridPoint;  // Single exit point of maze
  isSingleTargetMaze?: boolean;
  timeLimit?: number; // Time in seconds for time attack missions (e.g. 60, 90, 120, 150)
  difficulty?: 'Normal' | 'Hard' | 'Expert' | 'Insane';
  shapeName?: string;
}

export interface MazeEscapeResult {
  canEscape: boolean;
  escapePath?: GridPoint[]; // Waypoint path navigating through open corridors around obstacles
  blockerType?: 'obstacle' | 'arrow';
  blockerId?: string;
  obstacleCoord?: GridPoint;
}

export interface ThemeConfig {
  id: string;
  name: string;
  subtitle?: string;
  category?: 'neon' | 'luxe' | 'classic' | 'nature' | 'cyber';
  bg: string;
  surface?: string;
  textPrimary?: string;
  textSecondary?: string;
  uiBorder?: string;
  backgroundGradientStart?: string;
  backgroundGradientEnd?: string;
  cardBg: string;
  bannerBg: string;
  bannerText: string;
  topBarText: string;
  arrowStroke: string;
  arrowHead: string;
  arrowBlocked: string;
  arrowEscaping: string;
  hintGlow: string;
  shadow: string;
  obstacleFill: string;
  obstacleBorder: string;
  obstacleDetail: string;
  obstacleGlow: string;
  corridorDot: string;
  accentColor: string;
  portalGlow: string;
  timerColor: string;
  blockGradientStart: string;
  blockGradientEnd: string;
  blockSpecular: string;
}

export interface PlayerStats {
  completedLevels: number[];
  totalEscaped: number;
  hintsUsed: number;
}

export type CreatureCategory = 'reptile' | 'insect' | 'butterfly' | 'ethereal';

export interface CreatureDefinition {
  id: string;
  name: string;
  category: CreatureCategory;
  unlockStage: number; // Milestone stage cleared required
  requiredScore?: number; // Minimum accumulated score required
  missionsWonRequired?: number; // Number of missions won needed
  title: string;
  species: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  trailType: 'sparks' | 'spores' | 'stardust' | 'embers' | 'rings';
  locomotionType: 'slither' | 'crawl' | 'flutter' | 'glide' | 'hover';
}

export interface RoguelikeRunState {
  stage: number;
  score: number;
  highScore: number;
  combo: number;
  maxCombo: number;
  stagesCleared: number;
  runStartTime: number;
  isPressureStage: boolean;
  fogOfWarEnabled: boolean;
  unlockedCreatureIds: string[];
  activeCreatureId: string;
  isGameOver: boolean;
  isWarping: boolean;
}

export interface MazeArchitecture {
  id: string;
  name: string;
  category: string;
  description: string;
  minStage: number;
  shapeMask: (nx: number, ny: number, x: number, y: number, w: number, h: number) => boolean;
  defaultDifficulty?: 'Normal' | 'Hard' | 'Expert' | 'Insane';
}
