// Basic summary webview for CodeMap AI
import * as vscode from 'vscode';

export function showSummaryWebview() {
  const panel = vscode.window.createWebviewPanel(
    'codemapSummary',
    'CodeMap Summary',
    vscode.ViewColumn.One,
    {}
  );
  panel.webview.html = `<html><body><h2>CodeMap Summary</h2><p>Scan complete. See CODEMAP.md for details.</p></body></html>`;
}
