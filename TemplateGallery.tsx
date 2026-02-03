
import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Braces, Globe, FileCode, X, Sword, MessageSquare, Package } from 'lucide-react';
import { TemplateType } from '../types';

interface TemplateGalleryProps {
  onSelect: (type: TemplateType) => void;
  onClose: () => void;
}

const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onSelect, onClose }) => {
  const templates = [
    { id: 'html' as TemplateType, icon: <Globe />, title: 'Modern Web', desc: 'HTML5, CSS3, JS Starter' },
    { id: 'minecraft' as TemplateType, icon: <Sword />, title: 'Minecraft Plugin', desc: 'Spigot/Java Boilerplate' },
    { id: 'discord' as TemplateType, icon: <MessageSquare />, title: 'Discord Bot', desc: 'discord.js v14 Starter' },
    { id: 'python' as TemplateType, icon: <FileCode />, title: 'Python Engine', desc: 'CLI Application' },
    { id: 'npm' as TemplateType, icon: <Package />, title: 'NPM Library', desc: 'Node.js Module Structure' },
    { id: 'react' as TemplateType, icon: <Code2 />, title: 'React Node', desc: 'Component System' },
  ];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-xl" />
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="w-full max-w-3xl glass p-10 rounded-[48px] shadow-2xl relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-pulse" />
        
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter">Project Blueprint</h2>
            <p className="text-slate-500 text-sm font-medium">Select a high-performance environment to begin</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl text-slate-500 transition-all"><X size={24}/></button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {templates.map(t => (
            <button 
              key={t.id} 
              onClick={() => onSelect(t.id)} 
              className="p-6 bg-white/5 border border-white/5 hover:border-indigo-500 hover:bg-white/10 rounded-[32px] text-left group transition-all active:scale-[0.98] relative overflow-hidden"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                {t.icon}
              </div>
              <h3 className="font-black text-white text-sm mb-1 uppercase tracking-wide">{t.title}</h3>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">{t.desc}</p>
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-20 transition-opacity">
                 {t.icon}
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default TemplateGallery;
