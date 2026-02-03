
import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Loader2, Copy, FileEdit, Check, Bug, Code2, Zap, BrainCircuit, Lightbulb, Info, Mic, MicOff, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI } from "@google/genai";
import { FileNode } from '../types';

interface AIChatProps {
  activeFile: FileNode | null;
  onInsertCode: (code: string) => void;
}

const AIChat: React.FC<AIChatProps> = ({ activeFile, onInsertCode }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: "Neural Node connected. I am Li-AI v5.0. I can now Auto-Fix execution errors detected in your terminal. How can I assist your engineering today?" }
  ]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  // Global error listener for Auto-Fix capability
  useEffect(() => {
    const handleAutoFix = (e: any) => {
       if (e.detail && e.detail.error) {
          handleSendMessage(`Fix this execution error: ${e.detail.error}`);
       }
    };
    window.addEventListener('li-autofix', handleAutoFix);
    return () => window.removeEventListener('li-autofix', handleAutoFix);
  }, []);

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const prompt = `
        Current Workspace File: ${activeFile?.name || 'none'}
        Language: ${activeFile?.language || 'unknown'}
        Context Code: ${activeFile?.content || 'no code open'}
        
        User Request: ${textToSend}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: "You are Li-AI, the expert developer companion. You excel at Minecraft plugin development (Spigot/Bukkit), Discord bot architecture (discord.js/discord.py), and Python WASM engineering. Provide production-ready code with detailed neural refactors. Always use markdown for code blocks.",
          temperature: 0.7,
        }
      });

      setMessages(prev => [...prev, { role: 'ai', text: response.text || "Neural stream ended with no feedback." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "Neural link timeout. Switching to local logic caches..." }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSpeech = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Neural Audio API not supported in this shell.");
      return;
    }
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    if (isListening) {
      setIsListening(false);
      recognition.stop();
    } else {
      setIsListening(true);
      recognition.start();
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
    }
  };

  const renderContent = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith('```')) {
        const match = part.match(/```(\w+)?\n([\s\S]*?)```/);
        const code = match?.[2] || '';
        return (
          <div key={i} className="my-4 rounded-2xl overflow-hidden border border-white/10 bg-black/50 group/code">
            <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
              <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Neural Snippet</span>
              <button onClick={() => onInsertCode(code)} className="p-1.5 hover:bg-indigo-600 rounded-lg text-slate-400 hover:text-white transition-all">
                <FileEdit size={12}/>
              </button>
            </div>
            <pre className="p-4 text-[11px] code-font text-indigo-100/90 overflow-x-auto"><code>{code}</code></pre>
          </div>
        );
      }
      return <p key={i} className="mb-4 text-slate-300 leading-relaxed text-[12px]">{part}</p>;
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#020408]">
      <div className="px-6 py-5 border-b border-white/5 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20 shadow-lg shadow-indigo-600/30">
            <BrainCircuit size={20} className="text-indigo-400" />
          </div>
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Li-AI Neural Node</h3>
            <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Context Active
            </span>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {messages.map((m, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            key={i} 
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] p-5 rounded-[28px] shadow-2xl ${
              m.role === 'user' 
              ? 'bg-indigo-600 text-white font-medium shadow-indigo-600/20' 
              : 'bg-white/5 border border-white/5 text-slate-300 backdrop-blur-3xl'
            }`}>
              {m.role === 'ai' ? renderContent(m.text) : m.text}
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex items-center gap-3 text-indigo-400 font-black text-[10px] uppercase tracking-[0.4em] ml-2">
            <Loader2 className="animate-spin" size={12}/> Handshaking with Engine...
          </div>
        )}
      </div>

      <div className="p-6 border-t border-white/5 bg-black/20">
        <div className="relative group">
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
            placeholder="Describe a feature or paste an error..."
            className="w-full bg-[#020408] border border-white/5 rounded-[32px] p-6 pr-32 text-[12px] text-white focus:outline-none focus:border-indigo-500 transition-all resize-none h-28 placeholder:text-slate-700 shadow-inner group-hover:border-white/10"
          />
          <div className="absolute right-4 bottom-4 flex items-center gap-2">
             <button onClick={toggleSpeech} className={`p-4 rounded-2xl transition-all ${isListening ? 'bg-red-500/10 text-red-500 animate-pulse' : 'text-slate-600 hover:text-indigo-400 hover:bg-white/5'}`}>
                {isListening ? <Mic size={20}/> : <MicOff size={20}/>}
             </button>
             <button 
               disabled={loading || !input.trim()}
               onClick={() => handleSendMessage()}
               className="p-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl transition-all shadow-2xl shadow-indigo-600/40 active:scale-95 disabled:opacity-50"
             >
                <Send size={20} />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
