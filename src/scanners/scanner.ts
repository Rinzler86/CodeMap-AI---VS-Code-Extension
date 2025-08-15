// Placeholder for IScanner interface
import { FileEntry } from '../index/schemas';

export interface IScanner {
  scan(filePath: string, content: string): FileEntry;
}
