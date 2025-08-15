// StatusBar for CodeMap AI
import * as vscode from 'vscode';
let statusBar: vscode.StatusBarItem | undefined;

export function initializeStatusBar(context: vscode.ExtensionContext) {
  if (!statusBar) {
    statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBar.command = 'codemap.openSummary';
    statusBar.text = 'CodeMap: idle';
    statusBar.tooltip = 'CodeMap AI - Click to open summary';
    statusBar.show();
    
    // Add to disposables so it gets cleaned up
    context.subscriptions.push(statusBar);
  }
}

export function updateStatusBar(state: string) {
  if (statusBar) {
    statusBar.text = `CodeMap: ${state}`;
    statusBar.tooltip = `CodeMap AI - ${state}`;
  }
}

export function setStatusScanning() {
  updateStatusBar('scanning…');
}

export function setStatusIdle() {
  updateStatusBar('idle');
}
