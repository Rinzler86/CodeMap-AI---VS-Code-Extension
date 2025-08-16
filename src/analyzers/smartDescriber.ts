// Smart description generator for functions, classes, and methods
// Uses pattern analysis and context clues to generate meaningful descriptions

export function generateSmartDescription(
  name: string,
  type: 'function' | 'class' | 'method' | 'component',
  params: string[] = [],
  lines: string[] = [],
  lineIndex: number = 0,
  bodyLines: string[] = []
): string {
  // First check for existing comments
  const existingComment = extractExistingComment(lines, lineIndex);
  if (existingComment) {
    return existingComment;
  }

  // Generate based on naming patterns
  const patternDescription = analyzeNamingPatterns(name, type, params);
  if (patternDescription) {
    return patternDescription;
  }

  // Analyze code context
  const contextDescription = analyzeCodeContext(name, type, bodyLines, lines, lineIndex);
  if (contextDescription) {
    return contextDescription;
  }

  // Default meaningful description
  return generateDefaultDescription(name, type, params);
}

function extractExistingComment(lines: string[], lineIndex: number): string | null {
  // Look for comments above the function/class
  for (let i = lineIndex - 1; i >= Math.max(0, lineIndex - 5); i--) {
    const line = lines[i].trim();
    
    // JSDoc style: /** ... */
    if (line.includes('/**') || line.includes('*/')) {
      let comment = line.replace(/\/\*\*|\*\/|\*|\/\//g, '').trim();
      if (comment) {
        // Clean up common JSDoc patterns
        comment = comment.replace(/^@\w+\s*/, ''); // Remove @param, @returns etc
        comment = comment.replace(/^\s*-\s*/, ''); // Remove leading dashes
        return comment;
      }
    }
    
    // Single line comment: // ...
    if (line.startsWith('//')) {
      let comment = line.replace(/^\/\/\s*/, '');
      // Skip TODO, FIXME, etc.
      if (!/^(TODO|FIXME|HACK|XXX)/i.test(comment)) {
        return comment;
      }
    }
    
    // Stop if we hit code
    if (line && !line.startsWith('//') && !line.includes('/*') && !line.includes('*/')) {
      break;
    }
  }
  
  return null;
}

function analyzeNamingPatterns(name: string, type: string, params: string[]): string | null {
  const lowerName = name.toLowerCase();
  
  // Common patterns with smart descriptions
  const patterns = {
    // Data operations
    get: 'Retrieves',
    fetch: 'Fetches',
    load: 'Loads',
    read: 'Reads',
    find: 'Finds',
    search: 'Searches for',
    query: 'Queries',
    select: 'Selects',
    
    // CRUD operations
    create: 'Creates',
    add: 'Adds',
    insert: 'Inserts',
    new: 'Creates new',
    make: 'Creates',
    build: 'Builds',
    generate: 'Generates',
    
    update: 'Updates',
    edit: 'Edits',
    modify: 'Modifies',
    change: 'Changes',
    set: 'Sets',
    
    delete: 'Deletes',
    remove: 'Removes',
    destroy: 'Destroys',
    clear: 'Clears',
    reset: 'Resets',
    
    // Validation & checks
    validate: 'Validates',
    check: 'Checks',
    verify: 'Verifies',
    ensure: 'Ensures',
    confirm: 'Confirms',
    test: 'Tests',
    
    // Transformation
    format: 'Formats',
    parse: 'Parses',
    convert: 'Converts',
    transform: 'Transforms',
    normalize: 'Normalizes',
    serialize: 'Serializes',
    deserialize: 'Deserializes',
    encode: 'Encodes',
    decode: 'Decodes',
    
    // UI/React specific
    handle: 'Handles',
    on: 'Handles',
    render: 'Renders',
    display: 'Displays',
    show: 'Shows',
    hide: 'Hides',
    toggle: 'Toggles',
    open: 'Opens',
    close: 'Closes',
    
    // State management
    use: 'Hook for',
    
    // Utility
    calculate: 'Calculates',
    compute: 'Computes',
    process: 'Processes',
    execute: 'Executes',
    run: 'Runs',
    start: 'Starts',
    stop: 'Stops',
    init: 'Initializes',
    setup: 'Sets up'
  };
  
  // Check for pattern matches
  for (const [pattern, prefix] of Object.entries(patterns)) {
    if (lowerName.startsWith(pattern)) {
      const subject = name.slice(pattern.length);
      let formatted = subject ? formatCamelCase(subject) : getSubjectFromParams(params);
      
      // Special handling for React hooks
      if (pattern === 'use' && type === 'function') {
        return `${prefix} ${formatted || 'state management'}`;
      }
      
      // Special handling for event handlers
      if ((pattern === 'handle' || pattern === 'on') && type === 'function') {
        return `${prefix} ${formatted || 'event'}`;
      }
      
      return `${prefix} ${formatted || 'data'}`;
    }
  }
  
  // Check for React component patterns
  if (type === 'component' || (type === 'function' && isReactComponent(name))) {
    return `React component for ${formatCamelCase(name)}`;
  }
  
  // Check for service/utility class patterns
  if (type === 'class') {
    if (name.toLowerCase().includes('service')) {
      return `Service class for ${formatCamelCase(name.replace(/service/i, ''))}`;
    }
    if (name.toLowerCase().includes('util') || name.toLowerCase().includes('helper')) {
      return `Utility class for ${formatCamelCase(name.replace(/util|helper/i, ''))}`;
    }
    if (name.toLowerCase().includes('manager')) {
      return `Manager class for ${formatCamelCase(name.replace(/manager/i, ''))}`;
    }
  }
  
  return null;
}

function analyzeCodeContext(
  name: string, 
  type: string, 
  bodyLines: string[], 
  lines: string[], 
  lineIndex: number
): string | null {
  if (bodyLines.length === 0) {
    // Extract function body
    bodyLines = extractFunctionBody(lines, lineIndex);
  }
  
  const bodyText = bodyLines.join(' ').toLowerCase();
  
  // Analyze patterns in function body
  if (bodyText.includes('return') && bodyText.includes('map')) {
    return `Maps and transforms ${name} data`;
  }
  
  if (bodyText.includes('fetch') || bodyText.includes('axios') || bodyText.includes('http')) {
    if (bodyText.includes('post')) return `Makes POST API call for ${formatCamelCase(name)}`;
    if (bodyText.includes('put')) return `Makes PUT API call for ${formatCamelCase(name)}`;
    if (bodyText.includes('delete')) return `Makes DELETE API call for ${formatCamelCase(name)}`;
    return `Makes API call for ${formatCamelCase(name)}`;
  }
  
  if (bodyText.includes('usestate') || bodyText.includes('setstate')) {
    return `React component managing ${formatCamelCase(name)} state`;
  }
  
  if (bodyText.includes('useeffect')) {
    return `React component with ${formatCamelCase(name)} effects`;
  }
  
  if (bodyText.includes('prisma') || bodyText.includes('database') || bodyText.includes('db.')) {
    if (bodyText.includes('create')) return `Database operation to create ${formatCamelCase(name)}`;
    if (bodyText.includes('update')) return `Database operation to update ${formatCamelCase(name)}`;
    if (bodyText.includes('delete')) return `Database operation to delete ${formatCamelCase(name)}`;
    if (bodyText.includes('find')) return `Database query to find ${formatCamelCase(name)}`;
    return `Database operation for ${formatCamelCase(name)}`;
  }
  
  if (bodyText.includes('validation') || bodyText.includes('schema') || bodyText.includes('joi') || bodyText.includes('yup')) {
    return `Validates ${formatCamelCase(name)} data`;
  }
  
  if (bodyText.includes('encrypt') || bodyText.includes('decrypt') || bodyText.includes('hash') || bodyText.includes('bcrypt')) {
    return `Cryptographic operation for ${formatCamelCase(name)}`;
  }
  
  if (bodyText.includes('middleware') || bodyText.includes('req') && bodyText.includes('res')) {
    return `Express middleware for ${formatCamelCase(name)}`;
  }
  
  if (bodyText.includes('socket') || bodyText.includes('websocket') || bodyText.includes('io.')) {
    return `WebSocket handler for ${formatCamelCase(name)}`;
  }
  
  if (bodyText.includes('email') || bodyText.includes('mail') || bodyText.includes('smtp')) {
    return `Email service for ${formatCamelCase(name)}`;
  }
  
  if (bodyText.includes('upload') || bodyText.includes('multer') || bodyText.includes('file')) {
    return `File upload handler for ${formatCamelCase(name)}`;
  }
  
  return null;
}

function generateDefaultDescription(name: string, type: string, params: string[]): string {
  const formatted = formatCamelCase(name);
  const paramText = params.length > 0 ? ` (${params.join(', ')})` : '';
  
  switch (type) {
    case 'class':
      return `${formatted} class${paramText}`;
    case 'component':
      return `${formatted} component${paramText}`;
    case 'method':
      return `${formatted} method${paramText}`;
    case 'function':
    default:
      return `${formatted} function${paramText}`;
  }
}

// Helper functions
function formatCamelCase(str: string): string {
  return str
    .replace(/([A-Z])/g, ' $1')
    .toLowerCase()
    .trim()
    .replace(/^./, char => char.toUpperCase());
}

function getSubjectFromParams(params: string[]): string {
  if (params.length === 0) return '';
  
  // Extract meaningful parameter names
  const meaningfulParams = params
    .map(p => p.split(':')[0].trim()) // Remove TypeScript types
    .filter(p => !['req', 'res', 'next', 'e', 'event', '_'].includes(p));
  
  if (meaningfulParams.length > 0) {
    return formatCamelCase(meaningfulParams[0]);
  }
  
  return '';
}

function isReactComponent(name: string): boolean {
  return /^[A-Z]/.test(name) && name !== name.toUpperCase();
}

function extractFunctionBody(lines: string[], startIndex: number): string[] {
  const bodyLines: string[] = [];
  let braceCount = 0;
  let foundStart = false;
  
  for (let i = startIndex; i < Math.min(startIndex + 20, lines.length); i++) {
    const line = lines[i];
    
    if (line.includes('{')) {
      foundStart = true;
      braceCount += (line.match(/\{/g) || []).length;
    }
    if (line.includes('}')) {
      braceCount -= (line.match(/\}/g) || []).length;
    }
    
    if (foundStart) {
      bodyLines.push(line.trim());
      if (braceCount === 0) break;
    }
  }
  
  return bodyLines;
}
