# CODEMAP v1
project: CodeMapExtension   root: /   last_scan: 2025-08-16T03:25:44.325Z

## PROJECT OVERVIEW
**Total Files**: 39 (152.9KB)
**Languages**: codemapignore, gitignore, md, js, json, ts
**Analyzed Files**: 39 with detailed symbol extraction


## DIRECTORIES
- /src — ts files
- /src/analyzers — ts files
- /src/index — ts files
- /src/scanners — ts files
- /src/scanners/js — ts files
- /src/scanners/python — ts files
- /src/triggers — ts files
- /src/ui — ts files
- /src/utils — ts utilities

## FILES (detailed)
### /README.md
hash: 6e0137..8b  lang: md  size: 2.8KB
DEBUG: File props: path, lang, hash, bytes, summary, symbols, truncated, deepAnalysis
summary: // README for CodeMap AI extension
**DEEP ANALYSIS FOUND**

### /package.json
hash: d36ec8..70  lang: json  size: 2.9KB
DEBUG: File props: path, lang, hash, bytes, summary, symbols, truncated, deepAnalysis
summary: JSON file analysis not fully implemented yet
**DEEP ANALYSIS FOUND**

### /src/index/indexStore.ts
hash: 0f7141..bf  lang: ts  size: 13.6KB
DEBUG: File props: path, lang, hash, bytes, summary, symbols, truncated, deepAnalysis
summary: indexStore.ts (vscode-extension) - 6 functions, 1 classes
**DEEP ANALYSIS FOUND**
imports:
  default import from 'vscode': * as vscode
  default import from 'path': * as path
  default import from 'fs': * as fs
  named import from './schemas': FileEntry, IndexStore
  named import from '../logger': logError, getLogger
  named import from '../utils/hash': hashFile
  named import from '../utils/lsp': detectLang
  named import from './codemapEmitter': emitCodeMap
  named import from '../utils/ignore': getIgnoreGlobs
  named import from '../statusBar': setStatusScanning, setStatusAnalyzing, setStatusGenerating, setStatusSaving, setStatusIdle
  named import from '../analyzers/codeAnalyzer': analyzeFile, isImportantFile
exports:
  class 'IndexStoreImpl' (line 32)
  function 'scanWorkspace' (line 146)
  function 'incrementalScan' (line 327)

      **Functions:**
      - `isBinaryFile` - Check if a file is binary by extension or content (filePath: string)
      - `walkWorkspace` - Walk workspace and collect files (root: string, ignoreGlobs: string[], maxFileKB: number, logger?: vscode.OutputChannel)
      - `walk` (dir: string)
      - `extractSymbols` - Extract symbols using VS Code LSP (filePath: string, logger?: vscode.OutputChannel)
      - `scanWorkspace` - Main scan function (config: any, logger: vscode.OutputChannel)
      - `incrementalScan` - Incremental scan for a single file (doc: vscode.TextDocument, config: any, logger: vscode.OutputChannel)

      **Classs:**
      - `IndexStoreImpl` - Class

### /tsconfig.json
hash: 68a135..1f  lang: json  size: 283B
DEBUG: File props: path, lang, hash, bytes, summary, symbols, truncated, deepAnalysis
summary: JSON file analysis not fully implemented yet
**DEEP ANALYSIS FOUND**

### /src/config.ts
hash: 1bb08a..e4  lang: ts  size: 886B
DEBUG: File props: path, lang, hash, bytes, summary, symbols, truncated, deepAnalysis
summary: config.ts (vscode-extension, api-routes) - 1 functions
**DEEP ANALYSIS FOUND**
imports:
  default import from 'vscode': * as vscode
exports:
  function 'loadConfig' (line 4)

      **Functions:**
      - `loadConfig` - Loads user/workspace config for CodeMap AI

### /src/analyzers/deepAnalyzer.ts
hash: 37b5f8..bd  lang: ts  size: 29.5KB
DEBUG: File props: path, lang, hash, bytes, summary, symbols, truncated, deepAnalysis
summary: deepAnalyzer.ts (api-routes) - 29 functions, 2 classes
**DEEP ANALYSIS FOUND**
imports:
  default import from 'fs': * as fs
  default import from 'path': * as path
  named import from '../index/schemas': FileEntry, SymbolEntry
  named import from './smartDescriber': generateSmartDescription
  named import from 'module': a, b, c
  default import from 'module': Something
exports:
  function 'performDeepAnalysis' (line 111)
schemas:
  interface DeepAnalysisResult (line 7)
    summary: string
    symbols: DetailedSymbol[]
    routes: RouteSymbol[]
    schemas: SchemaSymbol[]
    imports: ImportReference[]
    exports: ExportReference[]
    usages: UsageReference[]
    detectors: string[]
    components: ComponentAnalysis[]
    envVars: EnvironmentVariable[]
    ... and 2 more fields
  interface ComponentAnalysis (line 22)
    name: string
    type: 'component' | 'hook' | 'service' | 'utility'
    props: PropDefinition[]?
    dependencies: string[]
    usedBy: string[]
    description: string?
    lineNumber: number?
  interface PropDefinition (line 32)
    name: string
    type: string
    required: boolean
    description: string?
  interface EnvironmentVariable (line 39)
    name: string
    required: boolean
    description: string?
    usage: string[]
    lineNumber: number?
  interface WorkflowPattern (line 47)
    name: string
    steps: string[]
    description: string?
    relatedFiles: string[]
  interface RelationshipMap (line 54)
    from: string
    to: string
    type: 'uses' | 'extends' | 'implements' | 'references' | 'calls'
    cardinality: '1-1' | '1-many' | 'many-1' | 'many-many'?
    description: string?
  interface DetailedSymbol (line 62)
    lineNumber: number?
    parameters: string[]?
    returnType: string?
    description: string?
    usedBy: string[]?
    uses: string[]?
    complexity: number?
  interface RouteSymbol (line 72)
    method: string
    path: string
    handler: string
    middleware: string[]?
    description: string?
    parameters: { name: string?
    responses: { status: number?
    lineNumber: number?
  interface SchemaSymbol (line 83)
    name: string
    type: 'table' | 'model' | 'interface' | 'type'
    fields: { name: string
    relations: { name: string?
    description: string?
    lineNumber: number?
  interface ImportReference (line 92)
    module: string
    items: string[]
    isDefault: boolean?
    lineNumber: number?
  interface ExportReference (line 99)
    name: string
    type: 'function' | 'class' | 'variable' | 'default'
    lineNumber: number?
  interface UsageReference (line 105)
    symbol: string
    context: string
    lineNumber: number?
  interface or (line 878)

      **Functions:**
      - `performDeepAnalysis` (filePath: string, content: string, lang: string)
      - `analyzeJavaScriptDeep` (content: string, filePath: string)
      - `detectFrameworks` (content: string, result: DeepAnalysisResult)
      - `extractImports` (lines: string[], result: DeepAnalysisResult)
      - `extractExports` (lines: string[], result: DeepAnalysisResult)
      - `extractJavaScriptSymbols` (lines: string[], result: DeepAnalysisResult, filePath: string)
      - `extractRoutes` (lines: string[], result: DeepAnalysisResult)
      - `extractFunctionBody` (lines: string[], startIndex: number)
      - `extractReactSymbols` (lines: string[], result: DeepAnalysisResult)
      - `extractTypeScriptSymbols` (lines: string[], result: DeepAnalysisResult)
      - `extractFunctionDescription` - Helper functions for extraction (lines: string[], lineIndex: number)
      - `extractRouteDescription` (lines: string[], lineIndex: number)
      - `extractClassMethods` (lines: string[], startIndex: number)
      - `extractComponentProps` (lines: string[], lineIndex: number)
      - `extractInterfaceFields` (lines: string[], startIndex: number)
      - `extractNextJSRoutePath` (imports: ImportReference[])
      - `calculateComplexity` - Try to determine Next.js route path from file structure (lines: string[], startIndex: number)
      - `generateJavaScriptDeepSummary` (result: DeepAnalysisResult, filePath: string)
      - `analyzePrismaDeep` - Prisma schema analysis (content: string, filePath: string)
      - `extractPrismaModelFields` (lines: string[], startIndex: number)
      - `analyzePythonDeep` - Python analysis (content: string, filePath: string)
      - `analyzeSQLDeep` - SQL analysis (content: string, filePath: string)
      - `analyzeJSONDeep` - JSON analysis (content: string, filePath: string)
      - `extractComponentAnalysis` - Enhanced analysis functions for the new features (lines: string[], result: DeepAnalysisResult, filePath: string)
      - `extractPropsFromComponent` (lines: string[], startIndex: number)
      - `extractComponentDependencies` (lines: string[], imports: ImportReference[])
      - `extractEnvironmentVariables` (lines: string[], result: DeepAnalysisResult)
      - `extractWorkflowPatterns` (content: string, result: DeepAnalysisResult, filePath: string)
      - `extractRelationships` (result: DeepAnalysisResult, filePath: string)

      **Classs:**
      - `methods` - Class
      - `body` - Class

### /src/analyzers/codeAnalyzer.ts
hash: 60ebe0..52  lang: ts  size: 18.0KB
DEBUG: File props: path, lang, hash, bytes, summary, symbols, truncated, deepAnalysis
summary: codeAnalyzer.ts - 17 functions, 2 classes
**DEEP ANALYSIS FOUND**
imports:
  default import from 'fs': * as fs
  default import from 'path': * as path
  named import from '../index/schemas': FileEntry, SymbolEntry
  named import from './deepAnalyzer': performDeepAnalysis, DeepAnalysisResult
exports:
  function 'analyzeFile' (line 15)
  function 'isImportantFile' (line 62)
schemas:
  interface AnalysisResult (line 7)
    summary: string
    symbols: SymbolEntry[]
    refs: string[]
    detectors: string[]
    deepAnalysis: DeepAnalysisResult?

      **Functions:**
      - `analyzeFile` (filePath: string, content: string, lang: string)
      - `isImportantFile` (filePath: string, content: string)
      - `performStandardAnalysis` (content: string, filePath: string, lang: string)
      - `analyzeJavaScript` (content: string, filePath: string)
      - `analyzePython` (content: string, filePath: string)
      - `analyzeMarkdown` (content: string, filePath: string)
      - `analyzeJSON` (content: string, filePath: string)
      - `analyzeSQL` (content: string, filePath: string)
      - `analyzeJava` (content: string, filePath: string)
      - `analyzeCSharp` (content: string, filePath: string)
      - `analyzeGeneric` (content: string, filePath: string)
      - `extractFunctionSignature` - Helper functions (lines: string[], startIndex: number)
      - `extractClassInfo` (lines: string[], startIndex: number)
      - `extractPythonFunctionSignature` (lines: string[], startIndex: number)
      - `extractPythonClassInfo` (lines: string[], startIndex: number)
      - `generateJavaScriptSummary` (result: AnalysisResult, content: string, filePath: string)
      - `generatePythonSummary` (result: AnalysisResult, content: string, filePath: string)

      **Classs:**
      - `with` - Class
      - `with` - Class

### /instructions.md
hash: cc76a0..84  lang: md  size: 15.6KB
DEBUG: File props: path, lang, hash, bytes, summary, symbols, truncated, deepAnalysis
summary: project name
**DEEP ANALYSIS FOUND**

### /src/index/codemapEmitter.ts
hash: e3e6ff..34  lang: ts  size: 21.8KB
DEBUG: File props: path, lang, hash, bytes, summary, symbols, truncated, deepAnalysis
summary: codemapEmitter.ts (api-routes) - 12 functions
**DEEP ANALYSIS FOUND**
imports:
  default import from 'path': * as path
  default import from 'fs': * as fs
  named import from './schemas': FileEntry, RouteEntry, TableEntry
  named import from '../utils/fs': atomicWrite
  named import from '../analyzers/fileGrouper': groupFiles, formatBytes as formatFileSize
exports:
  function 'emitCodeMap' (line 8)

      **Functions:**
      - `emitCodeMap` (files: FileEntry[], config: any, workspaceRoot: string)
      - `generateProjectOverview` (allFiles: FileEntry[], detailedFiles: FileEntry[])
      - `getFileImportanceScore` (file: FileEntry)
      - `groupSymbolsByKind` (symbols: any[])
      - `formatSymbolsForOutput` (symbolsByKind: Record<string, any[]>)
      - `generateCrossReferences` (files: FileEntry[])
      - `getDirectories` (files: FileEntry[])
      - `getDirectoryDescription` (dirPath: string, primaryLang: string, detectors: Set<string>)
      - `formatBytes` (bytes: number)
      - `groupDetailedSymbolsByKind` (symbols: any[])
      - `formatDetailedSymbolsForOutput` (symbols: any[])
      - `generateEnhancedAnalysisSummary` (files: FileEntry[])

### /src/analyzers/smartDescriber.ts
hash: cc9d31..65  lang: ts  size: 10.0KB
DEBUG: File props: path, lang, hash, bytes, summary, symbols, truncated, deepAnalysis
summary: smartDescriber.ts - 7 functions, 4 classes
**DEEP ANALYSIS FOUND**
exports:
  function 'generateSmartDescription' (line 4)

      **Functions:**
      - `extractExistingComment` - Default meaningful description (lines: string[], lineIndex: number)
      - `analyzeNamingPatterns` (name: string, type: string, params: string[])
      - `generateDefaultDescription` (name: string, type: string, params: string[])
      - `formatCamelCase` - Helper functions (str: string)
      - `getSubjectFromParams` (params: string[])
      - `isReactComponent` (name: string)
      - `extractFunctionBody` (lines: string[], startIndex: number)

      **Classs:**
      - `patterns` - Class
      - `for` - Class
      - `for` - Class
      - `for` - Class

### /src/analyzers/fileGrouper.ts
hash: 4e6c3c..2a  lang: ts  size: 6.8KB
DEBUG: File props: path, lang, hash, bytes, summary, symbols, truncated, deepAnalysis
summary: fileGrouper.ts (api-routes) - 12 functions
**DEEP ANALYSIS FOUND**
imports:
  default import from 'path': * as path
  named import from '../index/schemas': FileEntry
exports:
  function 'groupFiles' (line 14)
  function 'formatBytes' (line 225)
schemas:
  interface FileGroup (line 5)
    path: string
    pattern: string
    count: number
    totalSize: number
    description: string
    samples: string[]?
  interface DirectoryAnalysis (line 52)
    shouldGroup: boolean
    groups: FileGroup[]

      **Functions:**
      - `groupFiles` (files: FileEntry[])
      - `analyzeDirectory` (dir: string, files: FileEntry[])
      - `isBinaryDirectory` (dir: string, files: FileEntry[])
      - `isImageDirectory` (dir: string, files: FileEntry[])
      - `isMigrationDirectory` (dir: string, files: FileEntry[])
      - `isTestDirectory` (dir: string, files: FileEntry[])
      - `createBinaryGroup` (dir: string, files: FileEntry[])
      - `createImageGroup` (dir: string, files: FileEntry[])
      - `createMigrationGroup` (dir: string, files: FileEntry[])
      - `createTestGroup` (dir: string, files: FileEntry[])
      - `groupByExtension` (dir: string, files: FileEntry[])
      - `formatBytes` (bytes: number)

### /test-full-codemap.js
hash: 00400d..35  lang: js  size: 3.7KB
DEBUG: File props: path, lang, hash, bytes, summary, symbols, truncated, deepAnalysis
summary: test-full-codemap.js - 11 functions, 1 classes
**DEEP ANALYSIS FOUND**
imports:
  named import from 'vscode': vscode

      **Functions:**
      - `activate` (context)
      - `scanWorkspace`
      - `emitCodeMap`
      - `scanFlaskFile`
      - `scanExpressFile`
      - `scanReactFile`
      - `setupSaveTrigger`
      - `setupWorkspaceOpenTrigger`
      - `setupCommandTriggers`
      - `hashFile`
      - `atomicWrite`

      **Classs:**
      - `IndexStoreImpl` - Class

### /src/statusBar.ts
hash: 6cafbd..e8  lang: ts  size: 2.1KB
DEBUG: File props: path, lang, hash, bytes, summary, symbols, truncated, deepAnalysis
summary: statusBar.ts (vscode-extension) - 10 functions
**DEEP ANALYSIS FOUND**
imports:
  default import from 'vscode': * as vscode
exports:
  function 'initializeStatusBar' (line 5)
  function 'updateStatusBar' (line 18)
  function 'setStatusScanning' (line 30)
  function 'setStatusAnalyzing' (line 35)
  function 'setStatusGenerating' (line 40)
  function 'setStatusSaving' (line 45)
  function 'setStatusGitDetecting' (line 50)
  function 'setStatusUpdating' (line 55)
  function 'setStatusIdle' (line 60)
  function 'setStatusWorking' (line 65)

      **Functions:**
      - `initializeStatusBar` - StatusBar for CodeMap AI (context: vscode.ExtensionContext)
      - `updateStatusBar` - Add to disposables so it gets cleaned up (state: string)
      - `setStatusScanning` - Specific status functions for different operations
      - `setStatusAnalyzing`
      - `setStatusGenerating`
      - `setStatusSaving`
      - `setStatusGitDetecting`
      - `setStatusUpdating`
      - `setStatusIdle`
      - `setStatusWorking` (operation: string)

### /manual-test.js
hash: 4ecfff..82  lang: js  size: 3.2KB
DEBUG: File props: path, lang, hash, bytes, summary, symbols, truncated, deepAnalysis
summary: manual-test.js - 4 functions
**DEEP ANALYSIS FOUND**
imports:
  named import from 'fs': fs
  named import from 'path': path

      **Functions:**
      - `manualScan` - Simple manual scan of this repository
      - `findFiles` - Write CODEMAP.md (dir, extensions)
      - `walk` (currentDir)
      - `formatBytes` (bytes)

### /src/index/schemas.ts
hash: fa2dcf..08  lang: ts  size: 1.1KB
DEBUG: File props: path, lang, hash, bytes, summary, symbols, truncated, deepAnalysis
summary: schemas.ts - 0 functions
**DEEP ANALYSIS FOUND**
schemas:
  interface FileEntry (line 2)
    path: string
    lang: string
    hash: string
    bytes: number
    summary: string?
    symbols: SymbolEntry[]?
    refs: string[]?
    detectors: string[]?
    truncated: boolean?
    deepAnalysis: any?
  interface SymbolEntry (line 15)
    kind: "class"|"function"|"method"|"component"|"hook"|"type"|"variable"|"route"|"entity"
    name: string
    detail: string?
  interface RouteEntry (line 21)
    framework: "flask"|"django"|"fastapi"|"express"|"next"|"angular"|"nest"|"spring"
    method: string
    path: string
    handler: string
    file: string
    notes: string?
  interface TableEntry (line 30)
    source: "sqlalchemy"|"django"|"typeorm"|"prisma"|"raw-sql"
    kind: "table"|"model"|"entity"
    name: string
    columns: { name: string
    relations: string[]?
  interface IndexStore (line 38)
    version: 1
    head: string?
    files: Record<string

### /CHANGELOG.md
hash: 6b972f..0d  lang: md  size: 568B
DEBUG: File props: path, lang, hash, bytes, summary, symbols, truncated, deepAnalysis
summary: - Initial release of CodeMap AI extension
**DEEP ANALYSIS FOUND**

### /src/logger.ts
hash: c303f7..ed  lang: ts  size: 522B
DEBUG: File props: path, lang, hash, bytes, summary, symbols, truncated, deepAnalysis
summary: logger.ts (vscode-extension) - 3 functions
**DEEP ANALYSIS FOUND**
imports:
  default import from 'vscode': * as vscode
exports:
  function 'getLogger' (line 5)
  function 'enableOutputChannel' (line 12)
  function 'logError' (line 17)

      **Functions:**
      - `getLogger` - Logger for CodeMap AI
      - `enableOutputChannel`
      - `logError` (e: any)

### /debug-walk.js
hash: 60cbd0..62  lang: js  size: 2.4KB
DEBUG: File props: path, lang, hash, bytes, summary, symbols, truncated, deepAnalysis
summary: debug-walk.js - 2 functions
**DEEP ANALYSIS FOUND**
imports:
  named import from 'fs': fs
  named import from 'path': path

      **Functions:**
      - `debugWalkWorkspace` (root, maxFileKB = 800)
      - `walk` (dir)

### /src/scanners/python/flaskScanner.ts
hash: eb233e..18  lang: ts  size: 2.2KB
DEBUG: File props: path, lang, hash, bytes, summary, symbols, truncated, deepAnalysis
summary: flaskScanner.ts - 2 functions
**DEEP ANALYSIS FOUND**
imports:
  named import from '../../index/schemas': RouteEntry
exports:
  function 'scanFlaskFile' (line 4)

      **Functions:**
      - `scanFlaskFile` - Flask scanner for CodeMap AI (content: string, filePath: string)
      - `name` - @route pattern without methods (next non-decorator line)

### /src/triggers/workspaceOpenTrigger.ts
hash: 5b1b89..e3  lang: ts  size: 1.9KB
DEBUG: File props: path, lang, hash, bytes, summary, symbols, truncated, deepAnalysis
summary: workspaceOpenTrigger.ts (vscode-extension) - 2 functions
**DEEP ANALYSIS FOUND**
imports:
  default import from 'vscode': * as vscode
  named import from '../index/indexStore': scanWorkspace
  named import from '../ui/summaryWebview': showSummaryWebview
  named import from '../config': loadConfig
  named import from '../logger': getLogger, enableOutputChannel
  named import from '../statusBar': setStatusWorking, setStatusIdle
exports:
  function 'setupWorkspaceOpenTrigger' (line 9)

      **Functions:**
      - `setupWorkspaceOpenTrigger` (context: vscode.ExtensionContext)
      - `runInitialScan` - Function to run initial scan

### /src/scanners/js/reactScanner.ts
hash: 26dd0b..7b  lang: ts  size: 1.3KB
DEBUG: File props: path, lang, hash, bytes, summary, symbols, truncated, deepAnalysis
summary: reactScanner.ts - 1 functions, 1 classes
**DEEP ANALYSIS FOUND**
imports:
  named import from '../../index/schemas': SymbolEntry
exports:
  function 'scanReactFile' (line 4)
  default 'function' (line 14)
  function 'ComponentName' (line 16)
  variable 'ComponentName' (line 18)
  function 'useHookName' (line 22)

      **Functions:**
      - `scanReactFile` - React scanner for CodeMap AI (content: string, filePath: string)

      **Classs:**
      - `ComponentName` - Class extending React

### /src/extension.ts
hash: 12f3be..2a  lang: ts  size: 1.3KB
DEBUG: File props: path, lang, hash, bytes, summary, symbols, truncated, deepAnalysis
summary: extension.ts (vscode-extension) - 2 functions
**DEEP ANALYSIS FOUND**
imports:
  default import from 'vscode': * as vscode
  named import from './triggers/commandTrigger': setupCommandTriggers
  named import from './triggers/saveTrigger': setupSaveTrigger
  named import from './triggers/workspaceOpenTrigger': setupWorkspaceOpenTrigger
  named import from './triggers/gitTrigger': setupGitTrigger
  named import from './statusBar': initializeStatusBar
exports:
  function 'activate' (line 9)
  function 'deactivate' (line 33)

      **Functions:**
      - `activate` (context: vscode.ExtensionContext)
      - `deactivate`

### /src/triggers/commandTrigger.ts
hash: 2c0b32..40  lang: ts  size: 1.7KB
DEBUG: File props: path, lang, hash, bytes, summary, symbols, truncated, deepAnalysis
summary: commandTrigger.ts (vscode-extension) - 1 functions
**DEEP ANALYSIS FOUND**
imports:
  default import from 'vscode': * as vscode
  named import from '../index/indexStore': scanWorkspace
  named import from '../ui/summaryWebview': showSummaryWebview
  named import from '../config': loadConfig
  named import from '../logger': getLogger, enableOutputChannel
  named import from '../statusBar': setStatusWorking, setStatusIdle
exports:
  function 'setupCommandTriggers' (line 9)

      **Functions:**
      - `setupCommandTriggers` (context: vscode.ExtensionContext)

### /src/triggers/gitTrigger.ts
hash: af4ee0..f1  lang: ts  size: 1.6KB
DEBUG: File props: path, lang, hash, bytes, summary, symbols, truncated, deepAnalysis
summary: gitTrigger.ts (vscode-extension) - 1 functions
**DEEP ANALYSIS FOUND**
imports:
  default import from 'vscode': * as vscode
  named import from '../config': loadConfig
  named import from '../logger': getLogger
  named import from '../statusBar': setStatusGitDetecting, setStatusUpdating, setStatusIdle
exports:
  function 'setupGitTrigger' (line 9)

      **Functions:**
      - `setupGitTrigger` (context: vscode.ExtensionContext)

### /src/scanners/js/expressScanner.ts
hash: c83105..88  lang: ts  size: 1.1KB
DEBUG: File props: path, lang, hash, bytes, summary, symbols, truncated, deepAnalysis
summary: expressScanner.ts (api-routes) - 1 functions
**DEEP ANALYSIS FOUND**
imports:
  named import from '../../index/schemas': RouteEntry
exports:
  function 'scanExpressFile' (line 4)

      **Functions:**
      - `scanExpressFile` - Express scanner for CodeMap AI (content: string, filePath: string)

### /src/triggers/saveTrigger.ts
hash: f99805..c5  lang: ts  size: 975B
DEBUG: File props: path, lang, hash, bytes, summary, symbols, truncated, deepAnalysis
summary: saveTrigger.ts (vscode-extension) - 1 functions
**DEEP ANALYSIS FOUND**
imports:
  default import from 'vscode': * as vscode
  named import from '../index/indexStore': incrementalScan
  named import from '../config': loadConfig
  named import from '../logger': getLogger
  named import from '../statusBar': setStatusUpdating
exports:
  function 'setupSaveTrigger' (line 10)

      **Functions:**
      - `setupSaveTrigger` (context: vscode.ExtensionContext)

### /src/scanners/genericScanner.ts
hash: a8f581..b9  lang: ts  size: 686B
DEBUG: File props: path, lang, hash, bytes, summary, symbols, truncated, deepAnalysis
summary: genericScanner.ts - 1 functions
**DEEP ANALYSIS FOUND**
imports:
  named import from '../index/schemas': FileEntry, SymbolEntry
  named import from '../utils/lsp': detectLang
  default import from 'fs': * as fs
exports:
  function 'genericScan' (line 6)

      **Functions:**
      - `genericScan` - Generic scanner: detects lang, extracts symbols, summary (filePath: string)

### /src/utils/lsp.ts
hash: 3d8f10..ee  lang: ts  size: 431B
DEBUG: File props: path, lang, hash, bytes, summary, symbols, truncated, deepAnalysis
summary: lsp.ts - 1 functions
**DEEP ANALYSIS FOUND**
exports:
  function 'detectLang' (line 2)

      **Functions:**
      - `detectLang` - Utility: detect language by file extension (filePath: string)

### /src/ui/summaryWebview.ts
hash: 9a713c..b5  lang: ts  size: 388B
DEBUG: File props: path, lang, hash, bytes, summary, symbols, truncated, deepAnalysis
summary: summaryWebview.ts (vscode-extension) - 1 functions
**DEEP ANALYSIS FOUND**
imports:
  default import from 'vscode': * as vscode
exports:
  function 'showSummaryWebview' (line 4)

      **Functions:**
      - `showSummaryWebview` - Basic summary webview for CodeMap AI

### /src/utils/fs.ts
hash: 570799..5a  lang: ts  size: 288B
DEBUG: File props: path, lang, hash, bytes, summary, symbols, truncated, deepAnalysis
summary: fs.ts - 1 functions
**DEEP ANALYSIS FOUND**
imports:
  default import from 'fs': * as fs
  default import from 'path': * as path
exports:
  function 'atomicWrite' (line 5)

      **Functions:**
      - `atomicWrite` - Utility: basic fs helpers for atomic writes (filePath: string, data: string)

### /src/utils/hash.ts
hash: 223be1..89  lang: ts  size: 271B
DEBUG: File props: path, lang, hash, bytes, summary, symbols, truncated, deepAnalysis
summary: hash.ts - 1 functions
**DEEP ANALYSIS FOUND**
imports:
  default import from 'crypto': * as crypto
  default import from 'fs': * as fs
exports:
  function 'hashFile' (line 5)

      **Functions:**
      - `hashFile` - Utility: hash file contents (sha256) (filePath: string)

### /src/utils/ignore.ts
hash: 47d62e..5c  lang: ts  size: 226B
DEBUG: File props: path, lang, hash, bytes, summary, symbols, truncated, deepAnalysis
summary: ignore.ts - 1 functions
**DEEP ANALYSIS FOUND**
exports:
  function 'getIgnoreGlobs' (line 3)

      **Functions:**
      - `getIgnoreGlobs` - Placeholder for ignore logic

### /src/utils/git.ts
hash: 10a821..8c  lang: ts  size: 197B
DEBUG: File props: path, lang, hash, bytes, summary, symbols, truncated, deepAnalysis
summary: git.ts - 1 functions
**DEEP ANALYSIS FOUND**
exports:
  function 'getChangedFiles' (line 3)

      **Functions:**
      - `getChangedFiles` - Placeholder for git integration

### /src/index/delta.ts
hash: db03ac..f3  lang: ts  size: 192B
DEBUG: File props: path, lang, hash, bytes, summary, symbols, truncated, deepAnalysis
summary: delta.ts - 1 functions
**DEEP ANALYSIS FOUND**
exports:
  function 'computeDelta' (line 2)

      **Functions:**
      - `computeDelta` - Placeholder for delta: diff/changed files to sections (prevFiles: any[], newFiles: any[])

### /src/scanners/scanner.ts
hash: f4a174..4b  lang: ts  size: 175B
DEBUG: File props: path, lang, hash, bytes, summary, symbols, truncated, deepAnalysis
summary: scanner.ts - 0 functions
**DEEP ANALYSIS FOUND**
imports:
  named import from '../index/schemas': FileEntry
schemas:
  interface IScanner (line 4)

### /package-lock.json
hash: 0844a6..3e  lang: json  size: 1.9KB
DEBUG: File props: path, lang, hash, bytes, summary, symbols, truncated, deepAnalysis

### /.codemapignore
hash: a26a98..ac  lang: codemapignore  size: 222B
DEBUG: File props: path, lang, hash, bytes, summary, symbols, truncated, deepAnalysis
summary: # CodeMap Ignore Rules
**DEEP ANALYSIS FOUND**

### /test.js
hash: e1d177..fb  lang: js  size: 182B
DEBUG: File props: path, lang, hash, bytes, summary, symbols, truncated, deepAnalysis

### /.gitignore
hash: 077210..02  lang: gitignore  size: 56B
DEBUG: File props: path, lang, hash, bytes, summary, symbols, truncated, deepAnalysis

## CROSS-REFERENCES

