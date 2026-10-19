import React from 'react';
import { motion } from 'motion/react';
import { Play, Shapes, Timer, Layers, Palette, Volume2, VolumeX, Sparkles, Trophy, HelpCircle } from 'lucide-react';
import { ThemeConfig } from '../types';

interface StartupMenuProps {
  onStartGame: () => void;
  onOpenShapeSelection: () => void;
  onOpenLevelSelector: () => void;
  onOpenThemeModal: () => void;
  onStartTimeAttack: () => void;
  currentTheme: ThemeConfig;
  soundEnabled: boolean;
  onToggleSound: () => void;
  bestStreak: number;
  currentLevelId: number;
  onOpenRules: () => void;
}

export const StartupMenu: React.FC<StartupMenuProps> = ({
  onStartGame,
  onOpenShapeSelection,
  onOpenLevelSelector,
  onOpenThemeModal,
  onStartTimeAttack,
  currentTheme,
  soundEnabled,
  onToggleSound,
  bestStreak,
  currentLevelId,
  onOpenRules,
}) => {
  return (
    <div
      id="startup-main-menu"
      className="relative w-full h-full flex flex-col justify-between p-6 select-none overflow-y-auto"
      style={{
        background: `radial-gradient(circle at 50% 25%, ${currentTheme.backgroundGradientStart || 'rgba(30, 41, 59, 0.4)'}, ${currentTheme.backgroundGradientEnd || '#0F172A'})`,
      }}
    >
      {/* Decorative Grid Mesh overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `radial-gradient(${currentTheme.corridorDot || '#38BDF8'} 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Top Bar: Sound toggle, Trophy streak, Theme button */}
      <div className="relative z-10 flex items-center justify-between w-full max-w-md mx-auto pt-2">
        <button
          id="startup-theme-btn"
          onClick={onOpenThemeModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md transition-all active:scale-95"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: `1px solid ${currentTheme.uiBorder || 'rgba(255, 255, 255, 0.15)'}`,
            color: currentTheme.textSecondary || '#CBD5E1',
          }}
          title="Switch Color Theme"
        >
          <Palette className="w-3.5 h-3.5" style={{ color: currentTheme.accentColor || '#38BDF8' }} />
          <span>{currentTheme.name}</span>
        </button>

        <div className="flex items-center gap-2">
          {bestStreak > 0 && (
            <div
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{
                background: 'rgba(234, 179, 8, 0.15)',
                color: '#FACC15',
                border: '1px solid rgba(234, 179, 8, 0.3)',
              }}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>{bestStreak} CLEARED</span>
            </div>
          )}

          <button
            id="startup-sound-toggle-btn"
            onClick={onToggleSound}
            className="p-2 rounded-full backdrop-blur-md transition-all active:scale-95"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: `1px solid ${currentTheme.uiBorder || 'rgba(255, 255, 255, 0.15)'}`,
              color: currentTheme.textSecondary || '#CBD5E1',
            }}
            aria-label="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 opacity-50" />}
          </button>
        </div>
      </div>

      {/* Main Title & Dynamic Hologram Beacon */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center px-4">
        {/* Animated Beacon Compass */}
        <motion.div
          className="relative w-28 h-28 mb-5 flex items-center justify-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Outer Pulsing Aura */}
          <div
            className="absolute inset-0 rounded-full animate-ping opacity-25"
            style={{ background: currentTheme.portalGlow || '#38BDF8' }}
          />

          {/* Rotating Geometric Rings */}
          <div
            className="absolute inset-2 rounded-2xl animate-spin border"
            style={{
              borderColor: currentTheme.uiBorder || 'rgba(56, 189, 248, 0.3)',
              animationDuration: '18s',
            }}
          />

          <div
            className="absolute inset-4 rounded-full border-2 border-dashed opacity-40"
            style={{ borderColor: currentTheme.accentColor || '#38BDF8' }}
          />

          {/* Central Arrow Emblem */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl backdrop-blur-lg"
            style={{
              background: `linear-gradient(135deg, ${currentTheme.blockGradientStart || '#1E293B'}, ${currentTheme.blockGradientEnd || '#0F172A'})`,
              border: `1.5px solid ${currentTheme.accentColor || '#38BDF8'}`,
              boxShadow: `0 0 20px ${currentTheme.portalGlow || 'rgba(56, 189, 248, 0.4)'}`,
            }}
          >
            <motion.div
              animate={{ y: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: currentTheme.accentColor || '#38BDF8' }}>
                <path d="M12 19V5M5 12l7-7 7 7"/>
              </svg>
            </motion.div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-3xl sm:text-4xl font-black tracking-wider uppercase text-balance"
          style={{ color: currentTheme.textPrimary || '#F8FAFC' }}
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          Arrow Escape
        </motion.h1>

        <motion.p
          className="text-xs sm:text-sm font-medium tracking-wide mt-1.5 opacity-80 max-w-xs"
          style={{ color: currentTheme.textSecondary || '#94A3B8' }}
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Navigate the single-arrow pathfinder through intricate geometry before time runs out.
        </motion.p>
      </div>

      {/* Buttons Menu */}
      <motion.div
        className="relative z-10 flex flex-col gap-3 w-full max-w-sm mx-auto pb-4"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        {/* Primary Play Button */}
        <button
          id="startup-play-btn"
          onClick={onStartGame}
          className="group relative flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl font-bold tracking-wider uppercase text-base shadow-lg transition-all active:scale-98 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${currentTheme.accentColor || '#38BDF8'}, ${currentTheme.blockSpecular || '#0284C7'})`,
            color: '#0F172A',
            boxShadow: `0 8px 24px ${currentTheme.portalGlow || 'rgba(56, 189, 248, 0.35)'}`,
          }}
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
          <Play className="w-5 h-5 fill-current" />
          <span>{currentLevelId > 1 ? `Continue (Level ${currentLevelId})` : 'Start Game'}</span>
        </button>

        {/* Secondary: Shape Labyrinths (Heart, Sunflower, Pyramid, Diamond, Crown, Star) */}
        <button
          id="startup-shapes-btn"
          onClick={onOpenShapeSelection}
          className="flex items-center justify-between w-full py-3.5 px-5 rounded-xl font-semibold text-sm backdrop-blur-md transition-all active:scale-98"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: `1px solid ${currentTheme.uiBorder || 'rgba(255, 255, 255, 0.15)'}`,
            color: currentTheme.textPrimary || '#F8FAFC',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ background: 'rgba(236, 72, 153, 0.2)', color: '#F472B6' }}
            >
              <Shapes className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="font-bold">Shape Mazes</div>
              <div className="text-[11px] opacity-70" style={{ color: currentTheme.textSecondary || '#94A3B8' }}>
                Heart, Sunflower, Pyramid, Star & more
              </div>
            </div>
          </div>
          <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-pink-500/20 text-pink-300">NEW</span>
        </button>

        {/* Time Attack Clock Challenge */}
        <button
          id="startup-time-attack-btn"
          onClick={onStartTimeAttack}
          className="flex items-center justify-between w-full py-3 px-5 rounded-xl font-semibold text-sm backdrop-blur-md transition-all active:scale-98"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: `1px solid ${currentTheme.uiBorder || 'rgba(255, 255, 255, 0.15)'}`,
            color: currentTheme.textPrimary || '#F8FAFC',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#F87171' }}
            >
              <Timer className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="font-bold">Time Clock Mode</div>
              <div className="text-[11px] opacity-70" style={{ color: currentTheme.textSecondary || '#94A3B8' }}>
                Forced mission countdown timer
              </div>
            </div>
          </div>
          <Sparkles className="w-4 h-4 text-amber-400" />
        </button>

        {/* Quick Nav Row: Select Level & Rules */}
        <div className="grid grid-cols-2 gap-2 mt-1">
          <button
            id="startup-levels-btn"
            onClick={onOpenLevelSelector}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold backdrop-blur-md transition-all active:scale-95"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${currentTheme.uiBorder || 'rgba(255, 255, 255, 0.1)'}`,
              color: currentTheme.textSecondary || '#CBD5E1',
            }}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Select Level</span>
          </button>

          <button
            id="startup-rules-btn"
            onClick={onOpenRules}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold backdrop-blur-md transition-all active:scale-95"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${currentTheme.uiBorder || 'rgba(255, 255, 255, 0.1)'}`,
              color: currentTheme.textSecondary || '#CBD5E1',
            }}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How to Play</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
