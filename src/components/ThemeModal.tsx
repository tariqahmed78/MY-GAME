import React from 'react';
import { X, Check, Palette, Sparkles } from 'lucide-react';
import { ThemeConfig } from '../types';
import { THEMES } from '../themes';

interface ThemeModalProps {
  currentTheme: ThemeConfig;
  onSelectTheme: (theme: ThemeConfig) => void;
  onClose: () => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({ currentTheme, onSelectTheme, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none">
      <div
        className="w-full max-w-md rounded-3xl p-6 shadow-2xl transition-all max-h-[85vh] flex flex-col"
        style={{
          backgroundColor: currentTheme.surface || '#1E293B',
          color: currentTheme.textPrimary || '#F8FAFC',
          border: `1.5px solid ${currentTheme.uiBorder || 'rgba(255, 255, 255, 0.12)'}`,
        }}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
              <Palette className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold tracking-wide">Environment Themes</h2>
              <p className="text-xs opacity-65" style={{ color: currentTheme.textSecondary || '#94A3B8' }}>
                Modern color combinations for walls, corridors & beacons
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 active:scale-95 transition-all"
          >
            <X className="w-5 h-5 opacity-70 hover:opacity-100" />
          </button>
        </div>

        <div className="mt-4 space-y-2.5 overflow-y-auto pr-1 flex-1">
          {THEMES.map((theme) => {
            const isSelected = theme.id === currentTheme.id;
            return (
              <button
                key={theme.id}
                onClick={() => onSelectTheme(theme)}
                className={`w-full p-3.5 rounded-2xl flex items-center justify-between border-2 transition-all text-left ${
                  isSelected
                    ? 'border-sky-400 bg-sky-500/10 shadow-lg scale-[1.01]'
                    : 'border-white/5 hover:border-white/20 bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  {/* Multi-color palette swatch preview */}
                  <div
                    className="w-12 h-12 rounded-xl p-1.5 flex flex-col justify-between shadow-inner border border-white/10"
                    style={{ backgroundColor: theme.bg }}
                  >
                    <div className="flex gap-1 justify-between">
                      <div className="w-4 h-3 rounded-xs" style={{ backgroundColor: theme.obstacleFill }} />
                      <div className="w-4 h-3 rounded-xs" style={{ backgroundColor: theme.accentColor || theme.arrowStroke }} />
                    </div>
                    <div className="w-full h-2 rounded-xs" style={{ backgroundColor: theme.portalGlow || theme.arrowStroke }} />
                  </div>

                  <div>
                    <div className="font-bold text-sm flex items-center gap-2" style={{ color: theme.textPrimary || '#F8FAFC' }}>
                      <span>{theme.name}</span>
                      {isSelected && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-sky-500/20 text-sky-300">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <div className="text-xs opacity-65 flex items-center gap-1 mt-0.5" style={{ color: theme.textSecondary || '#94A3B8' }}>
                      <Sparkles className="w-3 h-3" />
                      <span>{theme.subtitle || 'Modernized aesthetic'}</span>
                    </div>
                  </div>
                </div>

                {isSelected ? (
                  <div className="w-7 h-7 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center font-bold">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border border-white/20" />
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-98 shadow-md"
          style={{
            background: currentTheme.accentColor || '#38BDF8',
            color: '#0F172A',
          }}
        >
          Confirm Palette
        </button>
      </div>
    </div>
  );
};

