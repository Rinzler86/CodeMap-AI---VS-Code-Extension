// Utility: basic fs helpers for atomic writes
import * as fs from 'fs';
import * as path from 'path';

export function atomicWrite(filePath: string, data: string) {
  const tempPath = filePath + '.tmp';
  fs.writeFileSync(tempPath, data);
  fs.renameSync(tempPath, filePath);
}
