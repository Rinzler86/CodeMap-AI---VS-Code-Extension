// Index store and scanning logic for CodeMap AI
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { FileEntry, IndexStore } from './schemas';
import { logError, getLogger } from '../logger';
import { hashFile } from '../utils/hash';
import { detectLang } from '../utils/lsp';
import { emitCodeMap } from './codemapEmitter';
import { getIgnoreGlobs } from '../utils/ignore';

const EXCLUDED_DIRS = ["node_modules", ".git", ".vscode", ".idea", "dist", "build", "target", ".venv", "__pycache__"];

// IndexStore implementation
export class IndexStoreImpl implements IndexStore {
  version: 1 = 1;
  head?: string;
  files: Record<string, { hash: string; lang: string; lastScan: number }> = {};

  static load(workspaceRoot: string): IndexStoreImpl {
    const indexPath = path.join(workspaceRoot, '.vscode', '.codemap', 'index.json');
    try {
      if (fs.existsSync(indexPath)) {
        const data = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
        const store = new IndexStoreImpl();
        Object.assign(store, data);
        return store;
      }
    } catch (e) {
      // Ignore errors, start fresh
    }
    return new IndexStoreImpl();
  }

  save(workspaceRoot: string) {
    const indexDir = path.join(workspaceRoot, '.vscode', '.codemap');
    const indexPath = path.join(indexDir, 'index.json');
    if (!fs.existsSync(indexDir)) {
      fs.mkdirSync(indexDir, { recursive: true });
    }
    fs.writeFileSync(indexPath, JSON.stringify(this, null, 2));
  }
}

// Walk workspace and collect files
function walkWorkspace(root: string, ignoreGlobs: string[], maxFileKB: number): string[] {
  const results: string[] = [];
  
  function walk(dir: string) {
    try {
      for (const entry of fs.readdirSync(dir)) {
        const fullPath = path.join(dir, entry);
        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory()) {
          if (EXCLUDED_DIRS.includes(entry)) continue;
          walk(fullPath);
        } else {
          if (stats.size > maxFileKB * 1024) continue;
          // Skip binary files by extension
          const ext = path.extname(entry).toLowerCase();
          if (['.exe', '.dll', '.so', '.dylib', '.bin', '.zip', '.tar', '.gz', '.jpg', '.png', '.gif', '.pdf'].includes(ext)) continue;
          results.push(fullPath);
        }
      }
    } catch (e) {
      // Skip directories we can't read
    }
  }
  
  walk(root);
  return results;
}

// Extract symbols using VS Code LSP
async function extractSymbols(filePath: string): Promise<any[]> {
  try {
    const uri = vscode.Uri.file(filePath);
    const symbols = await vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', uri) as any[];
    return symbols || [];
  } catch (e) {
    return [];
  }
}

// Main scan function
export async function scanWorkspace(config: any, logger: vscode.OutputChannel): Promise<void> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) return;
  
  const root = workspaceFolders[0].uri.fsPath;
  const indexStore = IndexStoreImpl.load(root);
  
  logger.appendLine(`Scanning workspace: ${root}`);
  
  // Progress reporting
  await vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: "CodeMap: Scanning workspace...",
    cancellable: false
  }, async (progress) => {
    
    const files = walkWorkspace(root, config.extraIgnoreGlobs, config.maxFileKB);
    logger.appendLine(`Found ${files.length} files to scan.`);
    
    const fileEntries: FileEntry[] = [];
    let processed = 0;
    
    for (const filePath of files) {
      const relativePath = path.relative(root, filePath).replace(/\\/g, '/');
      const currentHash = hashFile(filePath);
      const lang = detectLang(filePath);
      
      // Skip if unchanged
      const existing = indexStore.files[relativePath];
      if (existing && existing.hash === currentHash) {
        processed++;
        continue;
      }
      
      // Create file entry
      const stats = fs.statSync(filePath);
      const content = fs.readFileSync(filePath, 'utf8');
      
      const symbols = await extractSymbols(filePath);
      const summary = content.split('\n').find(line => line.trim() && !line.trim().startsWith('#') && !line.trim().startsWith('//'))?. slice(0, 80) || '';
      
      const entry: FileEntry = {
        path: '/' + relativePath,
        lang,
        hash: currentHash,
        bytes: stats.size,
        summary,
        symbols: symbols.slice(0, 150).map(s => ({
          kind: s.kind as any,
          name: s.name,
          detail: s.detail
        })),
        truncated: symbols.length > 150
      };
      
      fileEntries.push(entry);
      
      // Update index store
      indexStore.files[relativePath] = {
        hash: currentHash,
        lang,
        lastScan: Date.now()
      };
      
      processed++;
      progress.report({ 
        increment: (processed / files.length) * 100,
        message: `${processed}/${files.length} files`
      });
    }
    
    // Save index and emit CODEMAP
    indexStore.save(root);
    await emitCodeMap(fileEntries, config, root);
    
    logger.appendLine(`Scan complete: ${fileEntries.length} files processed.`);
  });
}

// Incremental scan for a single file
export async function incrementalScan(doc: vscode.TextDocument, config: any, logger: vscode.OutputChannel): Promise<void> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) return;
  
  const root = workspaceFolders[0].uri.fsPath;
  const filePath = doc.fileName;
  const relativePath = path.relative(root, filePath).replace(/\\/g, '/');
  
  logger.appendLine(`Incremental scan: ${relativePath}`);
  
  // TODO: Update just this file in CODEMAP.md
}
