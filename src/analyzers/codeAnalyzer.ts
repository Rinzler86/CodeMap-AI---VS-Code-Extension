// Advanced code analysis for generating AI-friendly code maps
import * as fs from 'fs';
import * as path from 'path';
import { FileEntry, SymbolEntry } from '../index/schemas';
import { performDeepAnalysis, DeepAnalysisResult } from './deepAnalyzer';

export interface AnalysisResult {
  summary: string;
  symbols: SymbolEntry[];
  refs: string[];
  detectors: string[];
  deepAnalysis?: DeepAnalysisResult;
}

export async function analyzeFile(filePath: string, content: string, lang: string): Promise<AnalysisResult> {
  const result: AnalysisResult = {
    summary: '',
    symbols: [],
    refs: [],
    detectors: []
  };

  try {
    // First, do standard analysis
    const standardResult = await performStandardAnalysis(content, filePath, lang);
    Object.assign(result, standardResult);
    
    // Then, if this is an important file, do deep analysis
    if (isImportantFile(filePath, content)) {
      result.deepAnalysis = await performDeepAnalysis(filePath, content, lang);
      
      // Merge deep analysis results into standard results
      if (result.deepAnalysis.symbols.length > 0) {
        result.symbols = result.deepAnalysis.symbols.map(s => ({
          kind: s.kind,
          name: s.name,
          detail: s.detail || s.description
        }));
      }
      
      if (result.deepAnalysis.imports.length > 0) {
        result.refs = result.deepAnalysis.imports.map(imp => imp.module);
      }
      
      if (result.deepAnalysis.detectors.length > 0) {
        result.detectors = [...new Set([...result.detectors, ...result.deepAnalysis.detectors])];
      }
      
      // Use deep analysis summary if available
      if (result.deepAnalysis.summary) {
        result.summary = result.deepAnalysis.summary;
      }
    }
    
    return result;
  } catch (error) {
    console.error(`Error analyzing ${filePath}:`, error);
    return result;
  }
}

export function isImportantFile(filePath: string, content: string): boolean {
  const fileName = path.basename(filePath).toLowerCase();
  const dirPath = path.dirname(filePath).toLowerCase();
  
  // Always analyze these important files deeply
  const importantPatterns = [
    // Config files
    'package.json', 'tsconfig', 'config', 'env',
    // Main files
    'index', 'main', 'app', 'server', 'api',
    // Documentation
    'readme', 'changelog',
    // Schema files
    'schema', 'model', 'prisma'
  ];
  
  // Important directories that need deep analysis
  const importantDirs = [
    'routes', 'api', 'controllers', 'services', 'models',
    'components', 'pages', 'hooks', 'utils', 'lib',
    'middleware', 'auth', 'database', 'migrations',
    'src', 'server', 'client'  // Added broader directory patterns
  ];
  
  // File extensions that should get deep analysis
  const importantExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cs'];
  const fileExt = path.extname(filePath);
  
  // Check file name patterns
  for (const pattern of importantPatterns) {
    if (fileName.includes(pattern)) return true;
  }
  
  // Check directory patterns
  for (const dir of importantDirs) {
    if (dirPath.includes(dir)) return true;
  }
  
  // Always analyze JavaScript/TypeScript files with meaningful content
  if (importantExtensions.includes(fileExt) && content.length > 200) {
    return true;
  }
  
  // Check content size and complexity
  if (content.length > 1000 && (
    content.includes('export') || 
    content.includes('function') || 
    content.includes('class') ||
    content.includes('route') ||
    content.includes('model') ||
    content.includes('component') ||
    content.includes('import')
  )) {
    return true;
  }
  
  return false;
}

async function performStandardAnalysis(content: string, filePath: string, lang: string): Promise<AnalysisResult> {
  // This is the existing analysis logic, kept as fallback
  switch (lang) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return analyzeJavaScript(content, filePath);
    case 'py':
      return analyzePython(content, filePath);
    case 'java':
      return analyzeJava(content, filePath);
    case 'cs':
      return analyzeCSharp(content, filePath);
    case 'md':
      return analyzeMarkdown(content, filePath);
    case 'json':
      return analyzeJSON(content, filePath);
    case 'sql':
      return analyzeSQL(content, filePath);
    default:
      return analyzeGeneric(content, filePath);
  }
}

function analyzeJavaScript(content: string, filePath: string): AnalysisResult {
  const result: AnalysisResult = { summary: '', symbols: [], refs: [], detectors: [] };
  const lines = content.split('\n');
  
  // Detect framework/library patterns
  if (content.includes('import React') || content.includes('from \'react\'')) {
    result.detectors.push('react');
  }
  if (content.includes('express()') || content.includes('from \'express\'')) {
    result.detectors.push('express');
  }
  if (content.includes('next/') || content.includes('from \'next\'')) {
    result.detectors.push('nextjs');
  }
  if (content.includes('import vscode') || content.includes('from \'vscode\'')) {
    result.detectors.push('vscode-extension');
  }
  
  // Extract symbols
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Functions
    const funcMatch = line.match(/(?:export\s+)?(?:async\s+)?function\s+(\w+)/);
    if (funcMatch) {
      result.symbols.push({
        kind: 'function',
        name: funcMatch[1],
        detail: extractFunctionSignature(lines, i)
      });
    }
    
    // Arrow functions
    const arrowMatch = line.match(/(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\(/);
    if (arrowMatch) {
      result.symbols.push({
        kind: 'function',
        name: arrowMatch[1],
        detail: 'arrow function'
      });
    }
    
    // Classes
    const classMatch = line.match(/(?:export\s+)?class\s+(\w+)/);
    if (classMatch) {
      result.symbols.push({
        kind: 'class',
        name: classMatch[1],
        detail: extractClassInfo(lines, i)
      });
    }
    
    // React components
    const componentMatch = line.match(/(?:export\s+)?(?:const|function)\s+(\w+).*\{.*return\s*\(/);
    if (componentMatch || (line.includes('JSX.Element') || line.includes('React.FC'))) {
      const nameMatch = line.match(/(?:const|function)\s+(\w+)/);
      if (nameMatch) {
        result.symbols.push({
          kind: 'component',
          name: nameMatch[1],
          detail: 'React component'
        });
      }
    }
    
    // React hooks
    const hookMatch = line.match(/(?:export\s+)?(?:const|function)\s+(use\w+)/);
    if (hookMatch) {
      result.symbols.push({
        kind: 'hook',
        name: hookMatch[1],
        detail: 'React hook'
      });
    }
    
    // Types and interfaces
    const typeMatch = line.match(/(?:export\s+)?(?:type|interface)\s+(\w+)/);
    if (typeMatch) {
      result.symbols.push({
        kind: 'type',
        name: typeMatch[1],
        detail: line.includes('interface') ? 'interface' : 'type alias'
      });
    }
    
    // Express routes
    const routeMatch = line.match(/\.(?:get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/);
    if (routeMatch) {
      result.symbols.push({
        kind: 'route',
        name: routeMatch[1],
        detail: line.match(/\.(\w+)\s*\(/)?.[1] || 'route'
      });
    }
  }
  
  // Extract imports/references
  const importMatches = content.match(/import.*from\s+['"`]([^'"`]+)['"`]/g);
  if (importMatches) {
    result.refs = importMatches.map(imp => 
      imp.match(/from\s+['"`]([^'"`]+)['"`]/)?.[1] || ''
    ).filter(ref => ref && !ref.startsWith('.'));
  }
  
  // Generate summary
  result.summary = generateJavaScriptSummary(result, content, filePath);
  
  return result;
}

function analyzePython(content: string, filePath: string): AnalysisResult {
  const result: AnalysisResult = { summary: '', symbols: [], refs: [], detectors: [] };
  const lines = content.split('\n');
  
  // Detect frameworks
  if (content.includes('from flask') || content.includes('import flask')) {
    result.detectors.push('flask');
  }
  if (content.includes('from django') || content.includes('import django')) {
    result.detectors.push('django');
  }
  if (content.includes('from fastapi') || content.includes('import fastapi')) {
    result.detectors.push('fastapi');
  }
  
  // Extract symbols
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Functions
    const funcMatch = line.match(/def\s+(\w+)\s*\(/);
    if (funcMatch) {
      result.symbols.push({
        kind: 'function',
        name: funcMatch[1],
        detail: extractPythonFunctionSignature(lines, i)
      });
    }
    
    // Classes
    const classMatch = line.match(/class\s+(\w+)/);
    if (classMatch) {
      result.symbols.push({
        kind: 'class',
        name: classMatch[1],
        detail: extractPythonClassInfo(lines, i)
      });
    }
    
    // Flask/FastAPI routes
    const routeMatch = line.match(/@app\.route\s*\(\s*['"`]([^'"`]+)['"`]/);
    if (routeMatch) {
      result.symbols.push({
        kind: 'route',
        name: routeMatch[1],
        detail: 'Flask route'
      });
    }
  }
  
  // Extract imports
  const importMatches = content.match(/(?:from\s+\w+\s+)?import\s+[\w,\s]+/g);
  if (importMatches) {
    result.refs = importMatches.map(imp => 
      imp.match(/(?:from\s+)?(\w+)/)?.[1] || ''
    ).filter(ref => ref && ref !== 'import');
  }
  
  result.summary = generatePythonSummary(result, content, filePath);
  return result;
}

function analyzeMarkdown(content: string, filePath: string): AnalysisResult {
  const result: AnalysisResult = { summary: '', symbols: [], refs: [], detectors: [] };
  const lines = content.split('\n');
  
  // Extract headings as symbols
  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      result.symbols.push({
        kind: 'function', // Using function as a generic symbol type for headings
        name: headingMatch[2].trim(),
        detail: `level ${headingMatch[1].length} heading`
      });
    }
  }
  
  // Detect documentation types
  if (content.toLowerCase().includes('api') || content.toLowerCase().includes('endpoint')) {
    result.detectors.push('api-docs');
  }
  if (content.toLowerCase().includes('readme')) {
    result.detectors.push('readme');
  }
  
  result.summary = lines.find(line => line.trim() && !line.startsWith('#'))?.slice(0, 100) || 
    `${result.symbols.length} sections`;
  
  return result;
}

function analyzeJSON(content: string, filePath: string): AnalysisResult {
  const result: AnalysisResult = { summary: '', symbols: [], refs: [], detectors: [] };
  
  try {
    const json = JSON.parse(content);
    const fileName = path.basename(filePath).toLowerCase();
    
    // Detect JSON types
    if (fileName === 'package.json') {
      result.detectors.push('npm-package');
      result.summary = `${json.name || 'package'} v${json.version || '?'}`;
      if (json.dependencies) {
        result.refs = Object.keys(json.dependencies);
      }
    } else if (fileName === 'tsconfig.json') {
      result.detectors.push('typescript-config');
      result.summary = 'TypeScript configuration';
    } else if (fileName.includes('config')) {
      result.detectors.push('config');
      result.summary = 'Configuration file';
    }
    
    // Extract top-level keys as symbols
    Object.keys(json).slice(0, 20).forEach(key => {
      result.symbols.push({
        kind: 'variable',
        name: key,
        detail: typeof json[key]
      });
    });
    
  } catch (error) {
    result.summary = 'Invalid JSON';
  }
  
  return result;
}

function analyzeSQL(content: string, filePath: string): AnalysisResult {
  const result: AnalysisResult = { summary: '', symbols: [], refs: [], detectors: [] };
  
  // Extract table names
  const tableMatches = content.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/gi);
  if (tableMatches) {
    tableMatches.forEach(match => {
      const tableName = match.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/i)?.[1];
      if (tableName) {
        result.symbols.push({
          kind: 'entity',
          name: tableName,
          detail: 'table'
        });
      }
    });
  }
  
  result.detectors.push('sql');
  result.summary = `${result.symbols.length} tables defined`;
  
  return result;
}

function analyzeJava(content: string, filePath: string): AnalysisResult {
  const result: AnalysisResult = { summary: '', symbols: [], refs: [], detectors: [] };
  const lines = content.split('\n');
  
  // Extract classes and methods
  for (const line of lines) {
    const classMatch = line.match(/(?:public\s+)?class\s+(\w+)/);
    if (classMatch) {
      result.symbols.push({
        kind: 'class',
        name: classMatch[1],
        detail: 'Java class'
      });
    }
    
    const methodMatch = line.match(/(?:public|private|protected)?\s*(?:static\s+)?(\w+)\s+(\w+)\s*\(/);
    if (methodMatch) {
      result.symbols.push({
        kind: 'method',
        name: methodMatch[2],
        detail: `returns ${methodMatch[1]}`
      });
    }
  }
  
  result.detectors.push('java');
  result.summary = `Java class with ${result.symbols.length} symbols`;
  
  return result;
}

function analyzeCSharp(content: string, filePath: string): AnalysisResult {
  const result: AnalysisResult = { summary: '', symbols: [], refs: [], detectors: [] };
  const lines = content.split('\n');
  
  // Extract classes and methods
  for (const line of lines) {
    const classMatch = line.match(/(?:public\s+)?class\s+(\w+)/);
    if (classMatch) {
      result.symbols.push({
        kind: 'class',
        name: classMatch[1],
        detail: 'C# class'
      });
    }
    
    const methodMatch = line.match(/(?:public|private|protected)?\s*(?:static\s+)?(\w+)\s+(\w+)\s*\(/);
    if (methodMatch) {
      result.symbols.push({
        kind: 'method',
        name: methodMatch[2],
        detail: `returns ${methodMatch[1]}`
      });
    }
  }
  
  result.detectors.push('csharp');
  result.summary = `C# class with ${result.symbols.length} symbols`;
  
  return result;
}

function analyzeGeneric(content: string, filePath: string): AnalysisResult {
  const result: AnalysisResult = { summary: '', symbols: [], refs: [], detectors: [] };
  
  const ext = path.extname(filePath);
  result.detectors.push(ext.slice(1) || 'unknown');
  
  const lines = content.split('\n');
  const firstNonEmpty = lines.find(line => line.trim());
  result.summary = firstNonEmpty?.slice(0, 80) || `${lines.length} lines`;
  
  return result;
}

// Helper functions
function extractFunctionSignature(lines: string[], startIndex: number): string {
  const line = lines[startIndex];
  const parenIndex = line.indexOf('(');
  if (parenIndex === -1) return '';
  
  const endParen = line.indexOf(')', parenIndex);
  if (endParen === -1) return line.slice(parenIndex);
  
  return line.slice(parenIndex, endParen + 1);
}

function extractClassInfo(lines: string[], startIndex: number): string {
  const line = lines[startIndex];
  const extendsMatch = line.match(/extends\s+(\w+)/);
  const implementsMatch = line.match(/implements\s+([\w,\s]+)/);
  
  let info = '';
  if (extendsMatch) info += `extends ${extendsMatch[1]}`;
  if (implementsMatch) info += `${info ? ', ' : ''}implements ${implementsMatch[1]}`;
  
  return info || 'class';
}

function extractPythonFunctionSignature(lines: string[], startIndex: number): string {
  const line = lines[startIndex];
  const match = line.match(/def\s+\w+\s*(\([^)]*\))/);
  return match?.[1] || '()';
}

function extractPythonClassInfo(lines: string[], startIndex: number): string {
  const line = lines[startIndex];
  const match = line.match(/class\s+\w+\s*\(([^)]+)\)/);
  return match ? `inherits ${match[1]}` : 'class';
}

function generateJavaScriptSummary(result: AnalysisResult, content: string, filePath: string): string {
  const fileName = path.basename(filePath);
  const hasReact = result.detectors.includes('react');
  const hasExpress = result.detectors.includes('express');
  const hasNext = result.detectors.includes('nextjs');
  
  const components = result.symbols.filter(s => s.kind === 'component').length;
  const functions = result.symbols.filter(s => s.kind === 'function').length;
  const classes = result.symbols.filter(s => s.kind === 'class').length;
  const routes = result.symbols.filter(s => s.kind === 'route').length;
  
  if (hasReact && components > 0) {
    return `React component file with ${components} components`;
  } else if (hasExpress && routes > 0) {
    return `Express API with ${routes} routes`;
  } else if (hasNext) {
    return `Next.js page/component`;
  } else if (functions > 0) {
    return `${functions} functions, ${classes} classes`;
  } else {
    const firstLine = content.split('\n').find(line => line.trim() && !line.startsWith('//'));
    return firstLine?.slice(0, 80) || fileName;
  }
}

function generatePythonSummary(result: AnalysisResult, content: string, filePath: string): string {
  const fileName = path.basename(filePath);
  const functions = result.symbols.filter(s => s.kind === 'function').length;
  const classes = result.symbols.filter(s => s.kind === 'class').length;
  const routes = result.symbols.filter(s => s.kind === 'route').length;
  
  if (result.detectors.includes('flask') && routes > 0) {
    return `Flask API with ${routes} routes`;
  } else if (result.detectors.includes('django')) {
    return `Django module with ${functions} functions, ${classes} classes`;
  } else if (functions > 0 || classes > 0) {
    return `${functions} functions, ${classes} classes`;
  }
  
  const firstLine = content.split('\n').find(line => line.trim() && !line.startsWith('#'));
  return firstLine?.slice(0, 80) || fileName;
}
