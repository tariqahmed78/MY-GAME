import { useState } from 'react';
import { CODE_FILES, CodeFileMeta } from '../codeFiles';
import { FileCode, Copy, Check, Search, Filter, Layers } from 'lucide-react';

export function CodeExplorer() {
  const [selectedPath, setSelectedPath] = useState<string>('Assets/Scripts/Grid/GridManager.cs');
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const files = Object.values(CODE_FILES);
  const categories = ['All', 'Grid', 'Level', 'Player', 'Gameplay', 'Core', 'UI', 'Docs', 'Data & Settings', 'Tests'];

  const filteredFiles = files.filter(file => {
    const matchesCategory = selectedCategory === 'All' || file.category === selectedCategory;
    const matchesSearch = file.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          file.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const currentFile: CodeFileMeta = CODE_FILES[selectedPath] || filteredFiles[0] || files[0];

  const handleCopy = () => {
    if (!currentFile) return;
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-slate-800 text-slate-200">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <FileCode className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white tracking-tight">Unity Android C# Architecture</h2>
            <p className="text-[11px] text-slate-400">Production-grade architecture & test suite</p>
          </div>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 font-medium transition cursor-pointer active:scale-95"
          title="Copy current C# file"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy C#'}</span>
        </button>
      </div>

      {/* Search and Category Filter */}
      <div className="p-3 border-b border-slate-800 space-y-2 bg-slate-950/40">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search scripts, classes, methods..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
          <Filter className="w-3 h-3 text-slate-500 shrink-0 mr-1" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 py-0.5 rounded-md whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-medium'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* File Tab Strip */}
      <div className="px-3 py-2 bg-slate-950/70 border-b border-slate-800 flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
        {filteredFiles.map(file => {
          const fileName = file.path.split('/').pop();
          const isSelected = selectedPath === file.path;
          return (
            <button
              key={file.path}
              onClick={() => setSelectedPath(file.path)}
              className={`px-2.5 py-1 rounded-md text-xs font-mono transition cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-750 hover:text-slate-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
              {fileName}
            </button>
          );
        })}
      </div>

      {/* File Metadata Card */}
      {currentFile && (
        <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 truncate">
            <span className="font-mono text-emerald-400 font-semibold truncate">{currentFile.path}</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-medium shrink-0">
              {currentFile.category}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline ml-2 text-right">
            {currentFile.description}
          </span>
        </div>
      )}

      {/* Code Viewer with Line Numbers */}
      <div className="flex-1 overflow-auto bg-slate-950/90 font-mono text-xs leading-relaxed flex">
        {currentFile && (
          <div className="flex w-full">
            {/* Line numbers */}
            <div className="py-4 pl-3 pr-2 select-none text-slate-600 text-right font-mono text-xs border-r border-slate-800/80 bg-slate-950/60">
              {currentFile.content.split('\n').map((_, idx) => (
                <div key={idx} className="leading-6">
                  {idx + 1}
                </div>
              ))}
            </div>

            {/* Code content */}
            <pre className="py-4 px-4 overflow-x-auto text-slate-300 font-mono flex-1 leading-6 whitespace-pre">
              {currentFile.content}
            </pre>
          </div>
        )}
      </div>

      {/* Footer Status Bar */}
      <div className="px-3 py-1.5 border-t border-slate-800 bg-slate-950 text-[10px] text-slate-500 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-3 h-3 text-emerald-400" />
          <span>Clean Android Architecture: MVC & State Pattern</span>
        </div>
        <span>Zero GC Allocation In Update Loop</span>
      </div>
    </div>
  );
}
