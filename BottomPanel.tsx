
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, History, Activity, ShieldCheck, Clock, Terminal as TerminalIcon, SearchCode } from 'lucide-react';
import { BottomTab, SearchResult, CommitSnapshot, TerminalLine } from '../types';
import Terminal from './Terminal.tsx';

interface BottomPanelProps {
  activeTab: BottomTab | 'terminal';
  onTabChange: (tab: any) => void;
  terminalLines: TerminalLine[];
  onClearTerminal: () => void;
  onDebug: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  replaceQuery: string;
  onReplaceChange: (q: string) => void;
  searchResults: SearchResult[];
  onSelectResult: (id: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
  snapshots?: CommitSnapshot[];
  onTerminalCommand?: (cmd: string) => void;
}

const BottomPanel: React.FC<BottomPanelProps> = ({ 
  activeTab, onTabChange, searchQuery, onSearchChange, searchResults, onSelectResult, searchInputRef,
  snapshots = [], terminalLines, onClearTerminal, onDebug, onTerminalCommand
}) => {
  return (
    <div className="h-full flex flex-col bg-[#020408]">
      <div className="flex items-center px-4 bg-slate-950 border-b border-white/5 h-10 overflow-x-auto no-scrollbar">
        <TabBtn icon={<TerminalIcon size={12}/>} label="Terminal" active={activeTab === 'terminal'} onClick={() => onTabChange('terminal')} />
        <TabBtn icon={<Search size={12}/>} label="Search" active={activeTab === 'search'} onClick={() => onTabChange('search')} />
        <TabBtn icon={<Clock size={12}/>} label="Timeline" active={activeTab === 'timeline'} onClick={() => onTabChange('timeline')} />
      </div>

      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'terminal' && (
            <motion.div key="terminal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
              <Terminal lines={terminalLines} onClear={onClearTerminal} onDebug={onDebug} onCommand={onTerminalCommand} />
            </motion.div>
          )}

          {activeTab === 'timeline' && (
             <motion.div key="timeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full overflow-y-auto p-6 bg-[#020408] custom-scrollbar">
                <div className="space-y-6">
                   {snapshots.length === 0 ? (
                      <div className="text-center py-12 text-slate-600 italic text-[11px]">No state snapshots recorded.</div>
                   ) : (
                      snapshots.map(snap => (
                         <div key={snap.id} className="flex gap-4 border-l border-white/10 pl-6 pb-6 relative group">
                            <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/40" />
                            <div className="flex-1">
                               <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-black text-white">{snap.message}</span>
                                  <span className="text-[9px] font-bold text-slate-600 uppercase">{new Date(snap.timestamp).toLocaleTimeString()}</span>
                               </div>
                               <div className="text-[9px] text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                  <ShieldCheck size={10} className="text-indigo-400" /> ID: {snap.id}
                               </div>
                            </div>
                         </div>
                      ))
                   )}
                </div>
             </motion.div>
          )}

          {activeTab === 'search' && (
            <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col bg-[#020408]">
              <div className="p-4 border-b border-white/5 flex items-center gap-4">
                 <div className="relative flex-1 max-w-md">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                    <input ref={searchInputRef} value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} placeholder="Query workspace contents..." className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-xs text-white focus:outline-none" />
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center text-slate-700 text-[11px] py-10 italic">
                 <SearchCode size={32} className="mb-3 opacity-20" />
                 Global Search engine indexed. Ready for query.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const TabBtn = ({ icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-4 py-1.5 rounded-t-lg text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-[#020408] text-white border-x border-t border-white/5' : 'text-slate-600 hover:text-slate-400'}`}>
    {icon} {label}
  </button>
);

export default BottomPanel;
