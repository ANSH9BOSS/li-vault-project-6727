
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import JSZip from 'jszip';
import { User, FileNode, Theme, SidebarView, BottomTab, TemplateType, CommitSnapshot, TerminalLine } from '../types.ts';
import Sidebar from './Sidebar.tsx';
import CodeEditor from './CodeEditor.tsx';
import BottomPanel from './BottomPanel.tsx';
import TopBar from './TopBar.tsx';
import AIChat from './AIChat.tsx';
import Preview from './Preview.tsx';
import TemplateGallery from './TemplateGallery.tsx';
import SettingsModal from './SettingsModal.tsx';
import StatusBar from './StatusBar.tsx';
import CommandPalette from './CommandPalette.tsx';
import { Minimize2, Github, CloudUpload, X, Loader2 } from 'lucide-react';
import { deployProjectToGitHub, importFromGitHub, getGitignoreTemplate } from '../services/githubService.ts';
import { runCodeLocally } from '../services/localExecutionService.ts';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, theme, setTheme }) => {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [openFileIds, setOpenFileIds] = useState<string[]>([]);
  const [snapshots, setSnapshots] = useState<CommitSnapshot[]>([]);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  
  const [sidebarView, setSidebarView] = useState<SidebarView>('explorer');
  const [bottomTab, setBottomTab] = useState<BottomTab>('terminal');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [showAIChat, setShowAIChat] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showGitHubImport, setShowGitHubImport] = useState(false);
  const [repoImportPath, setRepoImportPath] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('hub_vault_v8');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFiles(parsed.files || []);
        setActiveFileId(parsed.activeId || null);
        setOpenFileIds(parsed.openIds || []);
        setSnapshots(parsed.snapshots || []);
      } catch (e) {
        handleLoadTemplate('html');
      }
    } else {
      handleLoadTemplate('html');
    }
  }, []);

  useEffect(() => {
    setSaveStatus('saving');
    const data = { files, activeId: activeFileId, openIds: openFileIds, snapshots };
    localStorage.setItem('hub_vault_v8', JSON.stringify(data));
    const timer = setTimeout(() => setSaveStatus('saved'), 800);
    return () => clearTimeout(timer);
  }, [files, activeFileId, openFileIds, snapshots]);

  const activeFile = useMemo(() => files.find(f => f.id === activeFileId) || null, [files, activeFileId]);

  const appendLog = (line: TerminalLine) => setTerminalLines(prev => [...prev, line]);

  const handleRunCode = async () => {
    if (!activeFile) return;
    setIsExecuting(true);
    setBottomTab('terminal');
    try {
      await runCodeLocally(
        activeFile.content,
        activeFile.language,
        activeFile.name,
        appendLog
      );
    } catch (err: any) {
      appendLog({ type: 'error', text: `Execution failed: ${err.message}` });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleDeployToGitHub = async () => {
    if (!user.accessToken || user.accessToken === 'li_neural_access_v8') {
      appendLog({ type: 'error', text: '[Git] Neural Error: Valid Personal Access Token required for sync. Update in identity node.' });
      return;
    }
    setIsSyncing(true);
    appendLog({ type: 'info', text: '[Git] Handshaking with GitHub Nexus...' });
    try {
      const result = await deployProjectToGitHub(user, files, "li-vault-project");
      appendLog({ type: 'success', text: `[System] Shield Secure: Repository pushed to ${result.url}` });
      setSnapshots(prev => [{
        id: Math.random().toString(36).substr(2, 9),
        message: `Pushed to GitHub: ${result.name}`,
        timestamp: Date.now(),
        branch: 'main'
      }, ...prev]);
    } catch (err: any) {
      appendLog({ type: 'error', text: `Deployment Failed: ${err.message}` });
      setSaveStatus('error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGenerateGitignore = () => {
    setBottomTab('terminal');
    appendLog({ type: 'info', text: '[Shield] Scanning workspace for language fingerprints...' });
    const languages = Array.from(new Set<string>(files.map(f => f.language)));
    const content = getGitignoreTemplate(languages);
    
    const existingIdx = files.findIndex(f => f.name === '.gitignore');
    if (existingIdx !== -1) {
      setFiles(prev => prev.map((f, i) => i === existingIdx ? { ...f, content } : f));
      appendLog({ type: 'success', text: '[Shield] Existing .gitignore updated with new fingerprints.' });
      setActiveFileId(files[existingIdx].id);
    } else {
      const newFile = {
        id: 'gitignore-' + Date.now(),
        name: '.gitignore',
        language: 'plaintext',
        content,
        isOpen: true,
        parentId: null
      };
      setFiles(prev => [...prev, newFile]);
      setOpenFileIds(prev => [...prev, newFile.id]);
      setActiveFileId(newFile.id);
      appendLog({ type: 'success', text: '[Shield] New .gitignore module generated.' });
    }
  };

  const handleCreateFile = (name: string, language: string, parentId: string | null = null) => {
    const newFile = {
      id: Date.now().toString(),
      name,
      language,
      content: '',
      isOpen: true,
      parentId
    };
    setFiles(prev => [...prev, newFile]);
    setActiveFileId(newFile.id);
    setOpenFileIds(prev => Array.from(new Set([...prev, newFile.id])));
  };

  const handleCreateFolder = (name: string, parentId: string | null = null) => {
    const newFolder = {
      id: 'folder-' + Date.now(),
      name,
      language: 'folder',
      content: '',
      isFolder: true,
      isOpen: true,
      parentId
    };
    setFiles(prev => [...prev, newFolder]);
  };

  const handleToggleFolder = (id: string) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, isOpen: !f.isOpen } : f));
  };

  const handleGitHubImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoImportPath.includes('/')) {
      alert("Please enter path as 'owner/repo'");
      return;
    }
    setIsSyncing(true);
    appendLog({ type: 'info', text: `[Git] PULL: Initiating recursive fetch for ${repoImportPath}...` });
    try {
      const imported = await importFromGitHub(repoImportPath);
      if (imported.length === 0) throw new Error("Repository appears empty or inaccessible.");
      
      setFiles(prev => [...prev, ...imported]);
      setShowGitHubImport(false);
      setRepoImportPath('');
      if (imported.length > 0) {
         setActiveFileId(imported[0].id);
         setOpenFileIds(prev => Array.from(new Set<string>([...prev, ...imported.map(f => f.id)])));
      }
      appendLog({ type: 'success', text: `[System] Successfully imported ${imported.length} modules from GitHub.` });
    } catch (err: any) {
      appendLog({ type: 'error', text: `Import Failed: ${err.message}` });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportZip = async () => {
    if (files.length === 0) return;
    setIsExecuting(true);
    appendLog({ type: 'info', text: '[System] Compressing workspace modules into Li-Bundle...' });
    try {
      const zip = new JSZip();
      
      const buildZipPath = (file: FileNode): string => {
        let path = file.name;
        let current = file;
        while (current.parentId) {
          const parent = files.find(f => f.id === current.parentId);
          if (parent) {
            path = `${parent.name}/${path}`;
            current = parent;
          } else break;
        }
        return path;
      };

      files.forEach(file => {
        if (!file.isFolder) {
          zip.file(buildZipPath(file), file.content);
        }
      });
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `li_vault_bundle_${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      appendLog({ type: 'success', text: '[System] Workspace bundle exported successfully.' });
    } catch (err: any) {
      appendLog({ type: 'error', text: `Export Failed: ${err.message}` });
    } finally {
      setIsExecuting(false);
    }
  };

  const getLanguageFromFilename = (fname: string) => {
    const ext = fname.split('.').pop() || '';
    const langMap: any = { 
      py: 'python', js: 'javascript', ts: 'typescript', 
      css: 'css', html: 'html', md: 'markdown', 
      json: 'json', sh: 'shell', java: 'java', 
      rs: 'rust', go: 'go', rb: 'ruby', 
      tsx: 'typescript', jsx: 'javascript' 
    };
    return langMap[ext] || 'plaintext';
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setIsSyncing(true);
    const newNodes: FileNode[] = [];
    const folderMap = new Map<string, string>(); // Path -> ID

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      
      if (file.name.endsWith('.zip')) {
        appendLog({ type: 'info', text: `[System] Extracting ZIP: ${file.name}...` });
        const zip = new JSZip();
        const zipContent = await zip.loadAsync(file);
        
        // Step 1: Create all folders first to ensure parents exist
        const paths = Object.keys(zipContent.files).sort((a, b) => a.split('/').length - b.split('/').length);
        
        for (const path of paths) {
          const zipEntry = zipContent.files[path];
          const parts = path.replace(/\/$/, '').split('/');
          const name = parts[parts.length - 1];
          const parentPath = parts.slice(0, -1).join('/');
          const parentId = parentPath ? folderMap.get(parentPath) || null : null;

          if (zipEntry.dir) {
            const folderId = 'folder-' + Math.random().toString(36).substr(2, 9);
            newNodes.push({
              id: folderId,
              name,
              language: 'folder',
              content: '',
              isFolder: true,
              isOpen: true,
              parentId: parentId
            });
            folderMap.set(path.replace(/\/$/, ''), folderId);
          } else {
            const content = await zipEntry.async('string');
            newNodes.push({
              id: Math.random().toString(36).substr(2, 9),
              name,
              language: getLanguageFromFilename(name),
              content,
              isOpen: true,
              parentId: parentId
            });
          }
        }
      } else {
        // Handle regular files or directory structure from webkitdirectory
        const path = (file as any).webkitRelativePath || file.name;
        const parts = path.split('/');
        const name = parts[parts.length - 1];
        
        // Recursively ensure folders exist for the path
        let currentParentId: string | null = null;
        let currentPath = '';
        
        for (let j = 0; j < parts.length - 1; j++) {
          const folderName = parts[j];
          currentPath += (currentPath ? '/' : '') + folderName;
          
          if (!folderMap.has(currentPath)) {
            const folderId = 'folder-' + Math.random().toString(36).substr(2, 9);
            newNodes.push({
              id: folderId,
              name: folderName,
              language: 'folder',
              content: '',
              isFolder: true,
              isOpen: true,
              parentId: currentParentId
            });
            folderMap.set(currentPath, folderId);
            currentParentId = folderId;
          } else {
            currentParentId = folderMap.get(currentPath)!;
          }
        }

        const text = await file.text();
        newNodes.push({
          id: Math.random().toString(36).substr(2, 9),
          name,
          language: getLanguageFromFilename(name),
          content: text,
          isOpen: true,
          parentId: currentParentId
        });
      }
    }

    if (newNodes.length > 0) {
      setFiles(prev => [...prev, ...newNodes]);
      // Open the first imported file if it's not a folder
      const firstFile = newNodes.find(n => !n.isFolder);
      if (firstFile) {
        setActiveFileId(firstFile.id);
        setOpenFileIds(prev => Array.from(new Set<string>([...prev, firstFile.id])));
      }
      appendLog({ type: 'success', text: `[System] Imported ${newNodes.length} nodes successfully.` });
    }
    
    setIsSyncing(false);
    if (e.target) e.target.value = '';
  };

  const handleLoadTemplate = (type: TemplateType) => {
    let nf: FileNode[] = [];
    if (type === 'python') {
      nf = [{ id: 'py-main', name: 'main.py', language: 'python', content: 'print("Li Vault Active")\n# Engineered by Li\n\ndef neural_handshake():\n    print("Handshaking with WASM kernel...")\n\nif __name__ == "__main__":\n    neural_handshake()', isOpen: true, parentId: null }];
    } else if (type === 'react') {
      nf = [{ id: 'tsx-main', name: 'App.tsx', language: 'typescript', content: 'import React from "react";\n\n// Made by Li\nexport const App = () => {\n  return (\n    <div className="li-hub-ui">\n      <h1>Li Vault Workspace</h1>\n      <p>Neural environment initialized.</p>\n    </div>\n  );\n};', isOpen: true, parentId: null }];
    } else {
      nf = [{ id: 'web-index', name: 'index.html', language: 'html', content: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Li Hub Preview</title>\n<style>\n  body { background: #020408; color: #6366f1; display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; font-family: "Plus Jakarta Sans", sans-serif; margin: 0; }\n  h1 { font-weight: 900; letter-spacing: -2px; font-size: 4rem; text-transform: uppercase; margin: 0; }\n  p { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 4px; opacity: 0.5; }\n</style>\n</head>\n<body>\n  <h1>LI HUB</h1>\n  <p>Engineered by Li</p>\n</body>\n</html>', isOpen: true, parentId: null }];
    }
    setFiles(nf);
    setOpenFileIds(nf.map(f => f.id));
    setActiveFileId(nf[0].id);
    setShowTemplates(false);
  };

  return (
    <div className={`flex flex-col h-screen overflow-hidden bg-[#020408] ${isZenMode ? 'p-0' : ''}`}>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileImport} 
        className="hidden" 
        multiple 
        accept=".zip,.html,.js,.sh,.py,.tsx,.ts,.jsx,.css,.json,.md,.txt,.java,.rs,.go,.rb" 
      />
      <input 
        type="file" 
        ref={folderInputRef} 
        onChange={handleFileImport} 
        className="hidden" 
        webkitdirectory="" 
        directory="" 
        multiple 
      />
      
      <AnimatePresence>
        {showPalette && <CommandPalette isOpen={showPalette} onClose={() => setShowPalette(false)} files={files} onSelect={(id) => { setActiveFileId(id); setShowPalette(false); }} />}
        {showTemplates && <TemplateGallery onSelect={handleLoadTemplate} onClose={() => setShowTemplates(false)} />}
        {showSettings && <SettingsModal theme={theme} setTheme={setTheme} onClose={() => setShowSettings(false)} />}
        {showGitHubImport && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-md glass p-10 rounded-[40px] border border-indigo-500/20 shadow-[0_0_50px_rgba(99,102,241,0.2)]">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-400">
                    <Github size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">GitHub Pull</h3>
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Recursive Fetch Mode</span>
                  </div>
                </div>
                <button onClick={() => setShowGitHubImport(false)} className="p-2 text-slate-500 hover:text-white transition-colors"><X size={24}/></button>
              </div>
              <p className="text-slate-400 text-xs mb-8 font-medium leading-relaxed">Enter the repository identifier (e.g. <span className="text-indigo-400 font-mono">li-dev/vault-project</span>). The system will recursively index and pull all modules.</p>
              <form onSubmit={handleGitHubImportSubmit} className="space-y-6">
                <div className="relative group">
                  <input 
                    autoFocus value={repoImportPath} onChange={(e) => setRepoImportPath(e.target.value)}
                    placeholder="owner/repository" className="w-full bg-black border border-white/10 rounded-2xl p-5 text-indigo-400 font-mono text-sm focus:border-indigo-500 outline-none transition-all group-hover:border-white/20" 
                  />
                </div>
                <button disabled={isSyncing} type="submit" className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all shadow-2xl shadow-indigo-600/30 uppercase tracking-[0.2em] text-xs">
                  {isSyncing ? <Loader2 size={18} className="animate-spin" /> : <CloudUpload size={18} />}
                  Handshake & Pull
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isZenMode && (
        <TopBar 
          user={user} onLogout={onLogout} onRun={handleRunCode} isExecuting={isExecuting}
          onSync={handleDeployToGitHub} isSyncing={isSyncing} 
          onToggleAI={() => setShowAIChat(!showAIChat)} onTogglePreview={() => setShowPreview(!showPreview)} 
          onShowSettings={() => setShowSettings(true)}
          branches={[{name: 'main', files: []}]} currentBranch="main" onSwitchBranch={() => {}}
          onCommit={() => {}}
          showPreview={showPreview} onDebug={() => {}} saveStatus={saveStatus}
          onCreateBranch={() => {}} onExport={handleExportZip}
        />
      )}

      <div className="flex-1 flex overflow-hidden relative">
        {!isZenMode && (
          <Sidebar 
            files={files} activeFileId={activeFileId} activeView={sidebarView} onViewChange={setSidebarView}
            onSelectFile={(id) => { 
              const f = files.find(x => x.id === id);
              if (f && !f.isFolder) {
                setActiveFileId(id); 
                setOpenFileIds(prev => Array.from(new Set([...prev, id])));
              }
            }}
            onCreateFile={handleCreateFile}
            onCreateFolder={handleCreateFolder}
            onDeleteFile={(id) => { 
              const deleteRecursive = (idToDelete: string) => {
                const children = files.filter(f => f.parentId === idToDelete);
                children.forEach(child => deleteRecursive(child.id));
                setFiles(prev => prev.filter(f => f.id !== idToDelete));
                setOpenFileIds(prev => prev.filter(f => f !== idToDelete));
              };
              deleteRecursive(id);
              if (activeFileId === id) setActiveFileId(null); 
            }}
            onToggleFolder={handleToggleFolder}
            onShowTemplates={() => setShowTemplates(true)} currentBranch="main" 
            onSync={() => fileInputRef.current?.click()} 
            onImportFolder={() => folderInputRef.current?.click()}
            isSyncing={isSyncing}
            todos={[]} snippets={[]} onAddSnippet={() => {}}
            onGitHubImport={() => setShowGitHubImport(true)}
            onGenerateGitignore={handleGenerateGitignore}
          />
        )}

        <main className="flex-1 flex flex-col min-w-0 bg-[#020408]/40 backdrop-blur-3xl relative">
          <div className="flex-1 flex flex-col overflow-hidden">
            {!isZenMode && (
              <div className="h-11 bg-black/40 flex items-center border-b border-white/5 overflow-x-auto no-scrollbar px-2">
                {openFileIds.map(fid => {
                  const f = files.find(f => f.id === fid);
                  return f ? (
                    <div 
                      key={fid} onClick={() => setActiveFileId(fid)}
                      className={`group px-5 h-full flex items-center gap-3 text-[11px] font-black cursor-pointer transition-all border-r border-white/5 min-w-[150px] relative uppercase tracking-[0.2em] ${activeFileId === fid ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-500 hover:bg-white/5'}`}
                    >
                      <span className="truncate flex-1">{f.name}</span>
                      <button onClick={(e) => { e.stopPropagation(); setOpenFileIds(p => p.filter(id => id !== fid)); }} className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity">×</button>
                      {activeFileId === fid && <motion.div layoutId="t_under" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 shadow-lg shadow-indigo-500/50" />}
                    </div>
                  ) : null;
                })}
              </div>
            )}

            <div className="flex-1 flex overflow-hidden relative">
              <div className="flex-1 flex flex-col min-w-0 border-r border-white/5 relative">
                {isZenMode && (
                  <button onClick={() => setIsZenMode(false)} className="absolute top-6 right-6 z-50 p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-500 hover:text-white transition-all backdrop-blur-xl border border-white/5"><Minimize2 size={20} /></button>
                )}
                <div className="flex-1">
                  <CodeEditor file={activeFile} theme={theme} onChange={(c) => setFiles(p => p.map(f => f.id === activeFileId ? { ...f, content: c } : f))} />
                </div>
              </div>
              
              <AnimatePresence>
                {showPreview && !isZenMode && (
                  <motion.div initial={{ width: 0 }} animate={{ width: '45%' }} exit={{ width: 0 }} className="bg-white overflow-hidden flex flex-col border-l border-white/10 shadow-[-20px_0_40px_rgba(0,0,0,0.5)]">
                    <Preview html={files.find(f => f.language === 'html')?.content || ''} css={files.find(f => f.language === 'css')?.content || ''} js={files.find(f => f.language === 'javascript')?.content || ''} isVisible={showPreview} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {!isZenMode && (
              <div className="h-64">
                <BottomPanel 
                  activeTab={bottomTab} 
                  onTabChange={setBottomTab} 
                  terminalLines={terminalLines} 
                  onClearTerminal={() => setTerminalLines([])} 
                  onDebug={handleRunCode} 
                  searchQuery="" onSearchChange={() => {}} replaceQuery="" onReplaceChange={() => {}} searchResults={[]} onSelectResult={(id) => setActiveFileId(id)} searchInputRef={{ current: null } as any} snapshots={snapshots} 
                  onTerminalCommand={(cmd) => appendLog({ type: 'input', text: cmd })}
                />
              </div>
            )}
          </div>

          <AnimatePresence>
            {showAIChat && !isZenMode && (
              <motion.div initial={{ x: 420 }} animate={{ x: 0 }} exit={{ x: 420 }} className="w-[420px] h-full border-l border-white/5 shadow-2xl z-30 bg-black/80 backdrop-blur-2xl">
                <AIChat activeFile={activeFile} onInsertCode={(code) => setFiles(p => p.map(f => f.id === activeFileId ? { ...f, content: f.content + '\n' + code } : f))} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
      {!isZenMode && <StatusBar branch="main" file={activeFile} theme={theme} />}
    </div>
  );
};

export default Dashboard;
