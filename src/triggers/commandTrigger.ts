// Trigger: command handlers for CodeMap AI
import * as vscode from 'vscode';
import { scanWorkspace } from '../index/indexStore';
import { showSummaryWebview } from '../ui/summaryWebview';
import { loadConfig } from '../config';
import { getLogger } from '../logger';
import { setStatusScanning, setStatusIdle } from '../statusBar';

export function setupCommandTriggers(context: vscode.ExtensionContext) {
  // Full rescan command
  context.subscriptions.push(
    vscode.commands.registerCommand('codemap.fullRescan', async () => {
      const config = loadConfig();
      const logger = getLogger();
      
      setStatusScanning();
      try {
        await scanWorkspace(config, logger);
        showSummaryWebview();
        vscode.window.showInformationMessage('CodeMap: Full rescan completed.');
      } catch (e) {
        logger.appendLine(`Full rescan error: ${e}`);
        vscode.window.showErrorMessage('CodeMap: Rescan failed. Check output panel.');
      } finally {
        setStatusIdle();
      }
    })
  );

  // Open summary command
  context.subscriptions.push(
    vscode.commands.registerCommand('codemap.openSummary', () => {
      showSummaryWebview();
    })
  );

  // Validate command
  context.subscriptions.push(
    vscode.commands.registerCommand('codemap.validate', async () => {
      // TODO: Check if CODEMAP.md is stale vs git HEAD
      vscode.window.showInformationMessage('CodeMap: Validation not yet implemented.');
    })
  );
}
