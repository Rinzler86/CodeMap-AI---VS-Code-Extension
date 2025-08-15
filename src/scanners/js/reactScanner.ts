// React scanner for CodeMap AI
import { SymbolEntry } from '../../index/schemas';

export function scanReactFile(content: string, filePath: string): SymbolEntry[] {
  const symbols: SymbolEntry[] = [];
  
  // Check if this is a React file
  if (!content.includes('react') && !content.includes('React') && !filePath.includes('.jsx') && !filePath.includes('.tsx')) {
    return symbols;
  }
  
  // Component patterns
  const patterns = [
    // export default function ComponentName
    /export\s+default\s+function\s+([A-Z]\w+)/g,
    // export function ComponentName  
    /export\s+function\s+([A-Z]\w+)/g,
    // export const ComponentName = 
    /export\s+const\s+([A-Z]\w+)\s*=/g,
    // class ComponentName extends React.Component
    /class\s+([A-Z]\w+)\s+extends\s+React\.Component/g,
    // Hook pattern: export function useHookName
    /export\s+function\s+(use[A-Z]\w+)/g
  ];
  
  for (const pattern of patterns) {
    let match;
    pattern.lastIndex = 0;
    
    while ((match = pattern.exec(content)) !== null) {
      const name = match[1];
      const kind = name.startsWith('use') ? 'hook' : 'component';
      
      symbols.push({
        kind,
        name,
        detail: kind === 'component' ? 'React component' : 'React hook'
      });
    }
  }
  
  return symbols;
}
