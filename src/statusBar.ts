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
  console.log(`[StatusBar] Updating status to: ${state}`);
  if (statusBar) {
    statusBar.text = `CodeMap: ${state}`;
    statusBar.tooltip = `CodeMap AI - ${state}`;
    console.log(`[StatusBar] Status bar updated successfully to: ${statusBar.text}`);
  } else {
    console.log(`[StatusBar] ERROR: statusBar is undefined!`);
  }
}

// Specific status functions for different operations
export function setStatusScanning() {
  console.log(`[StatusBar] setStatusScanning called`);
  updateStatusBar('scanning files…');
}

export function setStatusAnalyzing() {
  console.log(`[StatusBar] setStatusAnalyzing called`);
  updateStatusBar('analyzing code…');
}

export function setStatusGenerating() {
  console.log(`[StatusBar] setStatusGenerating called`);
  updateStatusBar('generating CODEMAP…');
}

export function setStatusSaving() {
  console.log(`[StatusBar] setStatusSaving called`);
  updateStatusBar('saving CODEMAP…');
}

export function setStatusGitDetecting() {
  console.log(`[StatusBar] setStatusGitDetecting called`);
  updateStatusBar('detecting git changes…');
}

export function setStatusUpdating() {
  console.log(`[StatusBar] setStatusUpdating called`);
  updateStatusBar('updating analysis…');
}

export function setStatusIdle() {
  console.log(`[StatusBar] setStatusIdle called`);
  updateStatusBar('idle');
}

export function setStatusWorking(operation: string) {
  console.log(`[StatusBar] setStatusWorking called with: ${operation}`);
  updateStatusBar(`${operation}…`);
}
