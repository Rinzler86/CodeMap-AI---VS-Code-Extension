// Entry point for CodeMap AI extension
import * as vscode from 'vscode';
import { setupCommandTriggers } from './triggers/commandTrigger';
import { setupSaveTrigger } from './triggers/saveTrigger';
import { setupWorkspaceOpenTrigger } from './triggers/workspaceOpenTrigger';
import { setupGitTrigger } from './triggers/gitTrigger';

// Simple status bar implementation inline
let statusBarItem: vscode.StatusBarItem | undefined;

function initializeStatusBar(context: vscode.ExtensionContext) {
  if (!statusBarItem) {
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.command = 'codemap.openSummary';
    statusBarItem.text = 'CodeMap: idle';
    statusBarItem.tooltip = 'CodeMap AI - Click to open summary';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
  }
}

export function activate(context: vscode.ExtensionContext) {
  console.log('CodeMap AI extension is activating...');
  
  // Debug workspace status
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (workspaceFolders && workspaceFolders.length > 0) {
    console.log(`📁 Workspace detected: ${workspaceFolders[0].uri.fsPath}`);
    console.log(`📁 Total workspace folders: ${workspaceFolders.length}`);
  } else {
    console.log('⚠️ No workspace folders detected at activation');
  }
  
  // Initialize status bar first
  initializeStatusBar(context);

  // Setup all triggers and commands
  setupCommandTriggers(context);
  setupSaveTrigger(context);
  setupGitTrigger(context);
  setupWorkspaceOpenTrigger(context);
  
  console.log('CodeMap AI extension activated successfully!');
}

export function deactivate() {
  console.log('CodeMap AI extension deactivated');
}
