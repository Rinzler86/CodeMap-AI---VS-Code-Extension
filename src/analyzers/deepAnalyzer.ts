// Deep code analysis for comprehensive symbol extraction and relationship mapping
import * as fs from 'fs';
import * as path from 'path';
import { FileEntry, SymbolEntry } from '../index/schemas';

export interface DeepAnalysisResult {
  summary: string;
  symbols: DetailedSymbol[];
  routes: RouteSymbol[];
  schemas: SchemaSymbol[];
  imports: ImportReference[];
  exports: ExportReference[];
  usages: UsageReference[];
  detectors: string[];
}

export interface DetailedSymbol extends SymbolEntry {
  lineNumber?: number;
  parameters?: string[];
  returnType?: string;
  description?: string;
  usedBy?: string[];
  uses?: string[];
  complexity?: number;
}

export interface RouteSymbol {
  method: string;
  path: string;
  handler: string;
  middleware?: string[];
  description?: string;
  parameters?: { name: string; type: string; required: boolean }[];
  responses?: { status: number; description: string }[];
  lineNumber?: number;
}

export interface SchemaSymbol {
  name: string;
  type: 'table' | 'model' | 'interface' | 'type';
  fields: { name: string; type: string; nullable?: boolean; description?: string }[];
  relations?: { name: string; type: string; target: string }[];
  description?: string;
  lineNumber?: number;
}

export interface ImportReference {
  module: string;
  items: string[];
  isDefault?: boolean;
  lineNumber?: number;
}

export interface ExportReference {
  name: string;
  type: 'function' | 'class' | 'variable' | 'default';
  lineNumber?: number;
}

export interface UsageReference {
  symbol: string;
  context: string;
  lineNumber?: number;
}

export async function performDeepAnalysis(filePath: string, content: string, lang: string): Promise<DeepAnalysisResult> {
  const result: DeepAnalysisResult = {
    summary: '',
    symbols: [],
    routes: [],
    schemas: [],
    imports: [],
    exports: [],
    usages: [],
    detectors: []
  };

  try {
    switch (lang) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return await analyzeJavaScriptDeep(content, filePath);
      case 'py':
        return await analyzePythonDeep(content, filePath);
      case 'prisma':
        return await analyzePrismaDeep(content, filePath);
      case 'sql':
        return await analyzeSQLDeep(content, filePath);
      case 'json':
        return await analyzeJSONDeep(content, filePath);
      default:
        return result;
    }
  } catch (error) {
    console.error(`Error in deep analysis of ${filePath}:`, error);
    return result;
  }
}

async function analyzeJavaScriptDeep(content: string, filePath: string): Promise<DeepAnalysisResult> {
  const result: DeepAnalysisResult = {
    summary: '',
    symbols: [],
    routes: [],
    schemas: [],
    imports: [],
    exports: [],
    usages: [],
    detectors: []
  };

  const lines = content.split('\n');
  
  // Detect frameworks and libraries
  detectFrameworks(content, result);
  
  // Extract imports
  extractImports(lines, result);
  
  // Extract exports
  extractExports(lines, result);
  
  // Extract detailed symbols
  await extractJavaScriptSymbols(lines, result, filePath);
  
  // Extract routes if it's an API file
  if (result.detectors.includes('express') || result.detectors.includes('nextjs') || filePath.includes('route')) {
    extractRoutes(lines, result);
  }
  
  // Extract React components and hooks
  if (result.detectors.includes('react')) {
    extractReactSymbols(lines, result);
  }
  
  // Extract TypeScript interfaces and types
  extractTypeScriptSymbols(lines, result);
  
  // Generate comprehensive summary
  result.summary = generateJavaScriptDeepSummary(result, filePath);
  
  return result;
}

function detectFrameworks(content: string, result: DeepAnalysisResult): void {
  const detectors = [
    { pattern: /import.*from\s+['"`]react['"`]/, name: 'react' },
    { pattern: /import.*from\s+['"`]next\//, name: 'nextjs' },
    { pattern: /import.*from\s+['"`]express['"`]/, name: 'express' },
    { pattern: /import.*from\s+['"`]@prisma\/client['"`]/, name: 'prisma' },
    { pattern: /import.*from\s+['"`]stripe['"`]/, name: 'stripe' },
    { pattern: /import.*from\s+['"`]axios['"`]/, name: 'axios' },
    { pattern: /import.*from\s+['"`]vscode['"`]/, name: 'vscode-extension' },
    { pattern: /\.use\(/, name: 'middleware' },
    { pattern: /\.get\(|\.post\(|\.put\(|\.delete\(/, name: 'api-routes' }
  ];

  for (const detector of detectors) {
    if (detector.pattern.test(content)) {
      result.detectors.push(detector.name);
    }
  }
}

function extractImports(lines: string[], result: DeepAnalysisResult): void {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // ES6 imports
    const importMatch = line.match(/import\s+(.+?)\s+from\s+['"`]([^'"`]+)['"`]/);
    if (importMatch) {
      const importItems = importMatch[1];
      const module = importMatch[2];
      
      let items: string[] = [];
      let isDefault = false;
      
      if (importItems.includes('{')) {
        // Named imports: import { a, b, c } from 'module'
        const namedMatch = importItems.match(/\{([^}]+)\}/);
        if (namedMatch) {
          items = namedMatch[1].split(',').map(item => item.trim());
        }
      } else {
        // Default import: import Something from 'module'
        items = [importItems.trim()];
        isDefault = true;
      }
      
      result.imports.push({
        module,
        items,
        isDefault,
        lineNumber: i + 1
      });
    }
    
    // CommonJS requires
    const requireMatch = line.match(/(?:const|let|var)\s+(.+?)\s*=\s*require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/);
    if (requireMatch) {
      result.imports.push({
        module: requireMatch[2],
        items: [requireMatch[1]],
        lineNumber: i + 1
      });
    }
  }
}

function extractExports(lines: string[], result: DeepAnalysisResult): void {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Export function
    const exportFuncMatch = line.match(/export\s+(?:async\s+)?function\s+(\w+)/);
    if (exportFuncMatch) {
      result.exports.push({
        name: exportFuncMatch[1],
        type: 'function',
        lineNumber: i + 1
      });
    }
    
    // Export class
    const exportClassMatch = line.match(/export\s+class\s+(\w+)/);
    if (exportClassMatch) {
      result.exports.push({
        name: exportClassMatch[1],
        type: 'class',
        lineNumber: i + 1
      });
    }
    
    // Export const/let/var
    const exportVarMatch = line.match(/export\s+(?:const|let|var)\s+(\w+)/);
    if (exportVarMatch) {
      result.exports.push({
        name: exportVarMatch[1],
        type: 'variable',
        lineNumber: i + 1
      });
    }
    
    // Export default
    const exportDefaultMatch = line.match(/export\s+default\s+(\w+)/);
    if (exportDefaultMatch) {
      result.exports.push({
        name: exportDefaultMatch[1],
        type: 'default',
        lineNumber: i + 1
      });
    }
  }
}

async function extractJavaScriptSymbols(lines: string[], result: DeepAnalysisResult, filePath: string): Promise<void> {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Functions with detailed parameter extraction
    const funcMatch = line.match(/(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/);
    if (funcMatch) {
      const name = funcMatch[1];
      const params = funcMatch[2] ? funcMatch[2].split(',').map(p => p.trim()).filter(p => p) : [];
      
      const symbol: DetailedSymbol = {
        kind: 'function',
        name,
        parameters: params,
        lineNumber: i + 1,
        description: extractFunctionDescription(lines, i),
        complexity: calculateComplexity(lines, i)
      };
      
      result.symbols.push(symbol);
    }
    
    // Arrow functions
    const arrowMatch = line.match(/(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\(([^)]*)\)\s*=>/);
    if (arrowMatch) {
      const name = arrowMatch[1];
      const params = arrowMatch[2] ? arrowMatch[2].split(',').map(p => p.trim()).filter(p => p) : [];
      
      result.symbols.push({
        kind: 'function',
        name,
        parameters: params,
        lineNumber: i + 1,
        description: extractFunctionDescription(lines, i)
      });
    }
    
    // Classes with methods
    const classMatch = line.match(/(?:export\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?/);
    if (classMatch) {
      const className = classMatch[1];
      const extendsClass = classMatch[2];
      
      const symbol: DetailedSymbol = {
        kind: 'class',
        name: className,
        lineNumber: i + 1,
        description: `Class${extendsClass ? ` extending ${extendsClass}` : ''}`,
        detail: extendsClass ? `extends ${extendsClass}` : undefined
      };
      
      // Extract class methods
      const methods = extractClassMethods(lines, i);
      result.symbols.push(symbol);
      result.symbols.push(...methods);
    }
  }
}

function extractRoutes(lines: string[], result: DeepAnalysisResult): void {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Express routes: app.get('/path', handler)
    const expressRouteMatch = line.match(/\.(?:get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*(.+?)\)/);
    if (expressRouteMatch) {
      const method = line.match(/\.(\w+)\s*\(/)?.[1]?.toUpperCase() || 'GET';
      const path = expressRouteMatch[1];
      const handler = expressRouteMatch[2];
      
      result.routes.push({
        method,
        path,
        handler: handler.trim(),
        lineNumber: i + 1,
        description: extractRouteDescription(lines, i)
      });
    }
    
    // Next.js API routes (export function)
    const nextApiMatch = line.match(/export\s+(?:async\s+)?function\s+(\w+)/);
    if (nextApiMatch && (nextApiMatch[1] === 'GET' || nextApiMatch[1] === 'POST' || nextApiMatch[1] === 'PUT' || nextApiMatch[1] === 'DELETE')) {
      result.routes.push({
        method: nextApiMatch[1],
        path: extractNextJSRoutePath(result.imports),
        handler: nextApiMatch[1],
        lineNumber: i + 1,
        description: 'Next.js API route'
      });
    }
  }
}

function extractReactSymbols(lines: string[], result: DeepAnalysisResult): void {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // React components (function or const with JSX return)
    if (line.includes('return') && (line.includes('<') || line.includes('jsx'))) {
      // Look backwards for function/const declaration
      for (let j = i; j >= Math.max(0, i - 10); j--) {
        const prevLine = lines[j].trim();
        const componentMatch = prevLine.match(/(?:export\s+)?(?:const|function)\s+(\w+)/);
        if (componentMatch && componentMatch[1][0] === componentMatch[1][0].toUpperCase()) {
          result.symbols.push({
            kind: 'component',
            name: componentMatch[1],
            lineNumber: j + 1,
            description: 'React component',
            detail: extractComponentProps(lines, j)
          });
          break;
        }
      }
    }
    
    // React hooks (use...)
    const hookMatch = line.match(/(?:export\s+)?(?:const|function)\s+(use\w+)/);
    if (hookMatch) {
      result.symbols.push({
        kind: 'hook',
        name: hookMatch[1],
        lineNumber: i + 1,
        description: 'React hook'
      });
    }
  }
}

function extractTypeScriptSymbols(lines: string[], result: DeepAnalysisResult): void {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Interfaces
    const interfaceMatch = line.match(/(?:export\s+)?interface\s+(\w+)/);
    if (interfaceMatch) {
      const fields = extractInterfaceFields(lines, i);
      result.schemas.push({
        name: interfaceMatch[1],
        type: 'interface',
        fields,
        lineNumber: i + 1,
        description: 'TypeScript interface'
      });
    }
    
    // Type aliases
    const typeMatch = line.match(/(?:export\s+)?type\s+(\w+)\s*=/);
    if (typeMatch) {
      result.symbols.push({
        kind: 'type',
        name: typeMatch[1],
        lineNumber: i + 1,
        description: 'TypeScript type alias'
      });
    }
  }
}

// Helper functions for extraction
function extractFunctionDescription(lines: string[], lineIndex: number): string {
  // Look for JSDoc comment above function
  for (let i = lineIndex - 1; i >= Math.max(0, lineIndex - 5); i--) {
    const line = lines[i].trim();
    if (line.startsWith('*') && !line.startsWith('*/')) {
      return line.replace(/^\*\s?/, '').trim();
    }
    if (line.startsWith('//')) {
      return line.replace(/^\/\/\s?/, '').trim();
    }
  }
  return '';
}

function extractRouteDescription(lines: string[], lineIndex: number): string {
  // Look for comment above route
  for (let i = lineIndex - 1; i >= Math.max(0, lineIndex - 3); i--) {
    const line = lines[i].trim();
    if (line.startsWith('//')) {
      return line.replace(/^\/\/\s?/, '').trim();
    }
  }
  return '';
}

function extractClassMethods(lines: string[], startIndex: number): DetailedSymbol[] {
  const methods: DetailedSymbol[] = [];
  
  // Find class body
  let braceLevel = 0;
  let inClass = false;
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.includes('{')) {
      braceLevel++;
      inClass = true;
    }
    if (line.includes('}')) {
      braceLevel--;
      if (braceLevel === 0) break;
    }
    
    if (inClass && braceLevel === 1) {
      const methodMatch = line.match(/^\s*(?:async\s+)?(\w+)\s*\(([^)]*)\)/);
      if (methodMatch && !['constructor', 'if', 'for', 'while', 'switch'].includes(methodMatch[1])) {
        const params = methodMatch[2] ? methodMatch[2].split(',').map(p => p.trim()).filter(p => p) : [];
        
        methods.push({
          kind: 'method',
          name: methodMatch[1],
          parameters: params,
          lineNumber: i + 1,
          description: extractFunctionDescription(lines, i)
        });
      }
    }
  }
  
  return methods;
}

function extractComponentProps(lines: string[], lineIndex: number): string {
  const line = lines[lineIndex];
  const propsMatch = line.match(/\(\s*\{\s*([^}]+)\s*\}/);
  if (propsMatch) {
    return `props: {${propsMatch[1]}}`;
  }
  return '';
}

function extractInterfaceFields(lines: string[], startIndex: number): { name: string; type: string; nullable?: boolean }[] {
  const fields: { name: string; type: string; nullable?: boolean }[] = [];
  let braceLevel = 0;
  let inInterface = false;
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.includes('{')) {
      braceLevel++;
      inInterface = true;
    }
    if (line.includes('}')) {
      braceLevel--;
      if (braceLevel === 0) break;
    }
    
    if (inInterface && braceLevel === 1) {
      const fieldMatch = line.match(/^\s*(\w+)(\??):\s*([^;,\n]+)/);
      if (fieldMatch) {
        fields.push({
          name: fieldMatch[1],
          type: fieldMatch[3].trim(),
          nullable: fieldMatch[2] === '?'
        });
      }
    }
  }
  
  return fields;
}

function extractNextJSRoutePath(imports: ImportReference[]): string {
  // Try to determine Next.js route path from file structure
  return '/api/...'; // Placeholder - would need file path context
}

function calculateComplexity(lines: string[], startIndex: number): number {
  let complexity = 1; // Base complexity
  let braceLevel = 0;
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.includes('{')) braceLevel++;
    if (line.includes('}')) {
      braceLevel--;
      if (braceLevel === 0) break;
    }
    
    // Count complexity indicators
    if (line.match(/\b(if|for|while|switch|catch|&&|\|\|)\b/)) {
      complexity++;
    }
  }
  
  return complexity;
}

function generateJavaScriptDeepSummary(result: DeepAnalysisResult, filePath: string): string {
  const fileName = path.basename(filePath);
  const detectors = result.detectors.join(', ');
  const symbolCounts = {
    functions: result.symbols.filter(s => s.kind === 'function').length,
    classes: result.symbols.filter(s => s.kind === 'class').length,
    components: result.symbols.filter(s => s.kind === 'component').length,
    routes: result.routes.length
  };
  
  let summary = fileName;
  if (detectors) summary += ` (${detectors})`;
  summary += ` - ${symbolCounts.functions} functions`;
  if (symbolCounts.classes > 0) summary += `, ${symbolCounts.classes} classes`;
  if (symbolCounts.components > 0) summary += `, ${symbolCounts.components} components`;
  if (symbolCounts.routes > 0) summary += `, ${symbolCounts.routes} routes`;
  
  return summary;
}

// Prisma schema analysis
async function analyzePrismaDeep(content: string, filePath: string): Promise<DeepAnalysisResult> {
  const result: DeepAnalysisResult = {
    summary: '',
    symbols: [],
    routes: [],
    schemas: [],
    imports: [],
    exports: [],
    usages: [],
    detectors: ['prisma']
  };
  
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Models
    const modelMatch = line.match(/model\s+(\w+)\s*\{/);
    if (modelMatch) {
      const fields = extractPrismaModelFields(lines, i);
      result.schemas.push({
        name: modelMatch[1],
        type: 'model',
        fields,
        lineNumber: i + 1,
        description: 'Prisma model'
      });
    }
  }
  
  result.summary = `Prisma schema with ${result.schemas.length} models`;
  return result;
}

function extractPrismaModelFields(lines: string[], startIndex: number): { name: string; type: string; nullable?: boolean }[] {
  const fields: { name: string; type: string; nullable?: boolean }[] = [];
  
  for (let i = startIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === '}') break;
    
    const fieldMatch = line.match(/^(\w+)\s+(\w+)(\?)?/);
    if (fieldMatch) {
      fields.push({
        name: fieldMatch[1],
        type: fieldMatch[2],
        nullable: fieldMatch[3] === '?'
      });
    }
  }
  
  return fields;
}

// Python analysis
async function analyzePythonDeep(content: string, filePath: string): Promise<DeepAnalysisResult> {
  // Similar deep analysis for Python files
  return {
    summary: 'Python file analysis not fully implemented yet',
    symbols: [],
    routes: [],
    schemas: [],
    imports: [],
    exports: [],
    usages: [],
    detectors: ['python']
  };
}

// SQL analysis
async function analyzeSQLDeep(content: string, filePath: string): Promise<DeepAnalysisResult> {
  // Deep SQL analysis
  return {
    summary: 'SQL file analysis not fully implemented yet',
    symbols: [],
    routes: [],
    schemas: [],
    imports: [],
    exports: [],
    usages: [],
    detectors: ['sql']
  };
}

// JSON analysis
async function analyzeJSONDeep(content: string, filePath: string): Promise<DeepAnalysisResult> {
  // Deep JSON analysis for package.json, config files, etc.
  return {
    summary: 'JSON file analysis not fully implemented yet',
    symbols: [],
    routes: [],
    schemas: [],
    imports: [],
    exports: [],
    usages: [],
    detectors: ['json']
  };
}
