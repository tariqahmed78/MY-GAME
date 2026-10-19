import React from 'react';
import { Skull, RotateCcw, Trophy, Sparkles, Clock, Zap } from 'lucide-react';
import { CreatureDefinition } from '../types';

interface PermadeathModalProps {
  isOpen: boolean;
  score: number;
  highScore: number;
  stagesCleared: number;
  maxCombo: number;
  runDurationSeconds: number;
  activeCreature: CreatureDefinition;
  unlockedCount: number;
  totalCreatures: number;
  onRestartRun: () => void;
  onReturnToMenu?: () => void;
}

export const PermadeathModal: React.FC<PermadeathModalProps> = ({
  isOpen,
  score,
  highScore,
  stagesCleared,
  maxCombo,
  runDurationSeconds,
  activeCreature,
  unlockedCount,
  totalCreatures,
  onRestartRun,
  onReturnToMenu,
}) => {
  if (!isOpen) return null;

  const isNewHighScore = score > 0 && score >= highScore;
  const minutes = Math.floor(runDurationSeconds / 60);
  const seconds = runDurationSeconds % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-rose-900/60 rounded-2xl shadow-2xl p-6 flex flex-col items-center text-center relative overflow-hidden">
        {/* Ambient Crimson Warning Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Skull Emblem */}
        <div className="w-16 h-16 rounded-2xl bg-rose-950/70 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-4 shadow-lg ring-2 ring-rose-500/20 animate-pulse">
          <Skull className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-black text-white tracking-tight uppercase">
          Run Concluded
        </h2>
        <p className="text-xs text-rose-300/80 mt-1 max-w-xs">
          Your journey in the labyrinth has collapsed. All progress resets to Stage 1.
        </p>

        {/* Main Score Showcase */}
        <div className="w-full my-5 p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col items-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Final Score
          </span>
          <span className="text-3xl font-black text-amber-400 tabular-nums tracking-tight mt-0.5">
            {score.toLocaleString()}
          </span>

          {isNewHighScore && (
            <div className="flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black tracking-wider uppercase">
              <Trophy className="w-3 h-3" /> New Personal Best!
            </div>
          )}
        </div>

        {/* Run Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5 w-full text-left mb-6">
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Stages Cleared</span>
            </div>
            <p className="text-base font-extrabold text-white mt-1">
              {stagesCleared}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Max Combo</span>
            </div>
            <p className="text-base font-extrabold text-white mt-1">
              {maxCombo}x
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>Time Survived</span>
            </div>
            <p className="text-base font-extrabold text-white mt-1 font-mono">
              {minutes}m {seconds}s
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Codex Unlocks</span>
            </div>
            <p className="text-base font-extrabold text-white mt-1">
              {unlockedCount} / {totalCreatures}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full">
          <button
            onClick={onRestartRun}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-sm tracking-wider uppercase shadow-lg shadow-emerald-900/30 transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Embark on New Run</span>
          </button>

          {onReturnToMenu && (
            <button
              onClick={onReturnToMenu}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs tracking-wider uppercase transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <span>Return to Main Menu</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
