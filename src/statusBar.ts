// StatusBar for CodeMap AI
import * as vscode from 'vscode';
let statusBar: vscode.StatusBarItem | undefined;

export function updateStatusBar(state: string) {
  if (!statusBar) {
    statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    statusBar.command = 'codemap.openSummary';
    statusBar.show();
  }
  statusBar.text = `CodeMap: ${state}`;
  statusBar.tooltip = `CodeMap AI - ${state}`;
}

export function setStatusScanning() {
  updateStatusBar('scanning…');
}
export function setStatusIdle() {
  updateStatusBar('idle');
}
