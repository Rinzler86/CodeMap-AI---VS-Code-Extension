// Utility: detect language by file extension
export function detectLang(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'py': return 'py';
    case 'ts': return 'ts';
    case 'tsx': return 'tsx';
    case 'js': return 'js';
    case 'jsx': return 'jsx';
    case 'java': return 'java';
    case 'sql': return 'sql';
    default: return ext || '';
  }
}
