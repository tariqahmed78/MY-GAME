import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { CreatureDefinition } from '../types';

interface EvolutionBannerProps {
  creature: CreatureDefinition | null;
  onMorphNow: () => void;
  onDismiss: () => void;
}

export const EvolutionBanner: React.FC<EvolutionBannerProps> = ({
  creature,
  onMorphNow,
  onDismiss,
}) => {
  if (!creature) return null;

  return (
    <div className="absolute top-16 inset-x-0 z-30 flex justify-center pointer-events-none px-4 animate-bounce">
      <div className="pointer-events-auto max-w-md w-full bg-gradient-to-r from-purple-950/90 to-indigo-950/90 border border-purple-500/60 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 ring-1 ring-purple-500/30">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
            style={{
              backgroundColor: `${creature.primaryColor}25`,
              borderColor: `${creature.primaryColor}60`,
              boxShadow: `0 0 12px ${creature.glowColor}80`,
            }}
          >
            <Sparkles className="w-5 h-5 text-purple-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-300">
                New Evolution Unlocked
              </span>
            </div>
            <h4 className="text-sm font-black text-white tracking-tight">
              {creature.name}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onMorphNow}
            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-sm"
          >
            <span>Morph</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          <button
            onClick={onDismiss}
            className="px-2 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white text-xs transition cursor-pointer"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};
