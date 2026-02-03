
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, File, Command } from 'lucide-react';
import { FileNode } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  files: FileNode[];
  onSelect: (id: string) => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, files, onSelect }) => {
  const [query, setQuery] = useState('');
  const filtered = files.filter(f => f.name.toLowerCase().includes(query.toLowerCase()));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
      ></motion.div>
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: -20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-xl glass rounded-[24px] shadow-2xl overflow-hidden relative z-10"
      >
        <div className="p-4 flex items-center gap-3 border-b border-slate-800/50">
          <Search size={20} className="text-slate-500" />
          <input 
            autoFocus
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files or type a command..."
            className="flex-1 bg-transparent text-white focus:outline-none font-medium placeholder:text-slate-600"
          />
          <div className="px-2 py-1 bg-slate-800 rounded-md text-[10px] text-slate-500 font-bold uppercase">ESC</div>
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {filtered.length > 0 ? (
            filtered.map(f => (
              <button
                key={f.id}
                onClick={() => onSelect(f.id)}
                className="w-full flex items-center gap-3 p-3 hover:bg-indigo-600/10 rounded-xl group transition-all"
              >
                <div className="p-2 bg-slate-900 rounded-lg group-hover:text-indigo-400 transition-colors">
                  <File size={16} />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-slate-200">{f.name}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest">{f.language}</div>
                </div>
              </button>
            ))
          ) : (
            <div className="p-10 text-center text-slate-600 italic">No files match your query</div>
          )}
        </div>

        <div className="p-3 bg-slate-950/50 border-t border-slate-800/50 flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
           <div className="flex items-center gap-1"><Command size={10}/> P Search</div>
           <div className="flex items-center gap-1"><Command size={10}/> K AI Hub</div>
        </div>
      </motion.div>
    </div>
  );
};

export default CommandPalette;
