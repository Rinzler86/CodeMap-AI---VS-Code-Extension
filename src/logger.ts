// Logger for CodeMap AI
import * as vscode from 'vscode';
let outputChannel: vscode.OutputChannel | undefined;

export function getLogger(): vscode.OutputChannel {
  if (!outputChannel) {
    outputChannel = vscode.window.createOutputChannel('CodeMap AI');
  }
  return outputChannel;
}

export function enableOutputChannel() {
  const logger = getLogger();
  logger.show(true); // Show the output channel
}

export function logError(e: any) {
  getLogger().appendLine(`[ERROR] ${e?.message || e}`);
}
