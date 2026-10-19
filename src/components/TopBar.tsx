import React from 'react';
import { Settings, Palette, Lightbulb, Undo2, RotateCcw, Home, Shapes, Timer, AlertCircle } from 'lucide-react';
import { ThemeConfig } from '../types';

interface TopBarProps {
  levelName: string;
  theme: ThemeConfig;
  onOpenSettings: () => void;
  onOpenTheme: () => void;
  onOpenShapes?: () => void;
  onOpenMenu?: () => void;
  onHint: () => void;
  onUndo: () => void;
  onRestart: () => void;
  canUndo: boolean;
  hintsRemaining: number;
  timeLeft?: number;
  timeLimit?: number;
  difficulty?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  levelName,
  theme,
  onOpenSettings,
  onOpenTheme,
  onOpenShapes,
  onOpenMenu,
  onHint,
  onUndo,
  onRestart,
  canUndo,
  timeLeft,
  timeLimit,
  difficulty,
}) => {
  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isUrgent = timeLeft !== undefined && timeLeft <= 10;
  const isWarning = timeLeft !== undefined && timeLeft > 10 && timeLeft <= 20;

  return (
    <div className="w-full flex flex-col gap-1.5 px-3 sm:px-4 py-2 select-none">
      {/* Primary Top Header Bar */}
      <div className="w-full flex items-center justify-between">
        {/* Left: Home Menu & Level Settings */}
        <div className="flex items-center gap-1">
          {onOpenMenu && (
            <button
              id="btn-main-menu"
              onClick={onOpenMenu}
              className="p-1.5 rounded-xl transition-all duration-150 active:scale-95 hover:bg-black/5 flex items-center gap-1"
              style={{ color: theme.topBarText }}
              title="Return to Main Menu"
            >
              <Home className="w-5 h-5 stroke-[2.2]" />
            </button>
          )}

          {onOpenShapes && (
            <button
              id="btn-shapes-menu"
              onClick={onOpenShapes}
              className="p-1.5 rounded-xl transition-all duration-150 active:scale-95 hover:bg-black/5 flex items-center gap-1 text-pink-400"
              title="Select Shape Mazes (Heart, Sunflower, Pyramid...)"
            >
              <Shapes className="w-5 h-5 stroke-[2.2]" />
            </button>
          )}

          <button
            id="btn-settings"
            onClick={onOpenSettings}
            className="p-1.5 rounded-xl transition-all duration-150 active:scale-95 hover:bg-black/5"
            style={{ color: theme.topBarText }}
            title="Game Settings & All Levels"
          >
            <Settings className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>

        {/* Center: Mission Clock & Level Name */}
        <div className="flex flex-col items-center">
          <h1
            id="level-title-display"
            className="text-lg sm:text-xl font-black tracking-wide leading-tight flex items-center gap-1.5"
            style={{
              color: theme.topBarText,
              fontFamily: 'ui-rounded, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            <span>{levelName}</span>
            {difficulty && (
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold uppercase tracking-wider bg-black/10 opacity-70">
                {difficulty}
              </span>
            )}
          </h1>
        </div>

        {/* Right: Theme Switcher & Actions */}
        <div className="flex items-center gap-1">
          <button
            id="btn-undo"
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded-xl transition-all duration-150 active:scale-95 ${
              canUndo ? 'hover:bg-black/5' : 'opacity-25 cursor-not-allowed'
            }`}
            style={{ color: theme.topBarText }}
            title="Undo Last Move"
          >
            <Undo2 className="w-4 h-4 stroke-[2.2]" />
          </button>

          <button
            id="btn-restart"
            onClick={onRestart}
            className="p-1.5 rounded-xl transition-all duration-150 active:scale-95 hover:bg-black/5"
            style={{ color: theme.topBarText }}
            title="Restart Level"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.2]" />
          </button>

          <button
            id="btn-hint"
            onClick={onHint}
            className="p-1.5 rounded-xl transition-all duration-150 active:scale-95 hover:bg-black/5"
            style={{ color: theme.topBarText }}
            title="Hint - Next Escape Path"
          >
            <Lightbulb className="w-4 h-4 stroke-[2.2]" />
          </button>

          {/* Theme Palette Switcher Button in Header */}
          <button
            id="btn-theme-palette"
            onClick={onOpenTheme}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-150 active:scale-95 shadow-xs border"
            style={{
              backgroundColor: theme.surface || 'rgba(0, 0, 0, 0.08)',
              color: theme.accentColor || theme.topBarText,
              borderColor: theme.uiBorder || 'rgba(255, 255, 255, 0.15)',
            }}
            title="Switch Color Theme / Palettes"
          >
            <Palette className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px] max-w-[80px] truncate">{theme.name}</span>
          </button>
        </div>
      </div>

      {/* Mission Clock Timer Display Banner */}
      {timeLeft !== undefined && (
        <div className="w-full flex items-center justify-between px-2 py-1 rounded-xl backdrop-blur-md border transition-all"
          style={{
            background: isUrgent
              ? 'rgba(239, 68, 68, 0.18)'
              : isWarning
              ? 'rgba(245, 158, 11, 0.15)'
              : 'rgba(0, 0, 0, 0.06)',
            borderColor: isUrgent
              ? '#EF4444'
              : isWarning
              ? '#F59E0B'
              : theme.uiBorder || 'rgba(255, 255, 255, 0.08)',
          }}
        >
          <div className="flex items-center gap-1.5">
            <Timer
              className={`w-4 h-4 ${
                isUrgent
                  ? 'text-red-500 animate-spin'
                  : isWarning
                  ? 'text-amber-500 animate-pulse'
                  : ''
              }`}
              style={{ color: isUrgent ? '#EF4444' : isWarning ? '#F59E0B' : theme.accentColor || '#38BDF8' }}
            />
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-80" style={{ color: theme.topBarText }}>
              Mission Clock:
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`font-mono text-xs sm:text-sm font-black px-2 py-0.5 rounded-md tracking-wider ${
                isUrgent
                  ? 'bg-red-500 text-white animate-pulse shadow-sm'
                  : isWarning
                  ? 'bg-amber-500/30 text-amber-300'
                  : 'bg-black/15'
              }`}
              style={{
                color: isUrgent ? '#FFFFFF' : isWarning ? '#FBBF24' : theme.timerColor || theme.topBarText,
              }}
            >
              {formatTime(timeLeft)}
            </span>
            {isUrgent && (
              <span className="flex items-center gap-0.5 text-[10px] font-bold text-red-400">
                <AlertCircle className="w-3 h-3" />
                HURRY!
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

