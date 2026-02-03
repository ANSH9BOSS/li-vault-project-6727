
export interface FileNode {
  id: string;
  name: string;
  language: string;
  content: string;
  isOpen?: boolean;
  isFolder?: boolean;
  parentId?: string | null;
}

export interface Branch {
  name: string;
  files: FileNode[];
}

export interface User {
  name: string;
  email: string;
  avatar: string;
  provider: 'google' | 'github';
  accessToken?: string;
}

export interface TerminalLine {
  type: 'info' | 'error' | 'success' | 'input' | 'ai';
  text: string;
}

export interface Theme {
  id: string;
  name: string;
  bgDeep: string;
  bgGlass: string;
  accent: string;
  textMain: string;
  textMuted: string;
  fontFamily: string;
}

export interface SearchResult {
  fileId: string;
  fileName: string;
  line: number;
  text: string;
}

export interface TodoItem {
  id: string;
  fileId: string;
  fileName: string;
  line: number;
  text: string;
  completed: boolean;
}

export interface Snippet {
  id: string;
  name: string;
  code: string;
  language: string;
}

export interface Extension {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  icon: string;
}

export interface CommitSnapshot {
  id: string;
  message: string;
  timestamp: number;
  branch: string;
}

export type SidebarView = 'explorer' | 'git' | 'stats' | 'todos' | 'snippets' | 'extensions' | 'search' | 'graph' | 'assets';
export type BottomTab = 'terminal' | 'search' | 'replace' | 'problems' | 'ai' | 'timeline' | 'performance' | 'network';

export type AppState = 'auth' | 'editor';

export type TemplateType = 'html' | 'python' | 'react' | 'minecraft' | 'discord' | 'npm';
