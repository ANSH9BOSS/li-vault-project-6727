
import React, { useState, useEffect } from 'react';
import { Play, LogOut, CloudUpload, Loader2, MonitorPlay, Settings, CheckCircle2, Box, Timer, Download, Archive, Github, Share2, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Branch } from '../types.ts';

interface TopBarProps {
  user: User;
  onLogout: () => void;
  onRun: () => void; 
  onDebug: () => void;
  isExecuting: boolean;
  onSync: () => void;
  isSyncing: boolean;
  saveStatus: 'saved' | 'saving' | 'error';
  onToggleAI: () => void;
  onTogglePreview: () => void;
  showPreview: boolean;
  onShowSettings: () => void;
  branches: Branch[];
  currentBranch: string;
  onSwitchBranch: (name: string) => void;
  onCreateBranch: (name: string) => void;
  onExport: () => void;
  onCommit: (message: string) => void;
}

const TopBar: React.FC<TopBarProps> = ({ 
  user, onLogout, onRun, onDebug, isExecuting, saveStatus, 
  onToggleAI, onTogglePreview, showPreview, onShowSettings, onExport, onSync, isSyncing
}) => {
  const [timer, setTimer] = useState(1500); 

  useEffect(() => {
    const t = setInterval(() => setTimer(p => p > 0 ? p - 1 : 1500), 1000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m}:${rs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="h-16 bg-[#0B0E14] border-b border-white/5 flex items-center justify-between px-6 z-50 relative">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
            <Box size={18} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-[11px] font-black uppercase tracking-[0.2em] text-white group-hover:text-indigo-400 transition-colors">Li's Hub</h1>
            <div className="flex items-center gap-2">
               <span className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.1em]">Engine v8.0 | Made by Li</span>
               <div className="flex items-center gap-1">
                  <AnimatePresence mode="wait">
                    {saveStatus === 'saving' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1">
                        <Loader2 size={8} className="animate-spin text-indigo-400" />
                        <span className="text-[7px] font-black uppercase text-indigo-400">Syncing...</span>
                      </motion.div>
                    )}
                    {saveStatus === 'saved' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1">
                        <CheckCircle2 size={8} className="text-emerald-500" />
                        <span className="text-[7px] font-black uppercase text-emerald-500">Stored</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 border-l border-white/5 pl-6 h-8">
           <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
              <Timer size={12} className="text-amber-500" />
              <span className="text-[10px] font-black text-white">{formatTime(timer)}</span>
           </div>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
        <ActionButton 
          icon={<Play size={14}/>} 
          label="Execute (Run)" 
          color="text-emerald-400" 
          onClick={onRun} 
          loading={isExecuting}
        />
        <ActionButton 
          icon={<Share2 size={14}/>} 
          label="Push to Git" 
          color="text-indigo-400" 
          onClick={onSync} 
          loading={isSyncing}
        />
        <ActionButton icon={<MonitorPlay size={14}/>} active={showPreview} label="Preview" color="text-sky-500" onClick={onTogglePreview} />
        <ActionButton icon={<Archive size={14}/>} label="Bundle ZIP" color="text-indigo-500" onClick={onExport} />
      </div>

      <div className="flex items-center gap-4">
        <button onClick={onShowSettings} className="p-2 text-slate-500 hover:text-white transition-colors hover:bg-white/5 rounded-xl"><Settings size={18} /></button>
        <div className="flex items-center gap-3">
          <motion.img whileHover={{ scale: 1.1 }} src={user.avatar} className="w-8 h-8 rounded-lg cursor-pointer ring-1 ring-white/10" alt="avatar"/>
          <button onClick={onLogout} className="p-2 text-slate-500 hover:text-red-400 transition-all hover:bg-white/5 rounded-xl"><LogOut size={18} /></button>
        </div>
      </div>
    </header>
  );
};

const ActionButton = ({ icon, label, onClick, loading, active, color }: any) => (
  <button onClick={onClick} disabled={loading} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${active ? 'bg-indigo-600/10 text-white' : 'text-slate-500 hover:text-white hover:bg-white/5'} disabled:opacity-50`}>
    {loading ? <Loader2 size={12} className="animate-spin text-indigo-400" /> : <span className={color}>{icon}</span>}
    {label}
  </button>
);

export default TopBar;
