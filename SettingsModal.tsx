import React from 'react';
import { motion } from 'framer-motion';
import { X, Palette, Type, Zap, Save, HardDrive, Cpu } from 'lucide-react';
import { Theme } from '../types';

interface SettingsModalProps {
  theme: Theme;
  setTheme: (t: Theme) => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ theme, setTheme, onClose }) => {
  const presets = [
    { name: 'Midnight', bg: '#020617', accent: '#6366f1', glass: 'rgba(15, 23, 42, 0.6)' },
    { name: 'Dracula', bg: '#282a36', accent: '#bd93f9', glass: 'rgba(68, 71, 90, 0.6)' },
    { name: 'Forest', bg: '#061a15', accent: '#10b981', glass: 'rgba(10, 36, 30, 0.6)' },
    { name: 'Solar', bg: '#002b36', accent: '#268bd2', glass: 'rgba(7, 54, 66, 0.6)' },
  ];

  const updateTheme = (updates: Partial<Theme>) => {
    setTheme({ ...theme, ...updates });
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-lg" />
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="w-full max-w-2xl glass p-8 rounded-[40px] shadow-2xl relative z-10">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center"><Zap size={24} /></div>
            <div>
              <h2 className="text-3xl font-black text-white">Hub Configuration</h2>
              <p className="text-slate-500 text-sm">Local Engineering Environment Settings</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-slate-500 transition-colors"><X size={24}/></button>
        </div>

        <div className="space-y-10">
          <section>
            <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Palette size={14}/> Appearance</h3>
            <div className="flex flex-wrap gap-2">
              {presets.map(p => (
                <button
                  key={p.name}
                  onClick={() => updateTheme({ bgDeep: p.bg, accent: p.accent, bgGlass: p.glass, name: p.name })}
                  className={`px-4 py-2 rounded-xl border transition-all text-xs font-bold ${theme.name === p.name ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-600'}`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Type size={14}/> Editor Font</h3>
            <select 
              value={theme.fontFamily}
              onChange={(e) => updateTheme({ fontFamily: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-white focus:outline-none"
            >
              <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
              <option value="Fira Code">Fira Code</option>
              <option value="JetBrains Mono">JetBrains Mono</option>
            </select>
          </section>

          <div className="grid grid-cols-2 gap-4">
             <div className="p-5 bg-white/5 rounded-3xl border border-white/5">
                <div className="flex items-center gap-2 text-indigo-400 mb-2"><HardDrive size={14}/> <span className="text-[10px] font-black uppercase">Local Storage</span></div>
                <div className="text-xl font-bold text-white">94% Free</div>
             </div>
             <div className="p-5 bg-white/5 rounded-3xl border border-white/5">
                <div className="flex items-center gap-2 text-emerald-400 mb-2"><Cpu size={14}/> <span className="text-[10px] font-black uppercase">Engine Load</span></div>
                <div className="text-xl font-bold text-white">0.02ms</div>
             </div>
          </div>
        </div>

        <div className="mt-12 flex justify-end">
          <button onClick={onClose} className="px-10 py-4 bg-indigo-600 hover:bg-indigo-50 text-white hover:text-indigo-900 font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all">Save Context</button>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsModal;