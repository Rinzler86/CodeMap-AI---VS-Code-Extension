// Generic scanner: detects lang, extracts symbols, summary
import { FileEntry, SymbolEntry } from '../index/schemas';
import { detectLang } from '../utils/lsp';
import * as fs from 'fs';

export function genericScan(filePath: string): FileEntry {
  const lang = detectLang(filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  // TODO: Use LSP for symbols, fallback regex
  const summary = content.split('\n').find(line => line.trim() && !line.trim().startsWith('#'))?.slice(0, 80) || '';
  return {
    path: filePath,
    lang,
    hash: '', // TODO: fill in
    bytes: Buffer.byteLength(content),
    summary,
    symbols: [], // TODO: fill in
  };
}
