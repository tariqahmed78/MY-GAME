import React from 'react';
import { Trophy, ArrowRight, RotateCcw, Home, Timer, Sparkles } from 'lucide-react';
import { ThemeConfig } from '../types';

interface VictoryModalProps {
  levelName: string;
  theme: ThemeConfig;
  movesCount: number;
  timeRemaining?: number;
  timeTaken?: number;
  onNextLevel: () => void;
  onReplay: () => void;
  onReturnToMenu?: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  levelName,
  theme,
  movesCount,
  timeRemaining,
  timeTaken,
  onNextLevel,
  onReplay,
  onReturnToMenu,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
      <div
        className="w-full max-w-xs rounded-3xl p-6 shadow-2xl transition-all text-center flex flex-col items-center animate-in fade-in zoom-in-95 duration-250 border"
        style={{
          backgroundColor: theme.surface || '#1E293B',
          color: theme.textPrimary || '#F8FAFC',
          borderColor: theme.uiBorder || 'rgba(255, 255, 255, 0.12)',
        }}
      >
        {/* Victory Trophy Badge */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow-lg"
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(217, 119, 6, 0.1))',
            border: '1.5px solid rgba(245, 158, 11, 0.5)',
            color: '#FBBF24',
          }}
        >
          <Trophy className="w-8 h-8 stroke-[2.2]" />
        </div>

        <h2 className="text-2xl font-black tracking-tight uppercase">Mission Passed!</h2>
        <p className="text-xs opacity-75 mt-0.5 font-medium" style={{ color: theme.textSecondary || '#94A3B8' }}>
          Escaped through the maze safely!
        </p>

        {/* Level stats */}
        <div
          className="w-full my-3 p-3 rounded-2xl flex items-center justify-around text-xs font-bold border"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderColor: 'rgba(255, 255, 255, 0.08)',
          }}
        >
          <div>
            <div className="text-[10px] opacity-60 font-medium">LEVEL</div>
            <div className="font-extrabold text-sm">{levelName}</div>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <div>
            <div className="text-[10px] opacity-60 font-medium">MOVES</div>
            <div className="font-extrabold text-sm">{movesCount}</div>
          </div>
          {timeRemaining !== undefined && (
            <>
              <div className="w-px h-6 bg-white/10" />
              <div>
                <div className="text-[10px] opacity-60 font-medium">CLOCK LEFT</div>
                <div className="font-extrabold text-sm text-emerald-400 flex items-center gap-0.5 justify-center">
                  <Timer className="w-3 h-3" />
                  {timeRemaining}s
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="w-full space-y-2 mt-1">
          <button
            id="btn-next-level"
            onClick={onNextLevel}
            className="w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 text-slate-950 active:scale-98 transition-all shadow-md"
            style={{
              background: theme.accentColor || '#38BDF8',
            }}
          >
            <span>Next Maze</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onReplay}
              className="py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 transition-all border border-white/5"
              style={{ color: theme.textSecondary || '#CBD5E1' }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Replay</span>
            </button>

            {onReturnToMenu && (
              <button
                onClick={onReturnToMenu}
                className="py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 transition-all border border-white/5"
                style={{ color: theme.textSecondary || '#CBD5E1' }}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Menu</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

