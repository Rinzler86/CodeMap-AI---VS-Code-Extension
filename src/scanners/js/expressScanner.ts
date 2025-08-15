// Express scanner for CodeMap AI
import { RouteEntry } from '../../index/schemas';

export function scanExpressFile(content: string, filePath: string): RouteEntry[] {
  const routes: RouteEntry[] = [];
  
  // Check if this is an Express file
  if (!content.includes('express') && !content.includes('.get(') && !content.includes('.post(')) {
    return routes;
  }
  
  // Route pattern: (app|router).(get|post|put|delete|patch|all)('path', handler)
  const routePattern = /(app|router)\.(get|post|put|delete|patch|all)\(\s*['"]([^'"]+)['"]/g;
  
  let match;
  while ((match = routePattern.exec(content)) !== null) {
    const method = match[2].toUpperCase();
    const path = match[3];
    
    // Try to find handler name (simplified)
    const afterRoute = content.slice(match.index + match[0].length);
    const handlerMatch = afterRoute.match(/(\w+)/);
    const handler = handlerMatch ? handlerMatch[1] : 'anonymous';
    
    routes.push({
      framework: 'express',
      method,
      path,
      handler,
      file: filePath
    });
  }
  
  return routes;
}
