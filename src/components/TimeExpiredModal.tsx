import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, RotateCcw, PlusCircle, Home, Layers } from 'lucide-react';
import { ThemeConfig } from '../types';

interface TimeExpiredModalProps {
  isOpen: boolean;
  onRestart: () => void;
  onAddOvertime: () => void;
  onReturnToMenu: () => void;
  onSelectAnotherLevel: () => void;
  currentTheme: ThemeConfig;
  levelName: string;
}

export const TimeExpiredModal: React.FC<TimeExpiredModalProps> = ({
  isOpen,
  onRestart,
  onAddOvertime,
  onReturnToMenu,
  onSelectAnotherLevel,
  currentTheme,
  levelName,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center overflow-hidden border border-red-500/40"
          style={{
            background: 'linear-gradient(180deg, #1E1B2E 0%, #0F0E17 100%)',
            color: '#F8FAFC',
            boxShadow: '0 0 35px rgba(239, 68, 68, 0.35)',
          }}
        >
          {/* Animated Alarm Beacon */}
          <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
            <div className="w-14 h-14 rounded-full bg-red-500/20 border border-red-500/60 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
          </div>

          <h2 className="text-2xl font-black tracking-wider uppercase text-red-400">
            Time's Up!
          </h2>
          <p className="text-sm font-semibold text-slate-300 mt-1">
            Mission Incomplete on {levelName}
          </p>
          <p className="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">
            The countdown clock reached zero before the arrow navigated out of the maze.
          </p>

          {/* Action Buttons */}
          <div className="w-full space-y-2.5 mt-6">
            {/* Try Again */}
            <button
              id="time-expired-restart-btn"
              onClick={onRestart}
              className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg active:scale-98 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Mission (Reset Clock)</span>
            </button>

            {/* Emergency Overtime (+30s) */}
            <button
              id="time-expired-overtime-btn"
              onClick={onAddOvertime}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-semibold text-sm bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 active:scale-98 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+30s Emergency Overtime</span>
            </button>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {/* Select Another Maze */}
              <button
                id="time-expired-levels-btn"
                onClick={onSelectAnotherLevel}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/15 text-slate-300 transition-all"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Choose Maze</span>
              </button>

              {/* Return to Startup Menu */}
              <button
                id="time-expired-menu-btn"
                onClick={onReturnToMenu}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/15 text-slate-300 transition-all"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Main Menu</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
