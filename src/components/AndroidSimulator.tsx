import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Sparkles,
  BookOpen,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { ArrowDefinition, LevelSilhouette, ThemeConfig, GridPoint, CreatureDefinition, RoguelikeRunState } from '../types';
import {
  buildGridMatrixForLevel,
  checkRayClearance,
} from '../levels';
import { CREATURES, getCreatureUnlockedAtMilestone } from '../creatures';
import {
  buildMazeForArchitecture,
  getRandomArchitectureForStage,
} from '../mazeArchitectures';
import { generateDynamicThemeForMission } from '../themes';
import { sounds } from '../audio';
import { ArrowCanvas } from './ArrowCanvas';
import { MinimalistHUD } from './MinimalistHUD';
import { PermadeathModal } from './PermadeathModal';
import { CreatureCodexModal } from './CreatureCodexModal';
import { EvolutionBanner } from './EvolutionBanner';
import { StartupMenu } from './StartupMenu';
import { ShapeSelectModal } from './ShapeSelectModal';
import { ThemeModal } from './ThemeModal';
import { RulesModal } from './RulesModal';
import { CelebrationOverlay, CELEBRATION_WORDS } from './CelebrationOverlay';

interface AndroidSimulatorProps {
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  musicEnabled: boolean;
  setMusicEnabled: (val: boolean) => void;
  hapticsEnabled: boolean;
  setHapticsEnabled: (val: boolean) => void;
  gridEnabled: boolean;
  setGridEnabled: (val: boolean) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (val: boolean) => void;
}

export const AndroidSimulator: React.FC<AndroidSimulatorProps> = ({
  soundEnabled,
  setSoundEnabled,
  hapticsEnabled,
}) => {
  // 0. Main Menu State (Startup Menu restored)
  const [showStartupMenu, setShowStartupMenu] = useState<boolean>(true);
  const [isShapeModalOpen, setIsShapeModalOpen] = useState<boolean>(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState<boolean>(false);
  const [customTheme, setCustomTheme] = useState<ThemeConfig | null>(null);

  // 1. Roguelike Run Persistent State
  const [stage, setStage] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('arrow_escape_high_score');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });
  const [combo, setCombo] = useState<number>(1);
  const [maxCombo, setMaxCombo] = useState<number>(1);
  const [stagesCleared, setStagesCleared] = useState<number>(0);
  const [runDurationSeconds, setRunDurationSeconds] = useState<number>(0);
  const [unlockedCreatures, setUnlockedCreatures] = useState<string[]>([CREATURES[0].id]);
  const [activeCreature, setActiveCreature] = useState<CreatureDefinition>(CREATURES[0]);

  // Randomized sequence seed offset per run for varied architecture orders
  const [runSeedOffset, setRunSeedOffset] = useState<number>(() => Math.floor(Math.random() * 40));

  // 2. Modals & Notifications
  const [isPermadeathModalOpen, setIsPermadeathModalOpen] = useState<boolean>(false);
  const [isCodexModalOpen, setIsCodexModalOpen] = useState<boolean>(false);
  const [evolutionBannerCreature, setEvolutionBannerCreature] = useState<CreatureDefinition | null>(null);

  // 3. Black-Hole Singularity Transition & Big Text Celebration Animation
  const [isWarping, setIsWarping] = useState<boolean>(false);
  const [warpProgress, setWarpProgress] = useState<number>(0);
  const [recentScoreGain, setRecentScoreGain] = useState<{ amount: number; combo: number } | null>(null);

  const [celebrationState, setCelebrationState] = useState<{
    isVisible: boolean;
    word: string;
    points: number;
    combo: number;
  }>({
    isVisible: false,
    word: 'AWESOME!',
    points: 0,
    combo: 1,
  });

  // 4. Viewport Layout (Defaults to Borderless Full-Screen Canvas!)
  const [isFullScreen, setIsFullScreen] = useState<boolean>(true);
  const [zoomScale, setZoomScale] = useState<number>(1);

  // 5. Active Maze Level & Environment Theme
  const isPressureStage = useMemo(() => stage % 5 === 0, [stage]);

  const currentArch = useMemo(() => {
    return getRandomArchitectureForStage(stage, runSeedOffset);
  }, [stage, runSeedOffset]);

  const currentLevel = useMemo(() => {
    return buildMazeForArchitecture(currentArch, stage);
  }, [currentArch, stage]);

  const dynamicTheme = useMemo(() => {
    return generateDynamicThemeForMission(stage, currentArch.category, isPressureStage);
  }, [stage, currentArch.category, isPressureStage]);

  const currentTheme = customTheme || dynamicTheme;

  // 6. Fog of War disabled (No dark or obscured missions - all mazes crystal clear and luminous)
  const fogOfWarEnabled = false;

  // 7. Mission Countdown Timer
  const [timeLeft, setTimeLeft] = useState<number>(currentLevel.timeLimit || 60);

  // 8. Dynamic Arrow & Obstacle Interaction State
  const [escapedArrowIds, setEscapedArrowIds] = useState<Set<string>>(new Set());
  const [escapingPaths, setEscapingPaths] = useState<Record<string, GridPoint[]>>({});
  const [blockedArrowId, setBlockedArrowId] = useState<string | null>(null);
  const [blockingArrowId, setBlockingArrowId] = useState<string | null>(null);
  const [blockedObstacleCoord, setBlockedObstacleCoord] = useState<GridPoint | null>(null);
  const [hintedArrowId, setHintedArrowId] = useState<string | null>(null);

  // Sync timer when level changes
  useEffect(() => {
    setTimeLeft(currentLevel.timeLimit || 60);
    setEscapedArrowIds(new Set());
    setEscapingPaths({});
    setBlockedArrowId(null);
    setBlockingArrowId(null);
    setBlockedObstacleCoord(null);
    setHintedArrowId(null);
    setIsPermadeathModalOpen(false);
  }, [currentLevel]);

  // Keep permadeath closed while in main menu
  useEffect(() => {
    if (showStartupMenu) {
      setIsPermadeathModalOpen(false);
      setTimeLeft(currentLevel.timeLimit || 60);
    }
  }, [showStartupMenu, currentLevel.timeLimit]);

  // 9. Mission Timer Countdown Effect (PAUSED when in Main Menu, Warping, or Modal)
  useEffect(() => {
    // Never run countdown while in main menu, modal, or transitioning
    if (showStartupMenu || isPermadeathModalOpen || isWarping) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        // Double guard: if menu or modal opened, do not decrement or fail
        if (showStartupMenu || isPermadeathModalOpen || isWarping) {
          return currentLevel.timeLimit || 60;
        }

        if (prev <= 1) {
          // Permadeath trigger only during active gameplay!
          sounds.playPermadeath(soundEnabled);
          sounds.vibrate(hapticsEnabled, 300);
          setIsPermadeathModalOpen(true);
          // Save high score if beaten
          setHighScore((curHigh) => {
            const nextHigh = Math.max(curHigh, score);
            try {
              localStorage.setItem('arrow_escape_high_score', nextHigh.toString());
            } catch {}
            return nextHigh;
          });
          return 0;
        }

        // Heartbeat tick when under 10 seconds during active gameplay
        if (prev <= 10) {
          sounds.playTimerTick(soundEnabled, true);
        } else if (prev % 10 === 0) {
          sounds.playTimerTick(soundEnabled, false);
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showStartupMenu, isPermadeathModalOpen, isWarping, soundEnabled, hapticsEnabled, score, currentLevel.timeLimit]);

  // Run duration timer (PAUSED when in Main Menu)
  useEffect(() => {
    if (showStartupMenu || isPermadeathModalOpen || isWarping) return;
    const durTimer = setInterval(() => {
      setRunDurationSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(durTimer);
  }, [showStartupMenu, isPermadeathModalOpen, isWarping]);

  // Derived 2D grid matrix
  const levelGridMatrix = useMemo(() => {
    return currentLevel.gridMatrix || buildGridMatrixForLevel(currentLevel);
  }, [currentLevel]);

  // 10. Automated Black-Hole Vortex Transition to Next Stage with Celebrations
  const handleStageCompleted = useCallback(() => {
    if (isWarping) return;

    // Calculate score points:
    // Base stage points + remaining time bonus * combo multiplier * pressure multiplier
    const basePts = 1000 * stage;
    const timeBonus = Math.max(0, timeLeft) * 45;
    const multiplier = isPressureStage ? 2.5 : 1 + stage * 0.1;
    const earned = Math.floor((basePts + timeBonus) * combo * multiplier);

    let nextScore = score + earned;
    setScore((prev) => {
      nextScore = prev + earned;
      setHighScore((curHigh) => {
        const nextHigh = Math.max(curHigh, nextScore);
        try {
          localStorage.setItem('arrow_escape_high_score', nextHigh.toString());
        } catch {}
        return nextHigh;
      });
      return nextScore;
    });

    setRecentScoreGain({ amount: earned, combo });
    setTimeout(() => setRecentScoreGain(null), 1800);

    // Big Celebratory Text Animation ("AWESOME", "BRAVO", "AMAZING", "WOW") & Sound Effect!
    const randomCelebration = CELEBRATION_WORDS[Math.floor(Math.random() * CELEBRATION_WORDS.length)];
    setCelebrationState({
      isVisible: true,
      word: randomCelebration,
      points: earned,
      combo,
    });
    sounds.playCelebrationWord(soundEnabled, randomCelebration);
    setTimeout(() => {
      setCelebrationState((prev) => ({ ...prev, isVisible: false }));
    }, 1600);

    // Trigger vortex warp sound & haptic pulse
    sounds.playVortexWarp(soundEnabled);
    sounds.vibrate(hapticsEnabled, 80);

    // Advance combo & stages cleared count
    setCombo((c) => {
      const nextC = Math.min(10, c + 1);
      setMaxCombo((m) => Math.max(m, nextC));
      return nextC;
    });
    const newStagesCleared = stagesCleared + 1;
    setStagesCleared(newStagesCleared);

    // Controlled Creature Unlock:
    // Arrows do NOT change randomly or too often; they unlock ONLY after winning milestone missions
    // and reaching score thresholds. The active avatar stays stable unless user chooses to morph!
    const newEvolution = getCreatureUnlockedAtMilestone(newStagesCleared, nextScore, unlockedCreatures);
    if (newEvolution && !unlockedCreatures.includes(newEvolution.id)) {
      setUnlockedCreatures((prev) => [...prev, newEvolution.id]);
      setEvolutionBannerCreature(newEvolution);
      sounds.playEvolutionUnlocked(soundEnabled);
    }

    // Begin visual Black-Hole singularity warping sequence
    setIsWarping(true);
    setWarpProgress(0);

    let progress = 0;
    const nextStage = stage + 1;
    const interval = setInterval(() => {
      progress += 0.05;
      setWarpProgress(Math.min(1, progress));
      if (progress >= 1) {
        clearInterval(interval);
        // Transition directly to the next procedural stage seamlessly
        setStage(nextStage);
        setIsWarping(false);
        setWarpProgress(0);
      }
    }, 38);
  }, [
    isWarping,
    soundEnabled,
    hapticsEnabled,
    stage,
    score,
    timeLeft,
    isPressureStage,
    combo,
    stagesCleared,
    unlockedCreatures,
  ]);

  // Handle arrow interaction (tap or drag-drop reach exit)
  const handleTapArrow = useCallback(
    (arrow: ArrowDefinition) => {
      if (escapedArrowIds.has(arrow.id) || isWarping) return;

      const clearance = checkRayClearance(
        arrow,
        currentLevel.arrows.filter((a) => !escapedArrowIds.has(a.id)),
        {
          width: currentLevel.gridWidth,
          height: currentLevel.gridHeight,
        },
        currentLevel.obstacles || [],
        levelGridMatrix,
        currentLevel.exitPoint
      );

      if (clearance.canEscape) {
        // Trigger automated vortex exit
        handleStageCompleted();
      } else {
        // Blocked collision
        sounds.playBlocked(soundEnabled);
        sounds.vibrate(hapticsEnabled, 45);
        setBlockedArrowId(arrow.id);
        if (clearance.blockerType === 'obstacle' && clearance.obstacleCoord) {
          setBlockedObstacleCoord(clearance.obstacleCoord);
        } else if (clearance.blockerId) {
          setBlockingArrowId(clearance.blockerId);
        }

        setTimeout(() => {
          setBlockedArrowId(null);
          setBlockingArrowId(null);
          setBlockedObstacleCoord(null);
        }, 360);
      }
    },
    [
      escapedArrowIds,
      isWarping,
      currentLevel,
      levelGridMatrix,
      handleStageCompleted,
      soundEnabled,
      hapticsEnabled,
    ]
  );

  // Wall collision feedback during touch dragging
  const handleWallCollision = useCallback(
    (coord: GridPoint) => {
      sounds.playBlocked(soundEnabled);
      sounds.vibrate(hapticsEnabled, 35);
      setBlockedObstacleCoord(coord);
      setTimeout(() => {
        setBlockedObstacleCoord(null);
      }, 300);
    },
    [soundEnabled, hapticsEnabled]
  );

  // 11. Permadeath Reset Action
  const handleResetToLevel1 = useCallback(() => {
    setIsPermadeathModalOpen(false);
    setStage(1);
    setTimeLeft(currentLevel.timeLimit || 60);
    setScore(0);
    setCombo(1);
    setStagesCleared(0);
    setRunDurationSeconds(0);
    setIsWarping(false);
    setWarpProgress(0);
    // Re-randomize run theme and layout order
    setRunSeedOffset(Math.floor(Math.random() * 50));
    sounds.playVictory(soundEnabled);
  }, [soundEnabled, currentLevel.timeLimit]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative select-none">
      {/* Quick Viewport Utilities (Fullscreen / Bezel Toggle, Zoom) */}
      <div className="w-full max-w-5xl flex items-center justify-between px-3 py-1.5 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-300 tracking-tight flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Roguelike Run:
          </span>
          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-purple-300 font-semibold border border-purple-500/30">
            {currentArch.name}
          </span>
          {isPressureStage && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 text-[10px]">
              BONUS STAGE x2.5
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Main Menu Button */}
          <button
            onClick={() => {
              setIsPermadeathModalOpen(false);
              setTimeLeft(currentLevel.timeLimit || 60);
              setShowStartupMenu(!showStartupMenu);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1 text-xs font-semibold cursor-pointer"
            title="Toggle Main Menu"
          >
            <span>{showStartupMenu ? 'Resume Run' : 'Main Menu'}</span>
          </button>

          <button
            onClick={() => setIsCodexModalOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            title="Open Creature Evolution Codex"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Codex</span>
            <span className="text-[10px] bg-slate-700 px-1.5 py-0.2 rounded-full text-amber-300">
              {unlockedCreatures.length}
            </span>
          </button>

          <button
            onClick={() => setZoomScale((z) => Math.max(0.8, z - 0.1))}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomScale((z) => Math.min(1.4, z + 0.1))}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1 text-xs cursor-pointer"
            title="Toggle Borderless Full-Screen Canvas vs Mobile Bezel"
          >
            {isFullScreen ? <Minimize2 className="w-3.5 h-3.5 text-sky-400" /> : <Maximize2 className="w-3.5 h-3.5 text-sky-400" />}
            <span className="hidden sm:inline">{isFullScreen ? 'Mobile View' : 'Full Canvas'}</span>
          </button>
        </div>
      </div>

      {/* Main Game Container: Defaulting to Borderless Full-Screen Canvas */}
      <div
        id="game-viewport"
        className={`relative transition-all duration-300 overflow-hidden flex flex-col justify-between ${
          isFullScreen
            ? 'w-full max-w-5xl h-[88vh] sm:h-[90vh] rounded-2xl shadow-2xl border border-slate-800/80'
            : 'w-[360px] sm:w-[390px] h-[740px] sm:h-[780px] rounded-[48px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border-[10px] border-neutral-900 ring-1 ring-white/10'
        }`}
        style={{
          backgroundColor: currentTheme.bg,
          color: currentTheme.bannerText,
        }}
      >
        {/* Startup Main Menu */}
        {showStartupMenu ? (
          <StartupMenu
            onStartGame={() => setShowStartupMenu(false)}
            onOpenShapeSelection={() => setIsShapeModalOpen(true)}
            onOpenLevelSelector={() => setIsShapeModalOpen(true)}
            onOpenThemeModal={() => setIsThemeModalOpen(true)}
            onStartTimeAttack={() => {
              setTimeLeft(45);
              setShowStartupMenu(false);
            }}
            currentTheme={currentTheme}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled(!soundEnabled)}
            bestStreak={stagesCleared}
            currentLevelId={stage}
            onOpenRules={() => setIsRulesModalOpen(true)}
          />
        ) : (
          <>
            {/* Minimalist Floating Roguelike HUD (No intrusive bottom labels or level menus) */}
            <MinimalistHUD
              stage={stage}
              score={score}
              combo={combo}
              timeLeft={timeLeft}
              timeLimit={currentLevel.timeLimit || 60}
              isPressureStage={isPressureStage}
              activeCreature={activeCreature}
              soundEnabled={soundEnabled}
              onToggleSound={() => setSoundEnabled(!soundEnabled)}
              onOpenCodex={() => setIsCodexModalOpen(true)}
              onOpenMenu={() => setShowStartupMenu(true)}
              recentPointsEarned={recentScoreGain?.amount ?? null}
            />

            {/* Floating Recent Score Gained Animation */}
            {recentScoreGain && (
              <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-bounce">
                <div className="px-3.5 py-1 rounded-full bg-amber-500/90 text-slate-950 font-black text-sm shadow-xl flex items-center gap-1.5 border border-amber-300">
                  <span>+{recentScoreGain.amount.toLocaleString()}</span>
                  {recentScoreGain.combo > 1 && (
                    <span className="text-xs bg-slate-900 text-amber-300 px-1.5 py-0.5 rounded-full">
                      x{recentScoreGain.combo}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Center Maze Arena Canvas */}
            <div
              className="flex-1 w-full flex items-center justify-center p-2 sm:p-4 overflow-hidden relative transition-transform duration-150"
              style={{ transform: `scale(${zoomScale})` }}
            >
              <ArrowCanvas
                levelId={currentLevel.id}
                gridWidth={currentLevel.gridWidth}
                gridHeight={currentLevel.gridHeight}
                arrows={currentLevel.arrows}
                obstacles={currentLevel.obstacles || []}
                gridMatrix={levelGridMatrix}
                startPoint={currentLevel.startPoint}
                exitPoint={currentLevel.exitPoint}
                isSingleTargetMaze={true}
                escapedArrowIds={escapedArrowIds}
                escapingPaths={escapingPaths}
                theme={currentTheme}
                onTapArrow={handleTapArrow}
                onDragReachExit={handleStageCompleted}
                onWallCollision={handleWallCollision}
                blockedArrowId={blockedArrowId}
                blockingArrowId={blockingArrowId}
                blockedObstacleCoord={blockedObstacleCoord}
                hintedArrowId={hintedArrowId}
                showTutorialHand={stage === 1 && !isWarping}
                tutorialArrowId={currentLevel.arrows[0]?.id}
                activeCreature={activeCreature}
                isWarping={isWarping}
                warpProgress={warpProgress}
                fogOfWarEnabled={fogOfWarEnabled}
                isPressureStage={isPressureStage}
              />
            </div>

            {/* Evolution Unlock Notification Banner */}
            <EvolutionBanner
              creature={evolutionBannerCreature}
              onMorphNow={() => {
                if (evolutionBannerCreature) {
                  setActiveCreature(evolutionBannerCreature);
                  sounds.playTap(soundEnabled);
                }
                setEvolutionBannerCreature(null);
              }}
              onDismiss={() => setEvolutionBannerCreature(null)}
            />
          </>
        )}

        {/* Big Celebratory Text Animation ("AWESOME", "BRAVO", "AMAZING", "WOW") */}
        <CelebrationOverlay
          isVisible={celebrationState.isVisible}
          word={celebrationState.word}
          pointsEarned={celebrationState.points}
          combo={celebrationState.combo}
        />
      </div>

      {/* Permadeath Run Concluded Modal */}
      <PermadeathModal
        isOpen={isPermadeathModalOpen}
        score={score}
        highScore={highScore}
        stagesCleared={stagesCleared}
        maxCombo={maxCombo}
        runDurationSeconds={runDurationSeconds}
        activeCreature={activeCreature}
        unlockedCount={unlockedCreatures.length}
        totalCreatures={CREATURES.length}
        onRestartRun={handleResetToLevel1}
        onReturnToMenu={() => {
          setIsPermadeathModalOpen(false);
          setShowStartupMenu(true);
        }}
      />

      {/* Creature Evolution Codex Modal */}
      <CreatureCodexModal
        isOpen={isCodexModalOpen}
        onClose={() => setIsCodexModalOpen(false)}
        unlockedCreatureIds={unlockedCreatures}
        activeCreatureId={activeCreature.id}
        onSelectCreature={(creature) => {
          setActiveCreature(creature);
          sounds.playTap(soundEnabled);
        }}
        currentStage={stage}
      />

      {/* Shape Levels Modal */}
      <ShapeSelectModal
        isOpen={isShapeModalOpen}
        onClose={() => setIsShapeModalOpen(false)}
        onSelectLevel={() => {
          setIsShapeModalOpen(false);
          setShowStartupMenu(false);
        }}
        currentTheme={currentTheme}
        selectedLevelId={stage}
      />

      {/* Theme Selection Modal */}
      {isThemeModalOpen && (
        <ThemeModal
          currentTheme={currentTheme}
          onSelectTheme={(th) => {
            setCustomTheme(th);
            setIsThemeModalOpen(false);
          }}
          onClose={() => setIsThemeModalOpen(false)}
        />
      )}

      {/* Expedition Rules / Guide Modal */}
      <RulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
        currentTheme={currentTheme}
      />
    </div>
  );
};
