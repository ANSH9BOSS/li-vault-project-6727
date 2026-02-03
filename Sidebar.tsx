
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileCode, Plus, Trash2, Layout, FolderPlus, BarChart3, Puzzle, Settings, Search, Github, FolderInput, Shield, Folder, ChevronDown, ChevronRight, Download } from 'lucide-react';
import { FileNode, SidebarView, TodoItem, Snippet, Extension } from '../types.ts';

interface SidebarProps {
  files: FileNode[];
  activeFileId: string | null;
  activeView: SidebarView;
  onViewChange: (v: SidebarView) => void;
  onSelectFile: (id: string) => void;
  onCreateFile: (name: string, language: string, parentId?: string | null) => void;
  onCreateFolder: (name: string, parentId?: string | null) => void;
  onDeleteFile: (id: string) => void;
  onToggleFolder: (id: string) => void;
  onShowTemplates: () => void;
  currentBranch: string;
  onSync: () => void;
  onImportFolder?: () => void;
  isSyncing: boolean;
  todos: TodoItem[];
  snippets: Snippet[];
  onAddSnippet: (s: Snippet) => void;
  extensions?: Extension[];
  onGitHubImport: () => void;
  onGenerateGitignore?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  files, activeFileId, activeView, onViewChange, 
  onSelectFile, onCreateFile, onCreateFolder, onDeleteFile, onToggleFolder, onShowTemplates, onSync, onImportFolder, onGitHubImport, onGenerateGitignore
}) => {
  const [showCreateFile, setShowCreateFile] = useState<{show: boolean, parentId: string | null}>({show: false, parentId: null});
  const [showCreateFolder, setShowCreateFolder] = useState<{show: boolean, parentId: string | null}>({show: false, parentId: null});
  const [newName, setNewName] = useState('');

  const handleCreateFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    const ext = newName.split('.').pop() || '';
    const langMap: any = { 
      py: 'python', js: 'javascript', ts: 'typescript', 
      css: 'css', html: 'html', md: 'markdown', 
      sh: 'shell', java: 'java', rust: 'rust', 
      yml: 'yaml', tsx: 'typescript', jsx: 'javascript',
      rs: 'rust', go: 'go', rb: 'ruby'
    };
    onCreateFile(newName, langMap[ext] || 'plaintext', showCreateFile.parentId);
    setNewName(''); setShowCreateFile({show: false, parentId: null});
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    onCreateFolder(newName, showCreateFolder.parentId);
    setNewName(''); setShowCreateFolder({show: false, parentId: null});
  };

  const renderTree = (parentId: string | null = null, depth: number = 0) => {
    const children = files.filter(f => f.parentId === parentId);
    // Folders first, then files
    const sorted = [...children].sort((a, b) => {
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;
      return a.name.localeCompare(b.name);
    });

    return sorted.map(file => {
      if (file.isFolder) {
        return (
          <div key={file.id} className="flex flex-col">
            <div className={`group flex items-center gap-1 hover:bg-white/5 rounded-xl transition-all ${depth > 0 ? 'ml-1' : ''}`}>
              <button 
                onClick={() => onToggleFolder(file.id)}
                className={`flex-1 flex items-center gap-2 px-3 py-1.5 text-[12px] transition-all relative text-slate-400 hover:text-white font-medium`}
              >
                {file.isOpen ? <ChevronDown size={14} className="text-indigo-400" /> : <ChevronRight size={14} />}
                <Folder size={16} className={file.isOpen ? 'text-indigo-400 fill-indigo-400/20' : 'text-slate-600'} />
                <span className="truncate">{file.name}</span>
              </button>
              <div className="opacity-0 group-hover:opacity-100 flex items-center transition-all pr-2">
                <button title="New File" onClick={() => setShowCreateFile({show: true, parentId: file.id})} className="p-1 text-slate-600 hover:text-indigo-400"><Plus size={12}/></button>
                <button title="New Folder" onClick={() => setShowCreateFolder({show: true, parentId: file.id})} className="p-1 text-slate-600 hover:text-indigo-400"><FolderPlus size={12}/></button>
                <button title="Delete Folder" onClick={() => onDeleteFile(file.id)} className="p-1 text-slate-600 hover:text-red-500"><Trash2 size={12}/></button>
              </div>
            </div>
            {file.isOpen && (
              <div className="border-l border-white/5 ml-4 mt-0.5">
                {showCreateFile.show && showCreateFile.parentId === file.id && (
                  <form onSubmit={handleCreateFile} className="px-4 py-1">
                    <input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="File name..." className="w-full bg-slate-900/50 border border-indigo-500/30 text-[10px] text-white rounded-lg px-2 py-1 outline-none" />
                  </form>
                )}
                {showCreateFolder.show && showCreateFolder.parentId === file.id && (
                  <form onSubmit={handleCreateFolder} className="px-4 py-1">
                    <input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Folder name..." className="w-full bg-slate-900/50 border border-indigo-500/30 text-[10px] text-white rounded-lg px-2 py-1 outline-none" />
                  </form>
                )}
                {renderTree(file.id, depth + 1)}
              </div>
            )}
          </div>
        );
      }

      return (
        <div key={file.id} className={`group flex items-center gap-1 ${depth > 0 ? 'ml-1' : ''}`}>
          <button 
            onClick={() => onSelectFile(file.id)} 
            className={`flex-1 flex items-center gap-3 px-3 py-1.5 text-[12px] rounded-xl transition-all relative ${activeFileId === file.id ? 'bg-indigo-600/10 text-indigo-400 font-bold border-l-2 border-indigo-500' : 'text-slate-500 hover:bg-white/5'}`}
          >
            <div className="w-4 flex justify-center">
              <FileCode size={16} className={activeFileId === file.id ? 'text-indigo-400' : 'text-slate-600'} />
            </div>
            <span className="truncate">{file.name}</span>
          </button>
          <button onClick={() => onDeleteFile(file.id)} className="p-2 text-slate-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14}/></button>
        </div>
      );
    });
  };

  return (
    <div className="flex h-full border-r border-white/5 bg-[#020408] relative z-20">
      <div className="w-[68px] flex flex-col items-center py-6 gap-6 border-r border-white/5 bg-black/40">
        <ActivityIcon icon={<Layout size={20}/>} active={activeView === 'explorer'} onClick={() => onViewChange('explorer')} />
        <ActivityIcon icon={<Search size={20}/>} active={activeView === 'search'} onClick={() => onViewChange('search')} />
        <ActivityIcon icon={<Puzzle size={20}/>} active={activeView === 'extensions'} onClick={() => onViewChange('extensions')} />
        <ActivityIcon icon={<BarChart3 size={20}/>} active={activeView === 'stats'} onClick={() => onViewChange('stats')} />
        <div className="mt-auto"><ActivityIcon icon={<Settings size={20}/>} /></div>
      </div>

      <aside className="w-72 flex flex-col bg-black/50 backdrop-blur-3xl overflow-hidden">
        <AnimatePresence mode="wait">
          {activeView === 'explorer' && (
            <motion.div key="explorer" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex-1 flex flex-col">
              <div className="px-6 py-6 flex items-center justify-between">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Explorer</h2>
                <div className="flex gap-1">
                  <SidebarAction title="Shield Protocol (.gitignore)" icon={<Shield size={14} className="text-emerald-500" />} onClick={onGenerateGitignore} />
                  <SidebarAction title="Import from GitHub" icon={<Github size={14} className="text-indigo-400" />} onClick={onGitHubImport} />
                  <SidebarAction title="Import Folder" icon={<FolderPlus size={14} className="text-emerald-400" />} onClick={onImportFolder} />
                  <SidebarAction title="Import ZIP / File" icon={<FolderInput size={14} className="text-sky-400" />} onClick={onSync} />
                  <SidebarAction title="New Module" icon={<Plus size={14} />} onClick={() => setShowCreateFile({show: !showCreateFile.show, parentId: null})} />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 space-y-4 custom-scrollbar">
                {showCreateFile.show && showCreateFile.parentId === null && (
                  <form onSubmit={handleCreateFile} className="mb-4">
                    <input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="App.tsx" className="w-full bg-slate-900 border border-indigo-500/30 text-[11px] text-white rounded-xl px-4 py-2 focus:outline-none focus:border-indigo-500 shadow-xl shadow-indigo-500/10" />
                  </form>
                )}
                {showCreateFolder.show && showCreateFolder.parentId === null && (
                  <form onSubmit={handleCreateFolder} className="mb-4">
                    <input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="src/" className="w-full bg-slate-900 border border-indigo-500/30 text-[11px] text-white rounded-xl px-4 py-2 focus:outline-none focus:border-indigo-500 shadow-xl shadow-indigo-500/10" />
                  </form>
                )}
                <div className="space-y-0.5 pb-20">
                  {files.length === 0 ? (
                    <div className="py-12 px-6 text-center">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 mb-4 italic">Workspace Empty</p>
                      <button onClick={onShowTemplates} className="text-[9px] font-black text-indigo-400 hover:text-white transition-colors uppercase tracking-widest border border-indigo-500/20 px-4 py-2 rounded-lg">Load Templates</button>
                    </div>
                  ) : (
                    renderTree(null)
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </aside>
    </div>
  );
};

const ActivityIcon = ({ icon, active, onClick }: any) => (
  <button onClick={onClick} className={`p-3 rounded-2xl transition-all relative group ${active ? 'text-indigo-400 bg-indigo-500/10 shadow-lg shadow-indigo-600/5' : 'text-slate-600 hover:text-slate-300 hover:bg-white/5'}`}>
    {icon}
    {active && <motion.div layoutId="active_bar" className="absolute -left-12 top-2 bottom-2 w-1.5 bg-indigo-500 rounded-full" />}
  </button>
);

const SidebarAction = ({ icon, onClick, title }: any) => (
  <button title={title} onClick={onClick} className="p-2 text-slate-600 hover:text-white hover:bg-white/5 rounded-xl transition-all">{icon}</button>
);

export default Sidebar;
