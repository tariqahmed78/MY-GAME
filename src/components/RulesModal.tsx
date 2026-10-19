import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Navigation, ShieldAlert, Sparkles, Award, Zap, CheckCircle2 } from 'lucide-react';
import { ThemeConfig } from '../types';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeConfig;
}

export const RulesModal: React.FC<RulesModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="expedition-rules-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none overflow-y-auto"
    >
      <div
        className="w-full max-w-lg rounded-3xl p-6 shadow-2xl flex flex-col gap-5 border"
        style={{
          backgroundColor: currentTheme.surface || '#1E293B',
          color: currentTheme.textPrimary || '#F8FAFC',
          borderColor: currentTheme.uiBorder || 'rgba(255, 255, 255, 0.15)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-amber-500/20 text-amber-400">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-black tracking-wide uppercase">Expedition Guide</h2>
              <p className="text-xs text-slate-400">How to conquer the infinite labyrinths</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rules List */}
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50">
            <Navigation className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-white text-xs uppercase tracking-wider">1. Guide to the Singularity</h3>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Tap or drag your arrow creature along an unblocked vector to the vortex exit. Clear trajectories must have no walls or blocking arrows in the path.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-white text-xs uppercase tracking-wider">2. Permadeath & Pressure</h3>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Every 5th stage enters Crimson Pressure with siren alerts and reduced timer limits. If time expires, the run ends with a complete reset to Stage 1.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50">
            <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-white text-xs uppercase tracking-wider">3. Combo Multipliers & Celebrations</h3>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Consecutive escapes boost your combo multiplier up to 10x! Trigger celebratory "AWESOME!", "BRAVO!", "AMAZING!", and "WOW!" fanfare sequences with extra bonus score.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50">
            <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-white text-xs uppercase tracking-wider">4. Rare Arrow Evolutions</h3>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Your avatar changes only after winning milestone missions and accumulating score thresholds. Unlock 20+ exotic reptiles, insects, butterflies, and ethereal creatures in your Codex!
              </p>
            </div>
          </div>
        </div>

        {/* Got it button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg transition cursor-pointer"
        >
          Got It, Let's Play!
        </button>
      </div>
    </div>
  );
};
