// Loads user/workspace config for CodeMap AI
import * as vscode from 'vscode';

export function loadConfig() {
  const config = vscode.workspace.getConfiguration('codemap');
  return {
    maxFileKB: config.get('maxFileKB', 800),
    maxSymbols: config.get('maxSymbols', 1000),
    maxRefs: config.get('maxRefs', 500),
    shardMaxKB: config.get('shardMaxKB', 200),
    debounceMs: config.get('debounceMs', 750),
    enableGitIntegration: config.get('enableGitIntegration', true),
    respectGitignore: config.get('respectGitignore', true),
    extraIgnoreGlobs: config.get('extraIgnoreGlobs', []),
    emitRoutes: config.get('emitRoutes', true),
    emitDatabase: config.get('emitDatabase', true),
    emitSymbols: config.get('emitSymbols', true),
    failCIIfStale: config.get('failCIIfStale', false),
    summaryOnOpen: config.get('summaryOnOpen', true)
  };
}
