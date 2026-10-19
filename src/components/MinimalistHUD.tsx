import React from 'react';
import { Sparkles, Zap, Volume2, VolumeX, ShieldAlert, BookOpen, Home } from 'lucide-react';
import { CreatureDefinition } from '../types';

interface MinimalistHUDProps {
  stage: number;
  score: number;
  combo: number;
  timeLeft: number;
  timeLimit: number;
  isPressureStage: boolean;
  activeCreature: CreatureDefinition;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenCodex: () => void;
  onOpenMenu: () => void;
  recentPointsEarned: number | null;
}

export const MinimalistHUD: React.FC<MinimalistHUDProps> = ({
  stage,
  score,
  combo,
  timeLeft,
  timeLimit,
  isPressureStage,
  activeCreature,
  soundEnabled,
  onToggleSound,
  onOpenCodex,
  onOpenMenu,
  recentPointsEarned,
}) => {
  const isUrgent = timeLeft <= 10 || isPressureStage;
  const timePercent = Math.max(0, Math.min(100, (timeLeft / timeLimit) * 100));

  return (
    <div
      id="minimalist-roguelike-hud"
      className="absolute top-0 inset-x-0 z-20 px-3 sm:px-6 py-2.5 pointer-events-none flex flex-col gap-1.5"
    >
      <div className="flex items-center justify-between w-full">
        {/* Left: Stage & Active Creature Badge */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border backdrop-blur-md transition-all shadow-sm ${
              isPressureStage
                ? 'bg-rose-950/80 border-rose-500/50 text-rose-300 animate-pulse'
                : 'bg-slate-900/75 border-slate-700/60 text-slate-100'
            }`}
          >
            {isPressureStage ? (
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            ) : (
              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            )}
            <span className="text-xs font-black tracking-wider uppercase">
              Stage {stage.toString().padStart(2, '0')}
            </span>
            {isPressureStage && (
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 uppercase">
                CRITICAL
              </span>
            )}
          </div>

          {/* Active Creature Pill (Clickable to open Codex) */}
          <button
            onClick={onOpenCodex}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/75 border border-slate-700/60 text-slate-200 backdrop-blur-md hover:border-slate-500 transition-all cursor-pointer shadow-sm group"
            title="Inspect Creature Evolutions"
          >
            <div
              className="w-2.5 h-2.5 rounded-full shadow-sm"
              style={{
                backgroundColor: activeCreature.primaryColor,
                boxShadow: `0 0 6px ${activeCreature.glowColor}`,
              }}
            />
            <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition">
              {activeCreature.name}
            </span>
            <BookOpen className="w-3 h-3 text-slate-400 group-hover:text-white transition ml-0.5" />
          </button>
        </div>

        {/* Center: Live Roguelike Score & Combo */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-baseline gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 backdrop-blur-md shadow-sm relative">
            <span className="text-xs font-extrabold text-amber-400 tabular-nums">
              {score.toLocaleString()}
            </span>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">PTS</span>

            {/* Floating Point Notification */}
            {recentPointsEarned && (
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs font-black text-emerald-400 drop-shadow animate-bounce">
                +{recentPointsEarned}
              </div>
            )}
          </div>

          {combo > 1 && (
            <div className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase tracking-wider animate-pulse">
              {combo}x COMBO
            </div>
          )}
        </div>

        {/* Right: Countdown Clock & Quick Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Mission Timer Clock */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border backdrop-blur-md transition-all shadow-sm ${
              isUrgent
                ? 'bg-rose-950/80 border-rose-500/60 text-rose-300 animate-pulse ring-1 ring-rose-500/50'
                : 'bg-slate-900/75 border-slate-700/60 text-slate-200'
            }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                isUrgent ? 'bg-rose-400 animate-ping' : 'bg-emerald-400'
              }`}
            />
            <span className="text-xs font-mono font-bold tabular-nums">
              {timeLeft}s
            </span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="w-7 h-7 rounded-full bg-slate-900/75 border border-slate-700/60 text-slate-300 hover:text-white hover:border-slate-500 flex items-center justify-center backdrop-blur-md transition cursor-pointer shadow-sm"
            title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            )}
          </button>

          {/* Main Menu Button */}
          <button
            onClick={onOpenMenu}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-slate-200 hover:text-white hover:border-purple-500/60 hover:bg-slate-800 backdrop-blur-md transition cursor-pointer shadow-sm text-xs font-semibold"
            title="Open Main Menu"
          >
            <Home className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Menu</span>
          </button>
        </div>
      </div>

      {/* Minimal Timer Progress Line */}
      <div className="w-full h-0.5 bg-slate-800/40 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isUrgent ? 'bg-rose-500' : 'bg-emerald-500'
          }`}
          style={{ width: `${timePercent}%` }}
        />
      </div>
    </div>
  );
};
