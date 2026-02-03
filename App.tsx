import React, { useState, useEffect } from 'react';
import AuthPage from './components/AuthPage.tsx';
import Dashboard from './components/Dashboard.tsx';
import { User, AppState, Theme } from './types.ts';

const defaultTheme: Theme = {
  id: 'midnight',
  name: 'Midnight Hub',
  bgDeep: '#020617',
  bgGlass: 'rgba(15, 23, 42, 0.6)',
  accent: '#6366f1',
  textMain: '#f8fafc',
  textMuted: '#94a3b8',
  fontFamily: 'Plus Jakarta Sans'
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('auth');
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  useEffect(() => {
    // Check local storage for session
    const savedUser = localStorage.getItem('devhub_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setAppState('editor');
    }

    const savedTheme = localStorage.getItem('devhub_theme');
    if (savedTheme) {
      setTheme(JSON.parse(savedTheme));
    }
  }, []);

  useEffect(() => {
    // Apply theme to CSS variables
    const root = document.documentElement;
    root.style.setProperty('--bg-deep', theme.bgDeep);
    root.style.setProperty('--bg-glass', theme.bgGlass);
    root.style.setProperty('--brand-primary', theme.accent);
    root.style.setProperty('--text-main', theme.textMain);
    root.style.setProperty('--text-muted', theme.textMuted);
    
    localStorage.setItem('devhub_theme', JSON.stringify(theme));
  }, [theme]);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('devhub_user', JSON.stringify(userData));
    setAppState('editor');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('devhub_user');
    setAppState('auth');
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden" style={{ backgroundColor: theme.bgDeep }}>
      {appState === 'auth' ? (
        <AuthPage onLogin={handleLogin} />
      ) : (
        <Dashboard 
          user={user!} 
          onLogout={handleLogout} 
          theme={theme} 
          setTheme={setTheme} 
        />
      )}
    </div>
  );
};

export default App;