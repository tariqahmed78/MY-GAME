import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Sun, Triangle, Gem, Crown, Star, Hourglass, Clock, AlertTriangle } from 'lucide-react';
import { ThemeConfig, LevelSilhouette } from '../types';
import { SHAPE_LEVELS } from '../shapeLevels';

interface ShapeSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLevel: (level: LevelSilhouette) => void;
  currentTheme: ThemeConfig;
  selectedLevelId: number;
}

export const ShapeSelectModal: React.FC<ShapeSelectModalProps> = ({
  isOpen,
  onClose,
  onSelectLevel,
  currentTheme,
  selectedLevelId,
}) => {
  if (!isOpen) return null;

  const shapeIcons: Record<string, React.ReactNode> = {
    heart: <Heart className="w-5 h-5 text-rose-400 fill-rose-400/20" />,
    sunflower: <Sun className="w-5 h-5 text-amber-400 fill-amber-400/20" />,
    pyramid: <Triangle className="w-5 h-5 text-yellow-400 fill-yellow-400/20" />,
    diamond: <Gem className="w-5 h-5 text-cyan-400 fill-cyan-400/20" />,
    crown: <Crown className="w-5 h-5 text-amber-300 fill-amber-300/20" />,
    star: <Star className="w-5 h-5 text-purple-400 fill-purple-400/20" />,
    hourglass: <Hourglass className="w-5 h-5 text-indigo-400 fill-indigo-400/20" />,
  };

  const difficultyColors: Record<string, { bg: string; text: string; border: string }> = {
    Normal: { bg: 'rgba(52, 211, 153, 0.15)', text: '#34D399', border: 'rgba(52, 211, 153, 0.3)' },
    Hard: { bg: 'rgba(251, 191, 36, 0.15)', text: '#FBBF24', border: 'rgba(251, 191, 36, 0.3)' },
    Expert: { bg: 'rgba(249, 115, 22, 0.15)', text: '#FB923C', border: 'rgba(249, 115, 22, 0.3)' },
    Insane: { bg: 'rgba(239, 68, 68, 0.15)', text: '#F87171', border: 'rgba(239, 68, 68, 0.3)' },
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.94, opacity: 0 }}
          className="relative w-full max-w-lg rounded-2xl p-5 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
          style={{
            background: currentTheme.surface || '#1E293B',
            border: `1.5px solid ${currentTheme.uiBorder || 'rgba(255, 255, 255, 0.12)'}`,
            color: currentTheme.textPrimary || '#F8FAFC',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h2 className="text-lg font-bold tracking-wide flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-pink-500/20 text-pink-400">
                  <Heart className="w-4 h-4 fill-current" />
                </span>
                Geometric Shape Mazes
              </h2>
              <p className="text-xs opacity-70 mt-0.5" style={{ color: currentTheme.textSecondary || '#94A3B8' }}>
                Highly confusing, intricate labyrinths carved into iconic silhouettes.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 opacity-70 hover:opacity-100" />
            </button>
          </div>

          {/* Shape Mazes List */}
          <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1">
            {SHAPE_LEVELS.map((shapeLvl) => {
              const shapeKey = shapeLvl.shapeType || 'heart';
              const isSelected = selectedLevelId === shapeLvl.id;
              const diff = shapeLvl.difficulty || 'Hard';
              const diffStyle = difficultyColors[diff] || difficultyColors.Hard;

              return (
                <div
                  key={shapeLvl.id}
                  onClick={() => {
                    onSelectLevel(shapeLvl);
                    onClose();
                  }}
                  className={`group relative p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-sky-400' : 'hover:border-white/30'
                  }`}
                  style={{
                    background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                    borderColor: isSelected ? currentTheme.accentColor || '#38BDF8' : 'rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shadow-inner"
                      style={{
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      {shapeIcons[shapeKey] || <Heart className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="font-bold text-sm flex items-center gap-2">
                        <span>{shapeLvl.name}</span>
                        {isSelected && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-sky-500/20 text-sky-300">
                            PLAYING
                          </span>
                        )}
                      </div>
                      <div className="text-xs opacity-65 flex items-center gap-2 mt-0.5" style={{ color: currentTheme.textSecondary || '#94A3B8' }}>
                        <span>{shapeLvl.gridWidth}x{shapeLvl.gridHeight} Grid</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {shapeLvl.timeLimit || 90}s Limit
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Difficulty Badge & Launch */}
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider"
                      style={{
                        background: diffStyle.bg,
                        color: diffStyle.text,
                        border: `1px solid ${diffStyle.border}`,
                      }}
                    >
                      {diff}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs opacity-75">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              All shape mazes have guaranteed single-arrow exits.
            </span>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 font-semibold"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
