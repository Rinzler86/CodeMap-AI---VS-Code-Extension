// Trigger: workspace open for CodeMap AI
import * as vscode from 'vscode';
import { scanWorkspace } from '../index/indexStore';
import { showSummaryWebview } from '../ui/summaryWebview';
import { loadConfig } from '../config';
import { getLogger, enableOutputChannel } from '../logger';
import { setStatusWorking, setStatusIdle } from '../statusBar';

export function setupWorkspaceOpenTrigger(context: vscode.ExtensionContext) {
  const logger = getLogger();
  
  // Function to run initial scan
  const runInitialScan = async () => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      logger.appendLine('⚠️ No workspace folder open - skipping initial scan');
      return;
    }
    
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
    } catch (e) {
      logger.appendLine(`❌ Initial scan failed: ${e}`);
      setStatusIdle();
    }
  };
  
  // Check if workspace is already open
  if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
    logger.appendLine('📁 Workspace already open - running initial scan');
    // Small delay to ensure everything is loaded
    setTimeout(runInitialScan, 2000);
  }
  
  // Listen for workspace folder changes
  const disposable = vscode.workspace.onDidChangeWorkspaceFolders(async (event) => {
    if (event.added.length > 0) {
      logger.appendLine('📁 New workspace folder added - running scan');
      await runInitialScan();
    }
  });
  
  context.subscriptions.push(disposable);
}
