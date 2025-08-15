// Flask scanner for CodeMap AI
import { RouteEntry } from '../../index/schemas';

export function scanFlaskFile(content: string, filePath: string): RouteEntry[] {
  const routes: RouteEntry[] = [];
  
  // Check if this is a Flask file
  if (!content.includes('flask') && !content.includes('@app.route') && !content.includes('@bp.route')) {
    return routes;
  }
  
  // Route regex patterns
  const routePatterns = [
    /@(?:\w+\.)?route\(\s*['"]([^'"]+)['"](?:.*methods\s*=\s*\[([^\]]+)\])?\)/g,
    /@app\.(get|post|put|delete|patch)\(\s*['"]([^'"]+)['"]/g
  ];
  
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Try each pattern
    for (const pattern of routePatterns) {
      let match;
      pattern.lastIndex = 0; // Reset regex
      
      while ((match = pattern.exec(line)) !== null) {
        let path: string;
        let methods: string[];
        
        if (match[1] && match[2]) {
          // @route pattern with methods
          path = match[1];
          methods = match[2].split(',').map(m => m.trim().replace(/['"]/g, ''));
        } else if (match[1] && !match[2]) {
          // @app.method pattern
          methods = [match[1].toUpperCase()];
          path = match[2] || match[1];
        } else {
          // @route pattern without methods
          path = match[1];
          methods = ['GET'];
        }
        
        // Find handler function name (next non-decorator line)
        let handler = 'unknown';
        for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
          const nextLine = lines[j].trim();
          if (nextLine && !nextLine.startsWith('@')) {
            const funcMatch = nextLine.match(/def\s+(\w+)/);
            if (funcMatch) {
              handler = funcMatch[1];
              break;
            }
          }
        }
        
        for (const method of methods) {
          routes.push({
            framework: 'flask',
            method: method.toUpperCase(),
            path,
            handler,
            file: filePath
          });
        }
      }
    }
  }
  
  return routes;
}
