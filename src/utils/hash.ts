// Utility: hash file contents (sha256)
import * as crypto from 'crypto';
import * as fs from 'fs';

export function hashFile(filePath: string): string {
  const data = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(data).digest('hex');
}
