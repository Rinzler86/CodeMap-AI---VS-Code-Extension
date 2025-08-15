// Trigger: git integration for CodeMap AI
import * as vscode from 'vscode';
import { loadConfig } from '../config';
import { getLogger } from '../logger';

let gitPollingInterval: NodeJS.Timeout | undefined;

export function setupGitTrigger(context: vscode.ExtensionContext) {
  const config = loadConfig();
  if (!config.enableGitIntegration) return;
  
  const logger = getLogger();
  
  // Try to use built-in Git API first
  try {
    const gitExtension = vscode.extensions.getExtension('vscode.git');
    if (gitExtension?.isActive) {
      const git = gitExtension.exports.getAPI(1);
      if (git.repositories.length > 0) {
        const repo = git.repositories[0];
        
        // Listen to repository state changes
        const disposable = repo.state.onDidChange(() => {
          logger.appendLine('Git state changed - triggering scan');
          // TODO: Detect changed files and update CODEMAP.md
        });
        
        context.subscriptions.push(disposable);
        return;
      }
    }
  } catch (e) {
    logger.appendLine(`Git API not available: ${e}`);
  }
  
  // Fallback to polling git rev-parse HEAD
  gitPollingInterval = setInterval(async () => {
    // TODO: Check if HEAD changed, trigger delta scan
  }, 5000);
  
  context.subscriptions.push({
    dispose: () => {
      if (gitPollingInterval) {
        clearInterval(gitPollingInterval);
      }
    }
  });
}
