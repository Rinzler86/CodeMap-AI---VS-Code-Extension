// Trigger: save debounce for CodeMap AI
import * as vscode from 'vscode';
import { scanWorkspace } from '../index/indexStore';
import { loadConfig } from '../config';
import { getLogger, enableOutputChannel } from '../logger';
import { setStatusUpdating, setStatusIdle } from '../statusBar';

let saveTimeout: NodeJS.Timeout | undefined;

export function setupSaveTrigger(context: vscode.ExtensionContext) {
  console.log('[SaveTrigger] Setting up save trigger...');
  
  const disposable = vscode.workspace.onDidSaveTextDocument(async (doc) => {
    console.log(`[SaveTrigger] File saved: ${doc.fileName}`);
    
    const config = loadConfig();
    const logger = getLogger();
    
    // Only trigger for workspace files
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      console.log('[SaveTrigger] No workspace folders, skipping');
      return;
    }
    
    const workspaceRoot = workspaceFolders[0].uri.fsPath;
    if (!doc.fileName.startsWith(workspaceRoot)) {
      console.log('[SaveTrigger] File outside workspace, skipping');
      return;
    }
    
    // Skip certain file types
    const fileName = doc.fileName.toLowerCase();
    if (fileName.includes('codemap.md') || fileName.includes('.git') || fileName.includes('node_modules')) {
      console.log('[SaveTrigger] Ignored file type, skipping');
      return;
    }
    
    logger.appendLine(`📝 File saved: ${doc.fileName}`);
    
    // Clear existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      console.log('[SaveTrigger] Cleared existing timeout');
    }
    
    // Debounce the scan
    console.log(`[SaveTrigger] Starting ${config.debounceMs}ms debounce timer`);
    saveTimeout = setTimeout(async () => {
      try {
        console.log('[SaveTrigger] Debounce complete, starting scan');
        setStatusUpdating();
        enableOutputChannel();
        logger.appendLine('🔄 Auto-scan triggered by file save');
        await scanWorkspace(config, logger);
        setStatusIdle();
        console.log('[SaveTrigger] Scan completed successfully');
      } catch (e) {
        logger.appendLine(`❌ Save trigger error: ${e}`);
        setStatusIdle();
        console.log(`[SaveTrigger] Scan failed: ${e}`);
      }
    }, config.debounceMs);
  });
  
  context.subscriptions.push(disposable);
  console.log('[SaveTrigger] Save trigger setup complete');
}
