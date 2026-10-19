import React from 'react';
import { X, Lock, Check, Sparkles, Shield, Compass } from 'lucide-react';
import { CreatureDefinition } from '../types';
import { CREATURES } from '../creatures';

interface CreatureCodexModalProps {
  isOpen: boolean;
  onClose: () => void;
  unlockedCreatureIds: string[];
  activeCreatureId: string;
  onSelectCreature: (creature: CreatureDefinition) => void;
  currentStage: number;
}

export const CreatureCodexModal: React.FC<CreatureCodexModalProps> = ({
  isOpen,
  onClose,
  unlockedCreatureIds,
  activeCreatureId,
  onSelectCreature,
  currentStage,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/70 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Creature Evolution Codex</h2>
              <p className="text-xs text-slate-400">
                {unlockedCreatureIds.length} of {CREATURES.length} Morphic Forms Unlocked
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Creature Grid */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CREATURES.map((creature) => {
              const isUnlocked = unlockedCreatureIds.includes(creature.id);
              const isActive = activeCreatureId === creature.id;

              return (
                <div
                  key={creature.id}
                  onClick={() => isUnlocked && onSelectCreature(creature)}
                  className={`p-3.5 rounded-xl border transition-all relative flex flex-col justify-between ${
                    isActive
                      ? 'bg-purple-950/30 border-purple-500/60 ring-1 ring-purple-500/40 shadow-md'
                      : isUnlocked
                      ? 'bg-slate-800/60 border-slate-700 hover:border-slate-500 cursor-pointer hover:bg-slate-800'
                      : 'bg-slate-950/40 border-slate-800/60 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0 border"
                        style={{
                          backgroundColor: isUnlocked ? `${creature.primaryColor}20` : '#1E293B',
                          borderColor: isUnlocked ? `${creature.primaryColor}50` : '#334155',
                          color: isUnlocked ? creature.primaryColor : '#64748B',
                        }}
                      >
                        {isUnlocked ? (
                          <div
                            className="w-3.5 h-3.5 rounded-full"
                            style={{
                              backgroundColor: creature.primaryColor,
                              boxShadow: `0 0 8px ${creature.glowColor}`,
                            }}
                          />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-white tracking-tight">
                            {creature.name}
                          </h3>
                          {isActive && (
                            <span className="px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-300 text-[10px] font-bold border border-purple-500/40">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-mono text-slate-400">
                          {creature.species}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                        {creature.category}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300/80 mt-2.5 line-clamp-2">
                    {creature.description}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <div className="text-slate-400 flex items-center gap-1">
                      <Compass className="w-3 h-3 text-slate-500" />
                      <span>Locomotion: <strong className="text-slate-200 capitalize">{creature.locomotionType}</strong></span>
                    </div>

                    {!isUnlocked ? (
                      <span className="text-amber-400/90 font-medium">
                        Unlocks at Stage {creature.unlockStage}
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Ready to Morph
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs text-slate-400">
          <span>Survive stages to evolve new species and cosmic entities.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
