// Emits CODEMAP.md and shards
import * as path from 'path';
import * as fs from 'fs';
import { FileEntry, RouteEntry, TableEntry } from './schemas';
import { atomicWrite } from '../utils/fs';

export async function emitCodeMap(files: FileEntry[], config: any, workspaceRoot: string): Promise<void> {
  const projectName = path.basename(workspaceRoot);
  const timestamp = new Date().toISOString();
  
  // Build CODEMAP.md content
  let content = `# CODEMAP v1\n`;
  content += `project: ${projectName}   root: /   last_scan: ${timestamp}\n\n`;
  
  // DIRECTORIES section
  content += `## DIRECTORIES\n`;
  const dirs = getDirectories(files);
  for (const dir of dirs) {
    content += `- ${dir.path} — ${dir.description}\n`;
  }
  content += `\n`;
  
  // FILES section
  content += `## FILES (index)\n`;
  for (const file of files) {
    content += `### ${file.path}\n`;
    content += `hash: ${file.hash.slice(0, 6)}..${file.hash.slice(-2)}  lang: ${file.lang}  size: ${formatBytes(file.bytes)}\n`;
    if (file.summary) {
      content += `summary: ${file.summary}\n`;
    }
    if (file.symbols && file.symbols.length > 0) {
      const symbolStrs = file.symbols.map(s => `${s.kind} ${s.name}${s.detail ? `(${s.detail})` : ''}`);
      content += `symbols: ${symbolStrs.join(', ')}\n`;
    }
    if (file.truncated) {
      content += `truncated: true\n`;
    }
    content += `\n`;
  }
  
  // Write main CODEMAP.md
  const codemapPath = path.join(workspaceRoot, 'CODEMAP.md');
  atomicWrite(codemapPath, content);
  
  // TODO: Emit shards for routes, database, symbols if enabled and large enough
}

function getDirectories(files: FileEntry[]): Array<{path: string, description: string}> {
  const dirMap = new Map<string, string[]>();
  
  for (const file of files) {
    const dirPath = path.dirname(file.path);
    if (dirPath === '/') continue;
    
    if (!dirMap.has(dirPath)) {
      dirMap.set(dirPath, []);
    }
    dirMap.get(dirPath)!.push(file.lang);
  }
  
  return Array.from(dirMap.entries()).map(([dirPath, langs]) => {
    const langCounts = langs.reduce((acc, lang) => {
      acc[lang] = (acc[lang] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const primary = Object.entries(langCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
    const description = getDirectoryDescription(dirPath, primary);
    
    return { path: dirPath, description };
  });
}

function getDirectoryDescription(dirPath: string, primaryLang: string): string {
  const dirName = path.basename(dirPath);
  
  // Common patterns
  if (dirName.includes('route') || dirName.includes('api')) return `${primaryLang} API routes`;
  if (dirName.includes('component')) return `${primaryLang} components`;
  if (dirName.includes('model') || dirName.includes('entity')) return `${primaryLang} data models`;
  if (dirName.includes('util') || dirName.includes('helper')) return `${primaryLang} utilities`;
  if (dirName.includes('test') || dirName.includes('spec')) return `${primaryLang} tests`;
  if (dirName.includes('config')) return `${primaryLang} configuration`;
  
  return `${primaryLang} files`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
