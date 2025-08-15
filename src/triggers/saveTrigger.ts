// Trigger: save debounce for CodeMap AI
import * as vscode from 'vscode';
import { incrementalScan } from '../index/indexStore';
import { loadConfig } from '../config';
import { getLogger } from '../logger';

let saveTimeout: NodeJS.Timeout | undefined;

export function setupSaveTrigger(context: vscode.ExtensionContext) {
  const disposable = vscode.workspace.onDidSaveTextDocument(async (doc) => {
    const config = loadConfig();
    const logger = getLogger();
    
    // Clear existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    
    // Debounce the scan
    saveTimeout = setTimeout(async () => {
      try {
        await incrementalScan(doc, config, logger);
      } catch (e) {
        logger.appendLine(`Save trigger error: ${e}`);
      }
    }, config.debounceMs);
  });
  
  context.subscriptions.push(disposable);
}
