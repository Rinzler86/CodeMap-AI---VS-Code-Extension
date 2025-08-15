// Trigger: workspace open for CodeMap AI
import * as vscode from 'vscode';
import { scanWorkspace } from '../index/indexStore';
import { showSummaryWebview } from '../ui/summaryWebview';
import { loadConfig } from '../config';
import { getLogger } from '../logger';

export function setupWorkspaceOpenTrigger(context: vscode.ExtensionContext) {
  // Run initial scan when workspace opens
  setTimeout(async () => {
    const config = loadConfig();
    const logger = getLogger();
    
    try {
      await scanWorkspace(config, logger);
      
      if (config.summaryOnOpen) {
        showSummaryWebview();
      }
    } catch (e) {
      logger.appendLine(`Workspace open scan error: ${e}`);
    }
  }, 1000); // Delay to let workspace fully load
}
