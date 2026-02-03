
import React, { useState, useEffect } from 'react';
import { Github, Cpu, Sparkles, Zap, Shield, Globe, Terminal, Loader2, ChevronRight, Binary, Database, Network, Box, Lock, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../types';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [bootPhase, setBootPhase] = useState<'idle' | 'kernel' | 'neural' | 'ready'>('idle');
  const [bootLogs, setBootLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [githubToken, setGithubToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);

  const runBootSequence = (user: User) => {
    setBootPhase('kernel');
    const logs = [
      "CORE: Initializing quantum handshake with Node-Runtime...",
      "HW: Detecting Li-Neural NPU v8.2.1-PRO...",
      "FS: Mounting encrypted vault layers...",
      "SYNC: Checking GitHub Nexus bridge integrity...",
      "ENGINE: Optimizing polyglot execution modules...",
      "UI: Rendering spatial 4D background layers...",
      "SECURITY: Shield protocol active (AES-256)...",
      "SYSTEM: Neural Handshake Complete. Welcome, Li-Dev."
    ];
    
    logs.forEach((log, i) => {
      setTimeout(() => {
        setBootLogs(prev => [...prev, log]);
        setProgress(((i + 1) / logs.length) * 100);
        if (i === 2) setBootPhase('neural');
        if (i === logs.length - 1) {
          setBootPhase('ready');
          setTimeout(() => onLogin(user), 1200);
        }
      }, i * 450);
    });
  };

  const simulateLogin = (provider: 'google' | 'github') => {
    runBootSequence({
      name: provider === 'google' ? 'Nexus Architect' : 'Li Root',
      email: `${provider}@li-hub.dev`,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${provider === 'google' ? 'li' : 'nexus'}&backgroundColor=6366f1`,
      provider,
      accessToken: provider === 'github' ? githubToken : 'li_neural_access_v8'
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#020408]">
      <AnimatePresence mode="wait">
        {bootPhase !== 'idle' ? (
          <motion.div 
            key="booting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(20px)' }}
            className="absolute inset-0 z-50 bg-[#020408] flex flex-col items-center justify-center p-8 font-mono overflow-hidden"
          >
            {/* Visual Background FX */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.05)_0%,transparent_70%)]" />
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute w-[1000px] h-[1000px] border border-indigo-500/5 rounded-full opacity-20 pointer-events-none"
            />
            
            <div className="w-full max-w-2xl relative z-10 flex flex-col items-center">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-12 relative"
              >
                 <div className="w-24 h-24 bg-indigo-600 rounded-[32px] flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.4)]">
                    <Activity className="text-white" size={48} />
                 </div>
                 <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -inset-4 bg-indigo-600/20 blur-2xl rounded-full"
                 />
              </motion.div>

              <div className="w-full text-center mb-8">
                <h2 className="text-3xl font-black text-white tracking-tighter mb-2 uppercase italic">Li's Hub Ultimate</h2>
                <div className="flex items-center justify-center gap-4">
                   <span className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.3em]">Booting Protocol v8.2</span>
                   <div className="w-1 h-1 rounded-full bg-slate-700" />
                   <span className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.3em]">Neural Mode</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-md h-1.5 bg-white/5 rounded-full mb-12 overflow-hidden border border-white/5 p-[1px]">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 shadow-[0_0_15px_rgba(99,102,241,0.6)] rounded-full"
                />
              </div>

              <div className="w-full space-y-2 bg-black/40 backdrop-blur-xl p-8 rounded-[32px] border border-white/5 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-500/5 opacity-50" />
                {bootLogs.map((log, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    key={i} 
                    className="text-[11px] flex gap-4 items-center"
                  >
                    <span className="text-indigo-500 font-black opacity-40 select-none min-w-[20px]">{i+1}.</span>
                    <span className={`tracking-tight font-medium ${i === bootLogs.length - 1 ? "text-indigo-400" : "text-slate-400"}`}>
                      {log}
                    </span>
                    {i === bootLogs.length - 1 && bootPhase !== 'ready' && <div className="w-1.5 h-3 bg-indigo-400 animate-pulse" />}
                  </motion.div>
                ))}
                
                {bootPhase === 'ready' && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="mt-6 flex items-center justify-center gap-3 text-emerald-400 text-[10px] font-black uppercase tracking-[0.4em]"
                  >
                     <Zap size={14} className="animate-bounce" /> Handshake Secure - Redirecting...
                  </motion.div>
                )}
              </div>
              
              <div className="mt-12 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                Engineered with Excellence by <span className="text-indigo-500">Li</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex-1 flex flex-col lg:flex-row relative z-10">
            {/* Left Column: Visual Impact */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="hidden lg:flex flex-col justify-center p-24 w-[55%] relative overflow-hidden"
            >
              <div className="space-y-12 relative z-10">
                <motion.div 
                   initial={{ y: -20, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   className="flex items-center gap-6"
                >
                  <div className="w-16 h-16 bg-indigo-600 rounded-[28px] flex items-center justify-center shadow-2xl shadow-indigo-600/40">
                    <Box className="text-white" size={32} />
                  </div>
                  <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic">Li's Hub</h1>
                </motion.div>

                <div className="space-y-6">
                  <h2 className="text-[110px] font-black leading-[0.8] text-white tracking-tighter">
                    Code <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 via-indigo-400 to-white italic">Ultimate.</span>
                  </h2>
                  <p className="text-slate-400 text-2xl max-w-md font-medium leading-relaxed">
                    A high-performance neural workspace engineered by Li. The future of polyglot development starts here.
                  </p>
                </div>

                <div className="flex gap-8 pt-10">
                  <FeatureStat icon={<Binary className="text-indigo-400" size={16}/>} label="ENGINE" value="Polyglot v8" />
                  <div className="w-px h-10 bg-white/10" />
                  <FeatureStat icon={<Network className="text-emerald-400" size={16}/>} label="SYNC" value="Real-time Git" />
                  <div className="w-px h-10 bg-white/10" />
                  <FeatureStat icon={<Shield className="text-sky-400" size={16}/>} label="STORAGE" value="AES-Vault" />
                </div>
              </div>

              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 15, repeat: Infinity }}
                className="absolute -top-40 -left-40 w-[800px] h-[800px] bg-indigo-600/10 blur-[200px] rounded-full"
              />
            </motion.div>

            {/* Right Column: Identity Node */}
            <div className="flex-1 flex items-center justify-center p-12">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md glass p-12 rounded-[48px] shadow-2xl relative border border-white/10"
              >
                <div className="mb-12">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em] mb-4 block">Access Gateway</span>
                  <h3 className="text-4xl font-black text-white mb-2">Initialize</h3>
                  <p className="text-slate-500 text-sm font-medium">Link your credentials to start the neural session</p>
                </div>

                <div className="space-y-4">
                  <AuthButton 
                    onClick={() => simulateLogin('google')} 
                    icon={<Globe size={18}/>} 
                    label="Cloud Nexus" 
                    sub="Google Identity"
                  />

                  <div className="relative py-10 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                    <span className="relative px-6 bg-[#020408] text-[9px] font-black tracking-[0.5em] text-slate-700 uppercase">Secure Bridge</span>
                  </div>

                  <AnimatePresence mode="wait">
                    {!showTokenInput ? (
                      <motion.button 
                        key="git"
                        onClick={() => setShowTokenInput(true)}
                        className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-[28px] shadow-[0_20px_40px_rgba(99,102,241,0.3)] transition-all flex items-center justify-center gap-4 group uppercase tracking-widest text-xs"
                      >
                        <Github size={20} />
                        GitHub Synchronize
                      </motion.button>
                    ) : (
                      <motion.div key="input" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-4">
                        <div className="relative">
                           <input 
                              type="password" 
                              placeholder="Personal Access Token" 
                              value={githubToken} 
                              onChange={(e) => setGithubToken(e.target.value)}
                              className="w-full bg-black border border-white/10 rounded-2xl p-5 text-indigo-400 font-mono text-xs focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-800"
                           />
                           <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-800"><Lock size={14}/></div>
                        </div>
                        <button 
                          onClick={() => simulateLogin('github')}
                          className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all uppercase tracking-widest text-[10px]"
                        >
                          ACTIVATE TOKEN <ChevronRight size={18}/>
                        </button>
                        <button onClick={() => setShowTokenInput(false)} className="w-full text-slate-700 text-[10px] font-black uppercase tracking-widest pt-2 hover:text-slate-400 transition-colors">Cancel Node Session</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <div className="mt-16 flex justify-center">
                  <div className="flex items-center gap-3 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all cursor-help">
                     <span className="text-[9px] font-black text-white uppercase tracking-widest">Powered by Li-Engine v8</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FeatureStat = ({ icon, label, value }: any) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-2 text-white/40">
       {icon}
       <span className="text-[9px] font-black uppercase tracking-[0.2em]">{label}</span>
    </div>
    <span className="text-sm font-bold text-white uppercase">{value}</span>
  </div>
);

const AuthButton = ({ onClick, icon, label, sub }: any) => (
  <button 
    onClick={onClick}
    className="w-full p-6 bg-white/5 border border-white/5 hover:border-indigo-500/30 hover:bg-white/10 rounded-[28px] flex items-center gap-6 transition-all group text-left"
  >
    <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-all">
       {icon}
    </div>
    <div className="flex flex-col">
       <span className="text-white font-black text-sm uppercase tracking-wide">{label}</span>
       <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{sub}</span>
    </div>
  </button>
);

export default AuthPage;
