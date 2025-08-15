// Emits CODEMAP.md and shards
import * as path from 'path';
import * as fs from 'fs';
import { FileEntry, RouteEntry, TableEntry } from './schemas';
import { atomicWrite } from '../utils/fs';
import { groupFiles, formatBytes as formatFileSize } from '../analyzers/fileGrouper';

export async function emitCodeMap(files: FileEntry[], config: any, workspaceRoot: string): Promise<void> {
  const projectName = path.basename(workspaceRoot);
  const timestamp = new Date().toISOString();
  
  // Group files for better organization
  const { grouped, ungrouped } = groupFiles(files);
  
  // Build CODEMAP.md content
  let content = `# CODEMAP v1\n`;
  content += `project: ${projectName}   root: /   last_scan: ${timestamp}\n\n`;
  
  // PROJECT OVERVIEW section
  content += `## PROJECT OVERVIEW\n`;
  const overview = generateProjectOverview(files, ungrouped);
  content += overview + '\n\n';
  
  // DIRECTORIES section (more intelligent)
  content += `## DIRECTORIES\n`;
  const dirs = getDirectories(ungrouped);
  for (const dir of dirs) {
    content += `- ${dir.path} — ${dir.description}\n`;
  }
  content += `\n`;
  
  // FILE GROUPS section (for organized bulk files)
  if (grouped.length > 0) {
    content += `## FILE GROUPS\n`;
    for (const group of grouped) {
      content += `### ${group.path}\n`;
      content += `pattern: ${group.pattern}  count: ${group.count}  size: ${formatFileSize(group.totalSize)}\n`;
      content += `${group.description}\n`;
      if (group.samples && group.samples.length > 0) {
        content += `samples: ${group.samples.join(', ')}\n`;
      }
      content += `\n`;
    }
  }
  
  // FILES section (detailed analysis for important files)
  content += `## FILES (detailed)\n`;
  
  // Sort files by importance for AI analysis
  const sortedFiles = ungrouped.sort((a, b) => {
    const scoreA = getFileImportanceScore(a);
    const scoreB = getFileImportanceScore(b);
    return scoreB - scoreA;
  });
  
  for (const file of sortedFiles) {
    content += `### ${file.path}\n`;
    content += `hash: ${file.hash.slice(0, 6)}..${file.hash.slice(-2)}  lang: ${file.lang}  size: ${formatBytes(file.bytes)}\n`;
    
    // DEBUG: Check what properties exist on the file object
    content += `DEBUG: File props: ${Object.keys(file).join(', ')}\n`;
    
    if (file.summary) {
      content += `summary: ${file.summary}\n`;
    }
    
    if (file.detectors && file.detectors.length > 0) {
      content += `detectors: ${file.detectors.join(', ')}\n`;
    }
    
    // Display deep analysis data if available
    if ((file as any).deepAnalysis) {
      const deep = (file as any).deepAnalysis;
      content += `**DEEP ANALYSIS FOUND**\n`;
      
      // Display imports
      if (deep.imports && deep.imports.length > 0) {
        const importLines = deep.imports.map((imp: any) => 
          `  ${imp.isDefault ? 'default' : 'named'} import from '${imp.module}': ${imp.items.join(', ')}`
        );
        content += `imports:\n${importLines.join('\n')}\n`;
      }
      
      // Display exports
      if (deep.exports && deep.exports.length > 0) {
        const exportLines = deep.exports.map((exp: any) => 
          `  ${exp.type} '${exp.name}' (line ${exp.lineNumber})`
        );
        content += `exports:\n${exportLines.join('\n')}\n`;
      }
      
      // Display routes
      if (deep.routes && deep.routes.length > 0) {
        content += `routes:\n`;
        for (const route of deep.routes) {
          content += `  ${route.method} ${route.path} → ${route.handler}`;
          if (route.description) content += ` // ${route.description}`;
          content += ` (line ${route.lineNumber})\n`;
        }
      }
      
      // Display schemas
      if (deep.schemas && deep.schemas.length > 0) {
        content += `schemas:\n`;
        for (const schema of deep.schemas) {
          content += `  ${schema.type} ${schema.name} (line ${schema.lineNumber || '?'})\n`;
          if (schema.fields && schema.fields.length > 0) {
            const fieldLines = schema.fields.slice(0, 10).map((field: any) => 
              `    ${field.name}: ${field.type}${field.nullable ? '?' : ''}`
            );
            content += fieldLines.join('\n') + '\n';
            if (schema.fields.length > 10) {
              content += `    ... and ${schema.fields.length - 10} more fields\n`;
            }
          }
        }
      }
      
      // Display detailed symbols
      if (deep.symbols && deep.symbols.length > 0) {
        content += formatDetailedSymbolsForOutput(deep.symbols);
      }
    } else {
      // Fallback to standard symbol display
      if (file.symbols && file.symbols.length > 0) {
        const symbolsByKind = groupSymbolsByKind(file.symbols);
        content += formatSymbolsForOutput(symbolsByKind);
      }
    }
    
    if (file.refs && file.refs.length > 0) {
      content += `dependencies: ${file.refs.slice(0, 10).join(', ')}${file.refs.length > 10 ? '...' : ''}\n`;
    }
    
    if (file.truncated) {
      content += `truncated: true\n`;
    }
    content += `\n`;
  }
  
  // CROSS-REFERENCES section
  content += generateCrossReferences(ungrouped);
  
  // Write main CODEMAP.md
  const codemapPath = path.join(workspaceRoot, 'CODEMAP.md');
  atomicWrite(codemapPath, content);
  
  console.log(`✅ Generated CODEMAP.md with ${ungrouped.length} detailed files and ${grouped.length} file groups`);
}

function generateProjectOverview(allFiles: FileEntry[], detailedFiles: FileEntry[]): string {
  const stats = {
    totalFiles: allFiles.length,
    detailedFiles: detailedFiles.length,
    totalSize: allFiles.reduce((sum, f) => sum + f.bytes, 0),
    languages: new Set<string>(),
    detectors: new Set<string>(),
    mainFrameworks: new Set<string>()
  };
  
  for (const file of detailedFiles) {
    stats.languages.add(file.lang);
    if (file.detectors) {
      file.detectors.forEach(d => stats.detectors.add(d));
    }
  }
  
  // Identify main frameworks
  const frameworks = ['react', 'nextjs', 'express', 'flask', 'django', 'spring', 'dotnet'];
  frameworks.forEach(fw => {
    if (stats.detectors.has(fw)) {
      stats.mainFrameworks.add(fw);
    }
  });
  
  let overview = `**Total Files**: ${stats.totalFiles} (${formatBytes(stats.totalSize)})\n`;
  overview += `**Languages**: ${Array.from(stats.languages).join(', ')}\n`;
  
  if (stats.mainFrameworks.size > 0) {
    overview += `**Frameworks**: ${Array.from(stats.mainFrameworks).join(', ')}\n`;
  }
  
  overview += `**Analyzed Files**: ${stats.detailedFiles} with detailed symbol extraction\n`;
  
  return overview;
}

function getFileImportanceScore(file: FileEntry): number {
  let score = 0;
  
  // Higher score for common important files
  const fileName = path.basename(file.path).toLowerCase();
  if (['readme', 'package.json', 'tsconfig', 'config', 'main', 'index', 'app'].some(name => fileName.includes(name))) {
    score += 100;
  }
  
  // Higher score for files with many symbols
  if (file.symbols) {
    score += file.symbols.length * 2;
  }
  
  // Higher score for files with framework detectors
  if (file.detectors && file.detectors.length > 0) {
    score += file.detectors.length * 10;
  }
  
  // Higher score for files that reference many others
  if (file.refs) {
    score += file.refs.length;
  }
  
  // Slight preference for larger files (more content)
  score += Math.min(file.bytes / 1000, 20);
  
  return score;
}

function groupSymbolsByKind(symbols: any[]): Record<string, any[]> {
  const grouped: Record<string, any[]> = {};
  
  for (const symbol of symbols) {
    const kind = symbol.kind || 'other';
    if (!grouped[kind]) {
      grouped[kind] = [];
    }
    grouped[kind].push(symbol);
  }
  
  return grouped;
}

function formatSymbolsForOutput(symbolsByKind: Record<string, any[]>): string {
  let output = '';
  
  const kindOrder = ['component', 'class', 'function', 'method', 'route', 'type', 'variable', 'hook', 'entity'];
  
  for (const kind of kindOrder) {
    if (symbolsByKind[kind] && symbolsByKind[kind].length > 0) {
      const symbols = symbolsByKind[kind];
      const symbolNames = symbols.map(s => `${s.name}${s.detail ? `(${s.detail})` : ''}`);
      output += `${kind}s: ${symbolNames.slice(0, 10).join(', ')}${symbols.length > 10 ? `... (+${symbols.length - 10})` : ''}\n`;
    }
  }
  
  // Handle any remaining kinds
  for (const [kind, symbols] of Object.entries(symbolsByKind)) {
    if (!kindOrder.includes(kind) && symbols.length > 0) {
      const symbolNames = symbols.map(s => `${s.name}${s.detail ? `(${s.detail})` : ''}`);
      output += `${kind}s: ${symbolNames.slice(0, 10).join(', ')}${symbols.length > 10 ? `... (+${symbols.length - 10})` : ''}\n`;
    }
  }
  
  return output;
}

function generateCrossReferences(files: FileEntry[]): string {
  let output = '## CROSS-REFERENCES\n\n';
  
  // Find files that are referenced by multiple others
  const refCounts = new Map<string, string[]>();
  
  for (const file of files) {
    if (file.refs) {
      for (const ref of file.refs) {
        if (!refCounts.has(ref)) {
          refCounts.set(ref, []);
        }
        refCounts.get(ref)!.push(file.path);
      }
    }
  }
  
  // Show most referenced dependencies
  const popularRefs = Array.from(refCounts.entries())
    .filter(([ref, referrers]) => referrers.length > 1)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 20);
  
  if (popularRefs.length > 0) {
    output += '### Most Referenced Dependencies\n';
    for (const [ref, referrers] of popularRefs) {
      output += `- **${ref}** ← used by ${referrers.length} files\n`;
    }
    output += '\n';
  }
  
  // Show framework/technology distribution
  const techStack = new Map<string, number>();
  for (const file of files) {
    if (file.detectors) {
      for (const detector of file.detectors) {
        techStack.set(detector, (techStack.get(detector) || 0) + 1);
      }
    }
  }
  
  if (techStack.size > 0) {
    output += '### Technology Stack\n';
    const sortedTech = Array.from(techStack.entries()).sort((a, b) => b[1] - a[1]);
    for (const [tech, count] of sortedTech) {
      output += `- **${tech}**: ${count} files\n`;
    }
    output += '\n';
  }
  
  return output;
}

function getDirectories(files: FileEntry[]): Array<{path: string, description: string}> {
  const dirMap = new Map<string, {files: string[], detectors: Set<string>}>();
  
  for (const file of files) {
    const dirPath = path.dirname(file.path);
    if (dirPath === '/') continue;
    
    if (!dirMap.has(dirPath)) {
      dirMap.set(dirPath, {files: [], detectors: new Set()});
    }
    
    const dirInfo = dirMap.get(dirPath)!;
    dirInfo.files.push(file.lang);
    
    if (file.detectors) {
      file.detectors.forEach(d => dirInfo.detectors.add(d));
    }
  }
  
  return Array.from(dirMap.entries()).map(([dirPath, info]) => {
    const langCounts = info.files.reduce((acc, lang) => {
      acc[lang] = (acc[lang] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const primary = Object.entries(langCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
    const description = getDirectoryDescription(dirPath, primary, info.detectors);
    
    return { path: dirPath, description };
  }).sort((a, b) => a.path.localeCompare(b.path));
}

function getDirectoryDescription(dirPath: string, primaryLang: string, detectors: Set<string>): string {
  const dirName = path.basename(dirPath);
  
  // Use detectors to provide better descriptions
  if (detectors.has('react')) return `React ${primaryLang} components`;
  if (detectors.has('express')) return `Express API routes`;
  if (detectors.has('nextjs')) return `Next.js pages/components`;
  if (detectors.has('flask')) return `Flask API endpoints`;
  if (detectors.has('django')) return `Django app modules`;
  
  // Common patterns
  if (dirName.includes('route') || dirName.includes('api')) return `${primaryLang} API routes`;
  if (dirName.includes('component')) return `${primaryLang} components`;
  if (dirName.includes('model') || dirName.includes('entity')) return `${primaryLang} data models`;
  if (dirName.includes('util') || dirName.includes('helper')) return `${primaryLang} utilities`;
  if (dirName.includes('test') || dirName.includes('spec')) return `${primaryLang} tests`;
  if (dirName.includes('config')) return `${primaryLang} configuration`;
  if (dirName.includes('service')) return `${primaryLang} services`;
  if (dirName.includes('middleware')) return `${primaryLang} middleware`;
  if (dirName.includes('lib') || dirName.includes('library')) return `${primaryLang} libraries`;
  
  return `${primaryLang} files`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function groupDetailedSymbolsByKind(symbols: any[]): Record<string, any[]> {
  const groups: Record<string, any[]> = {};
  
  for (const symbol of symbols) {
    const kind = symbol.kind || 'other';
    if (!groups[kind]) {
      groups[kind] = [];
    }
    groups[kind].push(symbol);
  }
  
  return groups;
}

function formatDetailedSymbolsForOutput(symbols: any[]): string {
  if (!symbols || symbols.length === 0) {
    return '';
  }
  
  const groups = groupDetailedSymbolsByKind(symbols);
  let output = '';
  
  // Order of symbol types for consistent output
  const order = ['function', 'class', 'component', 'route', 'schema', 'interface', 'type', 'variable', 'constant', 'export', 'other'];
  
  for (const kind of order) {
    if (groups[kind] && groups[kind].length > 0) {
      output += `\n      **${kind.charAt(0).toUpperCase() + kind.slice(1)}s:**\n`;
      
      for (const symbol of groups[kind]) {
        output += `      - \`${symbol.name}\``;
        
        if (symbol.description) {
          output += ` - ${symbol.description}`;
        }
        
        if (symbol.parameters && symbol.parameters.length > 0) {
          output += ` (${symbol.parameters.join(', ')})`;
        }
        
        if (symbol.returnType) {
          output += ` → ${symbol.returnType}`;
        }
        
        if (symbol.extends) {
          output += ` extends ${symbol.extends}`;
        }
        
        if (symbol.implements && symbol.implements.length > 0) {
          output += ` implements ${symbol.implements.join(', ')}`;
        }
        
        output += '\n';
      }
    }
  }
  
  return output;
}
