import { useState } from 'react';
import { AndroidSimulator } from './components/AndroidSimulator';
import { CodeExplorer } from './components/CodeExplorer';
import { Smartphone, FileCode, Volume2, VolumeX, Sparkles, Layers } from 'lucide-react';

export function App() {
  // Mobile / layout active tab view switcher
  const [activeTab, setActiveTab] = useState<'simulator' | 'code'>('simulator');
  const [showCodePanel, setShowCodePanel] = useState<boolean>(false);

  // Shared Settings State
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [musicEnabled, setMusicEnabled] = useState<boolean>(true);
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(true);
  const [gridEnabled, setGridEnabled] = useState<boolean>(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur px-4 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white tracking-tight">Arrow Escape</h1>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30">
                Maze Edition
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Single-Arrow Spatial Labyrinth & Escape Mission Architecture
            </p>
          </div>
        </div>

        {/* View Switcher (Visible on mobile/tablet, acts as focus on desktop) */}
        <div className="flex items-center space-x-2">
          <div className="flex lg:hidden bg-slate-950 p-0.5 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg transition cursor-pointer ${
                activeTab === 'simulator'
                  ? 'bg-emerald-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Device</span>
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg transition cursor-pointer ${
                activeTab === 'code'
                  ? 'bg-emerald-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>C# Code</span>
            </button>
          </div>

          {/* Desktop C# Toggle */}
          <button
            onClick={() => setShowCodePanel(!showCodePanel)}
            className={`hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
              showCodePanel
                ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Inspect Unity C# Scripts"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>{showCodePanel ? 'Hide Code' : 'C# Scripts'}</span>
          </button>

          {/* Quick Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 border border-slate-700 transition cursor-pointer"
            title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Main Canvas Area: Interactive Roguelike Maze Engine */}
        <section
          className={`flex-1 flex flex-col items-center justify-center p-1 sm:p-3 overflow-y-auto ${
            activeTab === 'simulator' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <AndroidSimulator
            soundEnabled={soundEnabled}
            setSoundEnabled={setSoundEnabled}
            musicEnabled={musicEnabled}
            setMusicEnabled={setMusicEnabled}
            hapticsEnabled={hapticsEnabled}
            setHapticsEnabled={setHapticsEnabled}
            gridEnabled={gridEnabled}
            setGridEnabled={setGridEnabled}
            notificationsEnabled={notificationsEnabled}
            setNotificationsEnabled={setNotificationsEnabled}
          />
        </section>

        {/* Optional Right Pane: Unity Script Manifest & Production C# Codebase Explorer */}
        <section
          className={`w-full lg:w-[480px] xl:w-[540px] border-t lg:border-t-0 lg:border-l border-slate-800 flex-col shrink-0 ${
            activeTab === 'code' ? 'flex' : showCodePanel ? 'hidden lg:flex' : 'hidden'
          }`}
        >
          <CodeExplorer />
        </section>
      </main>
    </div>
  );
}

export default App;
