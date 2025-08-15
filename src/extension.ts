// Entry point for CodeMap AI extension
import * as vscode from 'vscode';
import { updateStatusBar } from './statusBar';
import { setupCommandTriggers } from './triggers/commandTrigger';
import { setupSaveTrigger } from './triggers/saveTrigger';
import { setupWorkspaceOpenTrigger } from './triggers/workspaceOpenTrigger';
import { setupGitTrigger } from './triggers/gitTrigger';

export function activate(context: vscode.ExtensionContext) {
  // Initialize status bar
  updateStatusBar('idle');

  // Setup all triggers and commands
  setupCommandTriggers(context);
  setupSaveTrigger(context);
  setupGitTrigger(context);
  setupWorkspaceOpenTrigger(context);
}

export function deactivate() {}
