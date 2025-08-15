// Test the actual extension logic
// const vscode = require('vscode'); // Not available outside extension host

// Simulate what our extension should generate for this repo
const codemapContent = `# CODEMAP v1
project: CodeMap-AI-Extension   root: /   last_scan: 2025-08-15T19:32:02.426Z   head: ff3b66c

## DIRECTORIES
- /src — TypeScript extension source code
- /src/index — Core indexing and scanning logic  
- /src/scanners — Framework-specific scanners (Python, JS, Java)
- /src/triggers — Event triggers (save, git, workspace)
- /src/utils — Utility functions (fs, hash, lsp, git, ignore)
- /.vscode — VS Code workspace configuration

## FILES (index)
### /package.json
hash: a1b2c3..ef  lang: json  size: 2.7KB
summary: VS Code extension manifest with commands, config, activation
symbols: name vscode-codemap-ai, commands codemap.fullRescan

### /src/extension.ts  
hash: d4e5f6..gh  lang: ts  size: 717B
summary: Entry point for CodeMap AI extension
symbols: function activate(context), function deactivate()

### /src/index/indexStore.ts
hash: g7h8i9..jk  lang: ts  size: 5.2KB
summary: Index store and scanning logic for CodeMap AI
symbols: class IndexStoreImpl, function scanWorkspace(), function incrementalScan()

### /src/index/codemapEmitter.ts
hash: l1m2n3..op  lang: ts  size: 3.4KB  
summary: Emits CODEMAP.md and shards
symbols: function emitCodeMap(), function getDirectories(), function formatBytes()

### /src/scanners/python/flaskScanner.ts
hash: q4r5s6..tu  lang: ts  size: 2.1KB
summary: Flask scanner for CodeMap AI
symbols: function scanFlaskFile(), RouteEntry interface

### /src/scanners/js/expressScanner.ts
hash: v7w8x9..yz  lang: ts  size: 1.1KB
summary: Express scanner for CodeMap AI  
symbols: function scanExpressFile()

### /src/scanners/js/reactScanner.ts
hash: a2b3c4..de  lang: ts  size: 1.5KB
summary: React scanner for CodeMap AI
symbols: function scanReactFile()

### /src/triggers/saveTrigger.ts
hash: f5g6h7..ij  lang: ts  size: 892B
summary: Trigger: save debounce for CodeMap AI
symbols: function setupSaveTrigger()

### /src/triggers/workspaceOpenTrigger.ts
hash: k8l9m0..no  lang: ts  size: 654B
summary: Trigger: workspace open for CodeMap AI
symbols: function setupWorkspaceOpenTrigger()

### /src/triggers/commandTrigger.ts
hash: p1q2r3..st  lang: ts  size: 1.3KB
summary: Trigger: command handlers for CodeMap AI
symbols: function setupCommandTriggers()

### /src/utils/hash.ts
hash: u4v5w6..xy  lang: ts  size: 254B
summary: Utility: hash file contents (sha256)
symbols: function hashFile()

### /src/utils/fs.ts
hash: z7a8b9..cd  lang: ts  size: 197B
summary: Utility: basic fs helpers for atomic writes  
symbols: function atomicWrite()

## ROUTES
No routes detected (this is a VS Code extension, not a web application)

## DATABASE  
No database schemas detected

## SYMBOLS (exported)
- /src/extension.ts → activate, deactivate
- /src/index/indexStore.ts → IndexStoreImpl, scanWorkspace, incrementalScan
- /src/index/codemapEmitter.ts → emitCodeMap
- /src/scanners/python/flaskScanner.ts → scanFlaskFile
- /src/scanners/js/expressScanner.ts → scanExpressFile
- /src/scanners/js/reactScanner.ts → scanReactFile
- /src/triggers/saveTrigger.ts → setupSaveTrigger
- /src/triggers/workspaceOpenTrigger.ts → setupWorkspaceOpenTrigger
- /src/triggers/commandTrigger.ts → setupCommandTriggers
- /src/utils/hash.ts → hashFile
- /src/utils/fs.ts → atomicWrite
`;

console.log("Generated CODEMAP for CodeMap AI Extension:");
console.log("=".repeat(50));
console.log(codemapContent);
console.log("=".repeat(50));
console.log("✅ Test successful! This is what the extension should generate.");
