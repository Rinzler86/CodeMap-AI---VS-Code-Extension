// Trigger: workspace open for CodeMap AI
import * as vscode from 'vscode';
import { scanWorkspace } from '../index/indexStore';
import { showSummaryWebview } from '../ui/summaryWebview';
import { loadConfig } from '../config';
import { getLogger, enableOutputChannel } from '../logger';
import { setStatusWorking, setStatusIdle } from '../statusBar';

export function setupWorkspaceOpenTrigger(context: vscode.ExtensionContext) {
  const logger = getLogger();
  console.log('[WorkspaceOpenTrigger] Setting up workspace open trigger...');
  
  // Function to run initial scan
  const runInitialScan = async () => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      logger.appendLine('⚠️ No workspace folder open - skipping initial scan');
      console.log('[WorkspaceOpenTrigger] No workspace folders found');
      return;
    }
    
    console.log('[WorkspaceOpenTrigger] Running initial scan...');
    // Show the output channel for initial scan
    enableOutputChannel();
    logger.appendLine('🚀 Running initial workspace scan...');
    const config = loadConfig();
    
    try {
      setStatusWorking('initial scan');
      await scanWorkspace(config, logger);
      logger.appendLine('✅ Initial scan completed');
      
      if (config.summaryOnOpen) {
        showSummaryWebview();
      }
      setStatusIdle();
      console.log('[WorkspaceOpenTrigger] Initial scan completed successfully');
    } catch (e) {
      logger.appendLine(`❌ Initial scan failed: ${e}`);
      setStatusIdle();
      console.log(`[WorkspaceOpenTrigger] Initial scan failed: ${e}`);
    }
  };
  
  // Check if workspace is already open
  if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
    logger.appendLine('📁 Workspace already open - scheduling initial scan');
    console.log('[WorkspaceOpenTrigger] Workspace detected, scheduling scan');
    // Shorter delay and retry mechanism
    setTimeout(() => {
      console.log('[WorkspaceOpenTrigger] First attempt at 1 second');
      runInitialScan();
    }, 1000);
    
    // Backup attempt in case the first fails
    setTimeout(() => {
      console.log('[WorkspaceOpenTrigger] Backup attempt at 3 seconds');
      runInitialScan();
    }, 3000);
  }
  
  // Listen for workspace folder changes
  const disposable = vscode.workspace.onDidChangeWorkspaceFolders(async (event) => {
    if (event.added.length > 0) {
      logger.appendLine('📁 New workspace folder added - running scan');
      console.log('[WorkspaceOpenTrigger] New workspace folder added');
      await runInitialScan();
    }
  });
  
  context.subscriptions.push(disposable);
  console.log('[WorkspaceOpenTrigger] Workspace open trigger setup complete');
}
