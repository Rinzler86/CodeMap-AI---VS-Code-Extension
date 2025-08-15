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
import { analyzeFile, isImportantFile } from '../analyzers/codeAnalyzer';

// Check if a file is binary by extension or content
function isBinaryFile(filePath: string): boolean {
  const binaryExts = new Set([
    'exe', 'dll', 'so', 'dylib', 'bin', 'dat', 'db', 'sqlite', 'sqlite3',
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico', 'bmp', 'tiff',
    'mp3', 'mp4', 'avi', 'mov', 'wmv', 'flv', 'wav', 'ogg',
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
    'zip', 'tar', 'gz', 'rar', '7z', 'bz2',
    'ttf', 'otf', 'woff', 'woff2', 'eot'
  ]);
  
  const ext = path.extname(filePath).slice(1).toLowerCase();
  return binaryExts.has(ext);
}

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
function walkWorkspace(root: string, ignoreGlobs: string[], maxFileKB: number, logger?: vscode.OutputChannel): string[] {
  const results: string[] = [];
  
  logger?.appendLine(`🔍 Starting walkWorkspace with root: ${root}`);
  logger?.appendLine(`📋 Max file size: ${maxFileKB}KB`);
  logger?.appendLine(`🚫 Ignore globs: ${JSON.stringify(ignoreGlobs)}`);
  
  // Check if root directory exists
  if (!fs.existsSync(root)) {
    logger?.appendLine(`❌ ERROR: Root directory does not exist: ${root}`);
    return results;
  }
  
  function walk(dir: string) {
    try {
      logger?.appendLine(`📂 Entering directory: ${dir}`);
      const entries = fs.readdirSync(dir);
      logger?.appendLine(`📁 Found ${entries.length} entries in ${dir}: [${entries.join(', ')}]`);
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        logger?.appendLine(`🔍 Examining: ${fullPath}`);
        
        let stats;
        try {
          stats = fs.statSync(fullPath);
        } catch (e) {
          logger?.appendLine(`⚠️ Could not stat ${fullPath}: ${e}`);
          continue;
        }
        
        if (stats.isDirectory()) {
          if (EXCLUDED_DIRS.includes(entry)) {
            logger?.appendLine(`🚫 Skipping excluded directory: ${entry}`);
            continue;
          }
          logger?.appendLine(`📂 Recursing into directory: ${entry}`);
          walk(fullPath);
        } else {
          logger?.appendLine(`📄 Processing file: ${entry} (${stats.size} bytes)`);
          
          if (stats.size > maxFileKB * 1024) {
            logger?.appendLine(`🚫 Skipping large file: ${entry} (${stats.size} bytes > ${maxFileKB * 1024})`);
            continue;
          }
          
          // Skip binary files by extension
          const ext = path.extname(entry).toLowerCase();
          const binaryExts = ['.exe', '.dll', '.so', '.dylib', '.bin', '.zip', '.tar', '.gz', '.jpg', '.png', '.gif', '.pdf', '.ico', '.woff', '.woff2', '.ttf'];
          if (binaryExts.includes(ext)) {
            logger?.appendLine(`🚫 Skipping binary file: ${entry} (extension: ${ext})`);
            continue;
          }
          
          logger?.appendLine(`✅ Adding file: ${fullPath}`);
          results.push(fullPath);
        }
      }
    } catch (e) {
      logger?.appendLine(`❌ Error reading directory ${dir}: ${e}`);
    }
  }
  
  walk(root);
  logger?.appendLine(`📊 walkWorkspace completed - Total files found: ${results.length}`);
  return results;
}

// Extract symbols using VS Code LSP
async function extractSymbols(filePath: string, logger?: vscode.OutputChannel): Promise<any[]> {
  try {
    const uri = vscode.Uri.file(filePath);
    logger?.appendLine(`Extracting symbols for: ${filePath}`);
    const symbols = await vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', uri) as any[];
    logger?.appendLine(`Found ${symbols?.length || 0} symbols for ${path.basename(filePath)}`);
    return symbols || [];
  } catch (e) {
    logger?.appendLine(`Error extracting symbols from ${filePath}: ${e}`);
    return [];
  }
}

// Main scan function
export async function scanWorkspace(config: any, logger: vscode.OutputChannel): Promise<void> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    logger.appendLine('❌ No workspace folders found!');
    return;
  }
  
  const root = workspaceFolders[0].uri.fsPath;
  logger.appendLine(`🚀 Starting scan of workspace: ${root}`);
  logger.appendLine(`�️ Platform: ${process.platform}`);
  logger.appendLine(`�📋 Config: maxFileKB=${config.maxFileKB}, extraIgnoreGlobs=${JSON.stringify(config.extraIgnoreGlobs)}`);
  
  // Verify the workspace directory exists and list its immediate contents
  try {
    const entries = fs.readdirSync(root);
    logger.appendLine(`📁 Workspace root contents (${entries.length} items): [${entries.slice(0, 10).join(', ')}${entries.length > 10 ? '...' : ''}]`);
  } catch (e) {
    logger.appendLine(`❌ ERROR: Cannot read workspace root directory: ${e}`);
    return;
  }
  
  const indexStore = IndexStoreImpl.load(root);
  logger.appendLine(`💾 Loaded index store with ${Object.keys(indexStore.files).length} existing files`);
  
  // Progress reporting
  await vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: "CodeMap: Scanning workspace...",
    cancellable: false
  }, async (progress) => {
    
    const files = walkWorkspace(root, config.extraIgnoreGlobs, config.maxFileKB, logger);
    logger.appendLine(`📊 File discovery complete: Found ${files.length} files to scan.`);
    
    if (files.length === 0) {
      logger.appendLine('⚠️  WARNING: No files found! This might indicate a problem with file discovery.');
      logger.appendLine(`🔍 Double-check workspace root: ${root}`);
      logger.appendLine(`📂 Try checking if this directory exists and has readable files.`);
    }
    
    // Log first few files for debugging
    logger.appendLine(`📄 Sample files found:`);
    files.slice(0, 5).forEach((file, i) => {
      logger.appendLine(`   ${i + 1}. ${path.relative(root, file)}`);
    });
    if (files.length > 5) {
      logger.appendLine(`   ... and ${files.length - 5} more files`);
    }
    
    const fileEntries: FileEntry[] = [];
    let processed = 0;
    
    for (const filePath of files) {
      const relativePath = path.relative(root, filePath).replace(/\\/g, '/');
      const currentHash = hashFile(filePath);
      const lang = detectLang(filePath);
      
      logger.appendLine(`Processing file: ${relativePath}, hash: ${currentHash.slice(0, 8)}, lang: ${lang}`);
      
      // Skip processing if unchanged (but still include in CODEMAP)
      const existing = indexStore.files[relativePath];
      const stats = fs.statSync(filePath);
      
      let entry: FileEntry;
      
      if (existing && existing.hash === currentHash) {
        logger.appendLine(`Skipping unchanged file: ${relativePath}`);
        // Create entry from existing data without re-processing
        entry = {
          path: '/' + relativePath,
          lang,
          hash: currentHash,
          bytes: stats.size,
          summary: '', // We could cache this too if needed
          symbols: [], // We could cache this too if needed
          truncated: false,
          deepAnalysis: undefined // TODO: Could cache deep analysis results if needed
        };
        
        // But still check if this file should have deep analysis for the current run
        if (stats.size < 1024 * 1024 && !isBinaryFile(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          if (isImportantFile(filePath, content)) {
            logger.appendLine(`🔍 Re-analyzing important unchanged file for deep analysis: ${relativePath}`);
            try {
              const analysisResult = await analyzeFile(filePath, content, lang);
              entry.deepAnalysis = (analysisResult as any).deepAnalysis;
              entry.summary = analysisResult.summary || `${Math.round(stats.size / 1024)}KB file`;
              entry.symbols = analysisResult.symbols.slice(0, 150).map(s => ({
                kind: s.kind,
                name: s.name,
                detail: s.detail
              }));
            } catch (error) {
              logger.appendLine(`⚠️  Error analyzing ${relativePath}: ${error}`);
            }
          }
        }
      } else {
        // Process changed file with advanced analysis
        logger.appendLine(`🔍 Analyzing changed file: ${relativePath}`);
        
        let content = '';
        let analysisResult: {
          summary: string;
          symbols: any[];
          refs: string[];
          detectors: string[];
        } = { summary: '', symbols: [], refs: [], detectors: [] };
        
        try {
          // Read file content if it's not binary and not too large
          if (stats.size < 1024 * 1024 && !isBinaryFile(filePath)) { // 1MB limit
            content = fs.readFileSync(filePath, 'utf8');
            analysisResult = await analyzeFile(filePath, content, lang);
          } else {
            analysisResult.summary = stats.size >= 1024 * 1024 ? 'Large file' : 'Binary file';
          }
        } catch (error) {
          logger.appendLine(`⚠️  Error reading ${relativePath}: ${error}`);
          analysisResult.summary = 'Error reading file';
        }
        
        entry = {
          path: '/' + relativePath,
          lang,
          hash: currentHash,
          bytes: stats.size,
          summary: analysisResult.summary || `${Math.round(stats.size / 1024)}KB file`,
          symbols: analysisResult.symbols.slice(0, 150).map(s => ({
            kind: s.kind,
            name: s.name,
            detail: s.detail
          })),
          refs: analysisResult.refs.slice(0, 50),
          detectors: analysisResult.detectors,
          truncated: analysisResult.symbols.length > 150 || analysisResult.refs.length > 50,
          deepAnalysis: (analysisResult as any).deepAnalysis // Preserve deep analysis results
        };
      }
      
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
