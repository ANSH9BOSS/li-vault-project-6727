
import React, { useRef, useEffect, useState } from 'react';
import { TerminalLine } from '../types';
import { Terminal as TerminalIcon, Trash2, Activity, Monitor, History, Zap, BrainCircuit } from 'lucide-react';

interface TerminalProps {
  lines: TerminalLine[];
  onClear: () => void;
  onDebug: () => void;
  onCommand?: (cmd: string) => void;
}

const Terminal: React.FC<TerminalProps> = ({ lines, onClear, onDebug, onCommand }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      onCommand?.(input);
      setHistory(p => [input, ...p]);
      setInput('');
      setHistoryIdx(-1);
    } else if (e.key === 'ArrowUp') {
      const nextIdx = historyIdx + 1;
      if (nextIdx < history.length) {
        setHistoryIdx(nextIdx);
        setInput(history[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      const nextIdx = historyIdx - 1;
      if (nextIdx >= 0) {
        setHistoryIdx(nextIdx);
        setInput(history[nextIdx]);
      } else {
        setHistoryIdx(-1);
        setInput('');
      }
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-400 font-medium';
      case 'success': return 'text-emerald-400 font-bold';
      case 'input': return 'text-indigo-400 font-black tracking-tight';
      case 'ai': return 'text-purple-400 italic';
      default: return 'text-slate-300';
    }
  };

  const safeStringify = (text: any): string => {
    if (text === null || text === undefined) return 'null';
    if (typeof text === 'string') return text;
    if (text instanceof Error) return text.message;
    
    // Explicitly catch Event objects to prevent [object Event]
    if (text instanceof Event || (typeof text === 'object' && text.type && text.target)) {
      return `[System Event: ${text.type}]`;
    }

    try {
      if (typeof text === 'object') {
        return JSON.stringify(text, null, 2);
      }
      return String(text);
    } catch {
      return "[Unserializable Data]";
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#020408] border-t border-white/5 selection:bg-indigo-500/30">
      <div className="flex items-center justify-between px-6 py-2 bg-black/40 border-b border-white/5">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-slate-500">
            <TerminalIcon size={14} className="text-indigo-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">li_shell_v6.0</span>
          </div>
          <div className="flex items-center gap-4 border-l border-white/10 pl-6">
             <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                <Activity size={10} className="animate-pulse" /> TTY-1
             </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onClear} className="p-1.5 hover:bg-white/5 rounded-lg text-slate-600 hover:text-red-400 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 p-6 overflow-y-auto code-font text-[12px] leading-relaxed custom-scrollbar scroll-smooth"
      >
        {lines.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-800 space-y-4 opacity-30">
            <Monitor size={48} strokeWidth={1} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Node Idle</span>
          </div>
        )}
        
        {/* Guard against null lines during mapping */}
        {lines.filter(l => l && l.type).map((line, i) => (
          <div key={i} className={`mb-1.5 break-words ${getColor(line.type)} flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300 group`}>
            <span className="opacity-20 shrink-0 select-none font-mono">
              {new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <div className="flex-1 flex flex-col gap-1">
               <span className="whitespace-pre-wrap flex items-start gap-2">
                 {line.type === 'input' && <span className="text-indigo-600 shrink-0">❯</span>}
                 {line.type === 'ai' && <BrainCircuit size={14} className="shrink-0 mt-0.5" />}
                 {safeStringify(line.text)}
               </span>
               {line.type === 'error' && (
                  <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('li-autofix', { detail: { error: safeStringify(line.text) } }))}
                    className="w-fit flex items-center gap-1.5 px-2 py-1 bg-red-500/10 text-red-400 rounded-md text-[9px] font-black uppercase tracking-widest border border-red-500/20 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                  >
                     <Zap size={10} /> Fix with Neural Engine
                  </button>
               )}
            </div>
          </div>
        ))}
        
        <div className="flex items-start gap-3 mt-4 group">
          <span className="text-indigo-500 font-black select-none mt-0.5 animate-pulse">❯</span>
          <textarea 
            autoFocus
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            className="flex-1 bg-transparent border-none outline-none text-white caret-indigo-500 resize-none h-fit overflow-hidden"
            placeholder="System command..."
          />
        </div>
      </div>
    </div>
  );
};

export default Terminal;
