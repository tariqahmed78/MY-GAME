import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Star, Zap, Award } from 'lucide-react';

interface CelebrationOverlayProps {
  isVisible: boolean;
  word: string;
  pointsEarned?: number;
  combo?: number;
}

export const CELEBRATION_WORDS = [
  'AWESOME!',
  'BRAVO!',
  'AMAZING!',
  'WOW!',
  'SPECTACULAR!',
  'BRILLIANT!',
  'INCREDIBLE!',
] as const;

export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({
  isVisible,
  word,
  pointsEarned = 0,
  combo = 1,
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <div
          id="celebration-screen-overlay"
          className="fixed inset-0 z-40 flex flex-col items-center justify-center pointer-events-none select-none overflow-hidden"
        >
          {/* Pulsing Light Shockwave Ring */}
          <motion.div
            initial={{ scale: 0.2, opacity: 0.8 }}
            animate={{ scale: 3.5, opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="absolute w-64 h-64 rounded-full border-4 border-amber-400/60 blur-sm pointer-events-none"
          />
          <motion.div
            initial={{ scale: 0.1, opacity: 0.9 }}
            animate={{ scale: 2.8, opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.05 }}
            className="absolute w-48 h-48 rounded-full border-2 border-emerald-400/80 blur-xs pointer-events-none"
          />

          {/* Radial Golden Sunburst behind the text */}
          <motion.div
            initial={{ rotate: 0, scale: 0.5, opacity: 0 }}
            animate={{ rotate: 90, scale: 1.2, opacity: 0.25 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
            className="absolute w-[500px] h-[500px] pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, rgba(245, 158, 11, 0.1) 45%, transparent 70%)',
            }}
          />

          {/* Floating Confetti & Sparkles */}
          {[-120, -60, 0, 60, 120].map((offsetX, idx) => (
            <motion.div
              key={idx}
              initial={{ y: 20, x: offsetX, opacity: 1, scale: 0.3 }}
              animate={{
                y: -140 - (idx % 3) * 40,
                x: offsetX * 1.5 + (idx % 2 === 0 ? 30 : -30),
                opacity: [1, 1, 0],
                scale: [0.3, 1.3, 0.8],
                rotate: (idx % 2 === 0 ? 1 : -1) * 180,
              }}
              transition={{ duration: 0.9, ease: 'easeOut', delay: idx * 0.04 }}
              className="absolute pointer-events-none"
            >
              {idx % 2 === 0 ? (
                <Star className="w-6 h-6 text-amber-300 fill-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.9)]" />
              ) : (
                <Sparkles className="w-7 h-7 text-emerald-300 drop-shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
              )}
            </motion.div>
          ))}

          {/* Main Huge 3D Animated Text Banner */}
          <motion.div
            initial={{ scale: 0.3, y: 30, rotate: -6, opacity: 0 }}
            animate={{
              scale: [0.3, 1.2, 1.0],
              y: [30, -10, 0],
              rotate: [-6, 3, 0],
              opacity: 1,
            }}
            exit={{ scale: 1.15, opacity: 0, y: -25 }}
            transition={{ duration: 0.5, times: [0, 0.65, 1], ease: 'easeOut' }}
            className="relative flex flex-col items-center justify-center text-center px-4"
          >
            {/* Top Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-amber-400/60 shadow-lg text-amber-300 text-xs font-black tracking-widest uppercase mb-2 backdrop-blur-md"
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>MISSION ACCOMPLISHED</span>
            </motion.div>

            {/* Huge Text */}
            <h1
              className="text-5xl sm:text-7xl font-black tracking-tight uppercase"
              style={{
                background: 'linear-gradient(180deg, #FFFFFF 0%, #FEF08A 25%, #F59E0B 75%, #B45309 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 6px 12px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 25px rgba(245, 158, 11, 0.85)) drop-shadow(0 0 50px rgba(251, 191, 36, 0.5))',
                textShadow: '0 4px 18px rgba(245, 158, 11, 0.6)',
              }}
            >
              {word}
            </h1>

            {/* Sub-banner with Score and Combo Bonus */}
            {(pointsEarned > 0 || combo > 1) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.22, duration: 0.35 }}
                className="mt-3 flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-emerald-500/30 to-amber-500/20 border border-amber-400/40 backdrop-blur-md shadow-2xl"
              >
                {pointsEarned > 0 && (
                  <span className="font-extrabold text-white text-sm sm:text-base tracking-wide flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    +{pointsEarned.toLocaleString()} PTS
                  </span>
                )}
                {combo > 1 && (
                  <span className="px-2 py-0.5 rounded-lg bg-amber-400 text-slate-950 font-black text-xs tracking-wider flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-slate-950" />
                    {combo}X COMBO!
                  </span>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
