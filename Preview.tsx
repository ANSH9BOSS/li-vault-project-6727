import React, { useEffect, useState, useRef } from 'react';
import { 
  Globe, 
  ExternalLink, 
  Smartphone, 
  Tablet as TabletIcon, 
  Monitor, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw,
  Zap,
  MoreHorizontal,
  Maximize2,
  Minimize2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PreviewProps {
  html: string;
  css: string;
  js: string;
  isVisible: boolean;
  onClose?: () => void;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

type DeviceMode = 'mobile' | 'tablet' | 'desktop';

const Preview: React.FC<PreviewProps> = ({ html, css, js, isVisible, onClose, isMaximized, onToggleMaximize }) => {
  const [srcDoc, setSrcDoc] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [device, setDevice] = useState<DeviceMode>('desktop');
  const [zoom, setZoom] = useState(100);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSrcDoc(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
                margin: 0;
                padding: 1rem;
                background-color: white;
                color: #1a1a1a;
                min-height: 100vh;
              }
              ${css}
            </style>
          </head>
          <body>
            ${html}
            <script>
              window.onerror = function(msg, url, line) {
                console.error("Preview Error: " + msg + " at " + line);
                return false;
              };
              ${js}
            </script>
          </body>
        </html>
      `);
    }, 500);

    return () => clearTimeout(timeout);
  }, [html, css, js]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    const current = srcDoc;
    setSrcDoc('');
    setTimeout(() => {
      setSrcDoc(current);
      setIsRefreshing(false);
    }, 600);
  };

  if (!isVisible) return null;

  const deviceWidths = {
    mobile: '375px',
    tablet: '768px',
    desktop: '100%'
  };

  const containerClasses = isMaximized 
    ? "fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-xl flex flex-col p-4 sm:p-12"
    : "flex flex-col h-full bg-[#f1f5f9] border-l border-slate-300 overflow-hidden shadow-inner relative";

  return (
    <div className={containerClasses}>
      {isMaximized && (
        <div className="absolute top-4 right-4 z-[110]">
          <button 
            onClick={onToggleMaximize}
            className="p-3 bg-white/10 hover:bg-red-500/20 text-white rounded-full transition-all border border-white/10"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* Browser Chrome Container */}
      <motion.div 
        layout
        className={`flex flex-col h-full bg-white shadow-2xl overflow-hidden ${isMaximized ? 'rounded-[32px] ring-1 ring-white/20' : ''}`}
      >
        {/* Browser Toolbar */}
        <div className="flex flex-col gap-2 p-3 bg-white border-b border-slate-200 shadow-sm z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex gap-1.5 px-1">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400 opacity-80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 opacity-80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 opacity-80" />
              </div>
              
              <div className="flex items-center gap-1">
                <button className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"><ChevronLeft size={16}/></button>
                <button className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"><ChevronRight size={16}/></button>
                <button onClick={handleRefresh} className={`p-1 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors ${isRefreshing ? 'animate-spin' : ''}`}><RotateCcw size={16}/></button>
              </div>
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <DeviceButton active={device === 'mobile'} onClick={() => setDevice('mobile')} icon={<Smartphone size={14}/>} />
              <DeviceButton active={device === 'tablet'} onClick={() => setDevice('tablet')} icon={<TabletIcon size={14}/>} />
              <DeviceButton active={device === 'desktop'} onClick={() => setDevice('desktop')} icon={<Monitor size={14}/>} />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{zoom}%</span>
              <button 
                onClick={onToggleMaximize}
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                title={isMaximized ? "Minimize" : "Maximize to Big Window"}
              >
                {isMaximized ? <Minimize2 size={16}/> : <Maximize2 size={16}/>}
              </button>
              <button className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"><MoreHorizontal size={16}/></button>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl mx-1">
            <Globe size={12} className="text-emerald-500" />
            <span className="text-[11px] font-medium text-slate-500 flex-1 truncate select-none">
              li-hub://neural-preview/{device}/active_module
            </span>
            <div className="flex items-center gap-1">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-sm" />
               <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Live Link</span>
            </div>
          </div>
        </div>
        
        {/* Viewport Area */}
        <div className="flex-1 bg-slate-100/50 overflow-auto p-4 sm:p-8 flex flex-col items-center custom-scrollbar relative">
          <AnimatePresence>
            {isRefreshing && (
               <motion.div 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }} 
                 exit={{ opacity: 0 }}
                 className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[2px] flex items-center justify-center"
               >
                  <div className="flex flex-col items-center gap-3">
                     <div className="w-12 h-12 border-4 border-indigo-600/10 border-t-indigo-600 rounded-full animate-spin" />
                     <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Rebuilding DOM...</span>
                  </div>
               </motion.div>
            )}
          </AnimatePresence>

          <motion.div 
            layout
            initial={false}
            animate={{ 
              width: deviceWidths[device],
              height: device === 'desktop' ? '100%' : 'calc(100% - 20px)'
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`bg-white shadow-2xl relative overflow-hidden ring-1 ring-slate-300 ${device !== 'desktop' ? 'rounded-[32px] border-[12px] border-slate-800 my-auto' : 'w-full h-full'}`}
          >
            {device !== 'desktop' && (
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-slate-800 rounded-b-2xl z-30 flex items-center justify-center">
                  <div className="w-8 h-1 bg-slate-700 rounded-full" />
               </div>
            )}

            <iframe
              ref={iframeRef}
              srcDoc={srcDoc}
              title="output"
              sandbox="allow-scripts"
              className="w-full h-full border-none bg-white"
            />
          </motion.div>

          {/* Hot Reload Status */}
          <div className="mt-8 px-6 py-2 bg-white border border-slate-200 text-[10px] font-black text-slate-500 rounded-full uppercase tracking-[0.2em] shadow-sm flex items-center gap-3">
             <Zap size={10} className="text-amber-500" />
             Hot Reload Operational
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const DeviceButton = ({ active, onClick, icon }: { active: boolean, onClick: () => void, icon: React.ReactNode }) => (
  <button 
    onClick={onClick} 
    className={`p-2 rounded-lg transition-all ${active ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'}`}
  >
    {icon}
  </button>
);

export default Preview;