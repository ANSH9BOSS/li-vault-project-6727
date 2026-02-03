
import React, { useEffect, useState } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import { Loader2, Zap, Shield, Cpu, ChevronRight, Home, File } from 'lucide-react';
import { FileNode, Theme } from '../types';
import { motion } from 'framer-motion';

interface CodeEditorProps {
  file: FileNode | null;
  theme: Theme;
  onChange: (content: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ file, theme, onChange }) => {
  const [ghostPos, setGhostPos] = useState({ top: 100, left: 100 });

  useEffect(() => {
    const t = setInterval(() => {
      setGhostPos({
        top: Math.random() * 400 + 100,
        left: Math.random() * 400 + 100
      });
    }, 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    loader.init().then((monaco) => {
      monaco.editor.defineTheme('liHubUltra', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
          { token: 'keyword', foreground: '818cf8', fontStyle: 'bold' },
          { token: 'string', foreground: '34d399' },
          { token: 'number', foreground: 'fbbf24' },
          { token: 'type', foreground: 'a78bfa' },
        ],
        colors: {
          'editor.background': theme.bgDeep,
          'editor.foreground': '#f8fafc',
          'editor.lineHighlightBackground': '#ffffff04',
          'editorLineNumber.foreground': '#334155',
          'editorLineNumber.activeForeground': theme.accent,
          'editor.selectionBackground': theme.accent + '25',
          'editorCursor.foreground': theme.accent,
          'editor.findMatchBackground': theme.accent + '44',
          'editorBracketMatch.background': '#ffffff10',
          'editorBracketMatch.border': theme.accent,
          'editorIndentGuide.background': '#ffffff05',
          'editorIndentGuide.activeBackground': theme.accent + '44',
        },
      });
    });
  }, [theme]);

  if (!file) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-10 bg-black/20">
        <div className="relative group">
          <div className="w-32 h-32 bg-white/5 border border-white/5 rounded-[48px] flex items-center justify-center backdrop-blur-3xl transition-all group-hover:scale-110 duration-700">
            <span className="text-5xl font-black italic text-indigo-500/40 tracking-tighter">LI</span>
          </div>
          <div className="absolute -inset-8 bg-indigo-500/10 blur-[80px] animate-pulse rounded-full pointer-events-none"></div>
        </div>
        <div className="text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-500 mb-3">Workspace Core Offline</p>
          <div className="flex gap-4 items-center justify-center opacity-40">
             <div className="flex items-center gap-2 text-[9px] font-bold uppercase"><Zap size={10}/> Performance</div>
             <div className="flex items-center gap-2 text-[9px] font-bold uppercase"><Shield size={10}/> Integrity</div>
             <div className="flex items-center gap-2 text-[9px] font-bold uppercase"><Cpu size={10}/> Native</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col cursor-glow relative" style={{ backgroundColor: theme.bgDeep }}>
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 px-8 py-2 border-b border-white/5 bg-black/40 text-[10px] font-bold text-slate-500">
         <Home size={12} className="text-indigo-400" />
         <ChevronRight size={10} />
         <span className="uppercase tracking-widest">Root</span>
         <ChevronRight size={10} />
         <File size={12} className="text-indigo-400" />
         <span className="text-white uppercase tracking-widest">{file.name}</span>
      </div>

      {/* Ghost AI Cursor Simulation */}
      <motion.div 
        animate={{ top: ghostPos.top, left: ghostPos.left }}
        className="absolute w-px h-6 bg-indigo-500/40 z-20 pointer-events-none"
        transition={{ duration: 4, ease: "easeInOut" }}
      >
        <div className="absolute top-0 left-0 px-2 py-0.5 bg-indigo-500 text-[8px] font-black text-white rounded-r-md whitespace-nowrap opacity-60">Neural Scanning...</div>
      </motion.div>

      <div className="flex-1 relative overflow-hidden">
        <Editor
          height="100%"
          language={file.language.toLowerCase() === 'java' ? 'java' : file.language.toLowerCase() === 'javascript' ? 'javascript' : file.language.toLowerCase() === 'python' ? 'python' : 'plaintext'}
          value={file.content}
          theme="liHubUltra"
          onChange={(value) => onChange(value || '')}
          options={{
            fontSize: 14,
            fontFamily: theme.fontFamily === 'Plus Jakarta Sans' ? "'Plus Jakarta Sans', sans-serif" : "'JetBrains Mono', monospace",
            minimap: { enabled: true, scale: 0.6, side: 'right' },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 24, bottom: 24 },
            lineNumbersMinChars: 4,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            mouseWheelZoom: true,
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible',
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
              useShadows: false,
            },
            bracketPairColorization: { enabled: true },
            guides: { indentation: true, bracketPairs: true },
            lineHeight: 28,
            letterSpacing: -0.2,
            // Fixed: removed unsupported semanticHighlighting option to fix TS error
            quickSuggestions: true,
            suggestOnTriggerCharacters: true,
          }}
          loading={<div className="h-full bg-black/20 flex items-center justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
