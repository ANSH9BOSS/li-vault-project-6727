
import { User, FileNode } from '../types.ts';

function toBase64(str: string): string {
  try {
    const bytes = new TextEncoder().encode(str);
    const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
    return btoa(binString);
  } catch (err) {
    console.error('Base64 encoding failed:', err);
    return '';
  }
}

/**
 * Creates a new repository and uploads all workspace files.
 */
export async function deployProjectToGitHub(user: User, files: FileNode[], projectName: string) {
  if (!user.accessToken || user.provider !== 'github' || user.accessToken === 'li_neural_access_v8') {
    throw new Error('Identity Fault: A valid Personal Access Token (PAT) with "repo" scope is required.');
  }

  const token = user.accessToken;
  const repoName = (projectName || 'li-vault-project').replace(/\s+/g, '-').toLowerCase().replace(/[^a-z0-9-]/g, '');
  const finalRepoName = `${repoName}-${Math.floor(Math.random() * 10000)}`;

  try {
    // 1. Create Repository
    const createRes = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: finalRepoName,
        description: 'Engineered via LI HUB ULTIMATE | Neural Workspace',
        private: false,
        auto_init: false // We will push manually
      })
    });

    if (!createRes.ok) {
      const err = await createRes.json();
      console.error('GitHub API Response:', err);
      // More specific error messages for common GitHub API failures
      if (err.message.includes('Repository creation failed')) {
         throw new Error(`GitHub Refusal: ${err.errors?.[0]?.message || 'Name collision or invalid scope'}`);
      }
      throw new Error(err.message || 'Identity Node blocked by GitHub security.');
    }

    const repoData = await createRes.json();
    const owner = repoData.owner.login;

    // 2. Upload Files sequentially to avoid rate limits
    for (const file of files) {
      if (!file.content) continue;
      const path = file.name;
      const content = toBase64(file.content);

      await fetch(`https://api.github.com/repos/${owner}/${finalRepoName}/contents/${path}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Sync: ${file.name} [Li Engine]`,
          content: content
        })
      });
    }

    return { success: true, url: repoData.html_url, name: finalRepoName };
  } catch (err: any) {
    console.error('GitHub Deploy Fault:', err);
    throw err;
  }
}

/**
 * Fetches files from a public GitHub repository recursively.
 */
export async function importFromGitHub(repoPath: string): Promise<FileNode[]> {
  const fileNodes: FileNode[] = [];
  
  async function fetchPath(path: string = '') {
    const url = `https://api.github.com/repos/${repoPath}/contents/${path}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Path ${path} not found or rate limited.`);
    
    const items = await res.json();
    const itemsArray = Array.isArray(items) ? items : [items];

    for (const item of itemsArray) {
      if (item.type === 'file') {
        const fileRes = await fetch(item.download_url);
        const content = await fileRes.text();
        const ext = item.name.split('.').pop() || '';
        const langMap: any = { 
          py: 'python', js: 'javascript', ts: 'typescript', css: 'css', 
          html: 'html', md: 'markdown', sh: 'shell', java: 'java', 
          rust: 'rust', yml: 'yaml', tsx: 'typescript', jsx: 'javascript', json: 'json' 
        };
        
        fileNodes.push({
          id: Math.random().toString(36).substr(2, 9),
          name: item.path,
          language: langMap[ext] || 'plaintext',
          content,
          isOpen: true
        });
      } else if (item.type === 'dir') {
        await fetchPath(item.path);
      }
    }
  }

  await fetchPath();
  return fileNodes;
}

export function getGitignoreTemplate(languages: string[]): string {
  let template = "# LI HUB ULTIMATE - Auto-Generated .gitignore\n# Engineered by Li\n\n";
  template += ".DS_Store\nThumbs.db\n.env\n.env.local\n.env.development.local\n.env.test.local\n.env.production.local\n\n";

  if (languages.includes('javascript') || languages.includes('typescript')) {
    template += "# Node.js\nnode_modules/\nnpm-debug.log*\nyarn-debug.log*\nyarn-error.log*\n.pnpm-debug.log*\n.npm/\nbuild/\ndist/\n.next/\n\n";
  }
  
  if (languages.includes('python')) {
    template += "# Python\n__pycache__/\n*.py[cod]\n*$py.class\n.venv/\nvenv/\nENV/\n.pytest_cache/\n.coverage\nhtmlcov/\n\n";
  }

  if (languages.includes('java')) {
    template += "# Java\n*.class\n*.log\n*.jar\n*.war\n*.ear\n.gradle/\nbuild/\nbin/\n\n";
  }

  return template;
}
