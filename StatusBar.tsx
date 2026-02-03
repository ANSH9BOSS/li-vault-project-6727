
import React, { useState, useEffect } from 'react';
import { GitBranch, Cpu, Sparkles, Activity, Server, Zap, Globe, ShieldCheck, BarChart2, Heart } from 'lucide-react';
import { FileNode, Theme } from '../types';

interface StatusBarProps {
  branch: string;
  file: FileNode | null;
  theme: Theme;
}

const StatusBar: React.FC<StatusBarProps> = ({ branch, file, theme }) => {
  const [memory, setMemory] = useState('0.4GB');
  const [latency, setLatency] = useState('12ms');
  const [health, setHealth] = useState(98);

  useEffect(() => {
    const interval = setInterval(() => {
      if ((performance as any).memory) {
        const m = (performance as any).memory.usedJSHeapSize / (1024 * 1024 * 1024);
        setMemory(m.toFixed(2) + 'GB');
      } else {
        setMemory((Math.random() * (0.5 - 0.2) + 0.2).toFixed(2) + 'GB');
      }
      setLatency(Math.floor(Math.random() * (20 - 5) + 5) + 'ms');
      setHealth(p => Math.max(90, Math.min(100, p + (Math.random() > 0.5 ? 1 : -1))));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="h-8 bg-[#0B0E14] border-t border-white/5 flex items-center justify-between px-6 z-40 relative text-[9px] font-black tracking-[0.1em] select-none text-slate-500">
      <div className="flex items-center h-full gap-6">
        <div className="flex items-center gap-2 h-full text-indigo-400 group cursor-pointer hover:bg-white/5 px-2 transition-all">
          <GitBranch size={11} />
          <span className="uppercase tracking-[0.2em]">{branch}</span>
        </div>
        
        <div className="flex items-center gap-4 h-full border-l border-white/5 pl-6">
           <div className="flex items-center gap-1.5 text-emerald-500 uppercase tracking-widest">
              <Activity size={10} className="animate-pulse" />
              <span>Engine Online</span>
           </div>
           <div className="flex items-center gap-1.5 uppercase hover:text-white transition-colors cursor-help">
              <span className="text-slate-600 flex items-center gap-1 italic">Made by Li <Heart size={8} className="text-red-500 fill-red-500" /></span>
           </div>
        </div>
      </div>

      <div className="flex items-center h-full gap-6">
        <div className="flex items-center gap-6 h-full">
          <div className="flex items-center gap-2 group cursor-help">
             <Cpu size={11} className="text-indigo-500" />
             <span className="group-hover:text-white transition-colors">HEAP: {memory}</span>
          </div>
          <div className="flex items-center gap-2 group cursor-help">
             <Globe size={11} className="text-sky-500" />
             <span className="group-hover:text-white transition-colors">PING: {latency}</span>
          </div>
        </div>

        {file && (
          <div className="flex items-center gap-3 px-6 h-full border-l border-white/5 bg-white/5">
            <span className="uppercase text-[8px] font-black text-indigo-400">Context:</span>
            <span className="text-white">{file.language.toUpperCase()}</span>
          </div>
        )}

        <div className="flex items-center gap-2 h-full bg-indigo-600 px-4 text-white font-black italic tracking-[0.2em] uppercase shadow-lg shadow-indigo-600/30">
          <ShieldCheck size={11} />
          <span>Health: {health}%</span>
        </div>
      </div>
    </footer>
  );
};

export default StatusBar;
