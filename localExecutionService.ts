
import { runCodeInAI } from './geminiService';

// Detect origin automatically for unified Termux hosting
const BACKEND_URL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001';

async function checkBackend() {
    try {
        const res = await fetch(`${BACKEND_URL}/api/files`);
        return res.ok;
    } catch {
        return false;
    }
}

let pyodide: any = null;

async function initPyodide(onLog: (line: any) => void) {
  if (!pyodide) {
    onLog({ type: 'info', text: '[System] Initializing Browser Python Kernel...' });
    try {
      // @ts-ignore
      pyodide = await loadPyodide();
      await pyodide.loadPackage("micropip");
      
      const setupCode = `
import sys
import io

class LiOutput(io.TextIOBase):
    def __init__(self, type_str):
        self.type_str = type_str
    def write(self, s):
        if s.strip():
            from js import window, Object
            detail = Object.fromEntries([['type', self.type_str], ['text', s.strip()]])
            evt = window.CustomEvent.new('li-log', Object.fromEntries([['detail', detail]]))
            window.dispatchEvent(evt)
        return len(s)

sys.stdout = LiOutput('info')
sys.stderr = LiOutput('error')
`;
      await pyodide.runPythonAsync(setupCode);

      window.addEventListener('li-log', (e: any) => {
        if (e && e.detail) onLog(e.detail);
      });

      onLog({ type: 'success', text: '[System] Browser Kernel Active.' });
    } catch (err: any) {
      onLog({ type: 'error', text: `[System] Kernel Init Failed: ${err.message}` });
      throw err;
    }
  }
  return pyodide;
}

export async function runCodeLocally(
  code: string, 
  language: string, 
  fileName: string,
  onLog: (line: { type: 'info' | 'error' | 'success' | 'input' | 'ai', text: string }) => void
): Promise<void> {
  const lang = (language || '').toLowerCase();
  onLog({ type: 'input', text: `exec ${lang} ${fileName}` });

  if ((window as any).setIDEIntensity) (window as any).setIDEIntensity(1.0);

  // 1. Try Termux Backend (Unified Path)
  const backendActive = await checkBackend();
  if (backendActive) {
    onLog({ type: 'info', text: '[Termux] Routing to native binaries...' });
    try {
        const res = await fetch(`${BACKEND_URL}/api/run`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, language, fileName })
        });
        const data = await res.json();
        if (data.output) onLog({ type: 'info', text: data.output });
        if (data.error) onLog({ type: 'error', text: data.error });
        onLog({ type: 'success', text: '[Termux] Native run finished.' });
        return;
    } catch (err: any) {
        onLog({ type: 'error', text: `[Termux] Local bridge error: ${err.message}` });
    }
  }

  // 2. Browser Kernel Fallbacks
  if (lang === 'python' || fileName.endsWith('.py')) {
    try {
      const py = await initPyodide(onLog);
      await py.runPythonAsync(code);
      onLog({ type: 'success', text: '[WASM] Execution finished.' });
    } catch (err: any) {
      onLog({ type: 'error', text: `[WASM Error]: ${err.message}` });
    }
    return;
  }

  if (lang === 'javascript' || lang === 'js' || fileName.endsWith('.js')) {
    try {
        const fn = new Function('console', code);
        const mockConsole = {
            log: (...a: any[]) => onLog({ type: 'info', text: a.join(' ') }),
            error: (...a: any[]) => onLog({ type: 'error', text: a.join(' ') })
        };
        fn(mockConsole);
        onLog({ type: 'success', text: '[Browser] Run complete.' });
    } catch (err: any) {
        onLog({ type: 'error', text: `[Browser Error]: ${err.message}` });
    }
    return;
  }

  // 3. Neural Gemini Simulation (Support ALL languages)
  onLog({ type: 'ai', text: `[Neural Hub] Simulating runtime environment for ${lang}...` });
  try {
    const result = await runCodeInAI(code, lang);
    onLog({ type: 'info', text: result });
    onLog({ type: 'success', text: '[Neural] Simulation finished.' });
  } catch (err: any) {
    onLog({ type: 'error', text: `[Neural Hub] Failed to simulate: ${err.message}` });
  } finally {
    if ((window as any).setIDEIntensity) (window as any).setIDEIntensity(0.4);
  }
}
