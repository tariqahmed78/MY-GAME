import React from 'react';
import { X, Volume2, VolumeX, Smartphone, Sparkles, CheckCircle2, Compass } from 'lucide-react';
import { ThemeConfig, LevelSilhouette } from '../types';
import { PRESET_LEVELS, generateSolvableSingleTargetMaze } from '../levels';

interface SettingsModalProps {
  currentTheme: ThemeConfig;
  currentLevelId: number;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  tutorialEnabled: boolean;
  completedLevels: number[];
  onToggleSound: () => void;
  onToggleHaptics: () => void;
  onToggleTutorial: () => void;
  onSelectLevel: (level: LevelSilhouette) => void;
  onGenerateLevel: (shape: 'rect' | 'heart' | 'diamond' | 'hourglass') => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  currentTheme,
  currentLevelId,
  soundEnabled,
  hapticsEnabled,
  tutorialEnabled,
  completedLevels,
  onToggleSound,
  onToggleHaptics,
  onToggleTutorial,
  onSelectLevel,
  onGenerateLevel,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
      <div
        className="w-full max-w-md rounded-3xl p-6 shadow-2xl transition-all max-h-[88vh] flex flex-col border"
        style={{
          backgroundColor: currentTheme.surface || '#1E293B',
          color: currentTheme.textPrimary || '#F8FAFC',
          borderColor: currentTheme.uiBorder || 'rgba(255, 255, 255, 0.12)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h2 className="text-xl font-bold">Game Settings</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto space-y-5 pr-1 mt-3">
          {/* Audio & Haptic Toggles */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider opacity-60">Audio & Haptics</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onToggleSound}
                className="p-3 rounded-2xl flex items-center justify-between border border-black/10 transition-all"
                style={{ backgroundColor: soundEnabled ? currentTheme.bannerBg : 'transparent' }}
              >
                <div className="flex items-center gap-2 text-sm font-semibold">
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 opacity-50" />}
                  Sound FX
                </div>
                <div
                  className={`w-3 h-3 rounded-full ${soundEnabled ? 'bg-emerald-500' : 'bg-neutral-300'}`}
                />
              </button>

              <button
                onClick={onToggleHaptics}
                className="p-3 rounded-2xl flex items-center justify-between border border-black/10 transition-all"
                style={{ backgroundColor: hapticsEnabled ? currentTheme.bannerBg : 'transparent' }}
              >
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Smartphone className="w-4 h-4" />
                  Vibration
                </div>
                <div
                  className={`w-3 h-3 rounded-full ${hapticsEnabled ? 'bg-emerald-500' : 'bg-neutral-300'}`}
                />
              </button>
            </div>

            <button
              onClick={onToggleTutorial}
              className="w-full p-3 rounded-2xl flex items-center justify-between border border-black/10 transition-all"
              style={{ backgroundColor: tutorialEnabled ? currentTheme.bannerBg : 'transparent' }}
            >
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Show Tap-to-Escape Hand Helper</span>
              </div>
              <div
                className={`w-3 h-3 rounded-full ${tutorialEnabled ? 'bg-emerald-500' : 'bg-neutral-300'}`}
              />
            </button>
          </div>

          {/* Screenshot Preset Levels */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider opacity-60 mb-2">
              Featured Levels (From Google Play)
            </div>
            <div className="grid grid-cols-1 gap-2">
              {PRESET_LEVELS.map((level) => {
                const isCurrent = level.id === currentLevelId;
                const isCompleted = completedLevels.includes(level.id);

                return (
                  <button
                    key={level.id}
                    onClick={() => {
                      onSelectLevel(level);
                      onClose();
                    }}
                    className={`w-full p-3 rounded-2xl flex items-center justify-between border-2 transition-all ${
                      isCurrent
                        ? 'border-emerald-500 shadow-sm scale-[1.01]'
                        : 'border-black/10 hover:border-black/20'
                    }`}
                    style={{ backgroundColor: isCurrent ? currentTheme.bannerBg : 'transparent' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-bold text-sm border border-white/10">
                        {level.id}
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-sm flex items-center gap-1.5">
                          <span>{level.name}</span>
                          {level.shapeName && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300 font-bold uppercase">
                              {level.shapeName}
                            </span>
                          )}
                        </div>
                        <div className="text-xs opacity-65 italic font-medium">{level.subtitle}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {level.timeLimit && (
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-300 border border-red-500/20">
                          {level.timeLimit}s
                        </span>
                      )}
                      {level.difficulty && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/20 uppercase">
                          {level.difficulty}
                        </span>
                      )}
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/5">
                        {level.arrows.length} arrows
                      </span>
                      {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Endless Procedural Generator */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider opacity-60 mb-2">
              Endless Zen & Maze Generators
            </div>
            {/* 1-Path Procedural Maze with Static Walls */}
            <button
              onClick={() => {
                const maze = generateSolvableSingleTargetMaze(100);
                onSelectLevel(maze);
                onClose();
              }}
              className="w-full mb-2 p-3 rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/10 text-xs font-bold flex items-center justify-between hover:bg-emerald-500/20 active:scale-98 transition-all"
            >
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Compass className="w-4 h-4" />
                <span>Generate Solvable 2D Maze (1-Path Guarantee)</span>
              </div>
              <Sparkles className="w-4 h-4 text-emerald-500" />
            </button>

            <div className="grid grid-cols-2 gap-2">
              {(['rect', 'diamond', 'hourglass', 'heart'] as const).map((shape) => (
                <button
                  key={shape}
                  onClick={() => {
                    onGenerateLevel(shape);
                    onClose();
                  }}
                  className="p-3 rounded-2xl border border-black/10 text-xs font-bold capitalize hover:bg-black/5 active:scale-95 transition-all text-center"
                >
                  Generate {shape}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <button
          onClick={onClose}
          className="mt-4 w-full py-3 rounded-xl font-semibold transition-all active:scale-98"
          style={{ backgroundColor: currentTheme.bannerBg, color: currentTheme.bannerText }}
        >
          Close
        </button>
      </div>
    </div>
  );
};
