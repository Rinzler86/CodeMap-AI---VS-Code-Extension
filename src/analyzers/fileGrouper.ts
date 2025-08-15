// Smart file grouping for CODEMAP generation
import * as path from 'path';
import { FileEntry } from '../index/schemas';

export interface FileGroup {
  path: string;
  pattern: string;
  count: number;
  totalSize: number;
  description: string;
  samples?: string[];
}

export function groupFiles(files: FileEntry[]): { grouped: FileGroup[], ungrouped: FileEntry[] } {
  const groups: FileGroup[] = [];
  const ungrouped: FileEntry[] = [];
  const processed = new Set<string>();
  
  // Group by directory and file type patterns
  const dirGroups = new Map<string, FileEntry[]>();
  
  for (const file of files) {
    const dir = path.dirname(file.path);
    if (!dirGroups.has(dir)) {
      dirGroups.set(dir, []);
    }
    dirGroups.get(dir)!.push(file);
  }
  
  for (const [dir, dirFiles] of dirGroups) {
    const result = analyzeDirectory(dir, dirFiles);
    
    if (result.shouldGroup) {
      // Create groups for this directory
      for (const group of result.groups) {
        groups.push(group);
        group.samples?.forEach(sample => processed.add(sample));
      }
    } else {
      // Add files individually
      dirFiles.forEach(file => {
        if (!processed.has(file.path)) {
          ungrouped.push(file);
        }
      });
    }
  }
  
  return { grouped: groups, ungrouped };
}

interface DirectoryAnalysis {
  shouldGroup: boolean;
  groups: FileGroup[];
}

function analyzeDirectory(dir: string, files: FileEntry[]): DirectoryAnalysis {
  const dirName = path.basename(dir);
  
  // Check if this is a binary/asset directory that should be grouped
  if (isBinaryDirectory(dir, files)) {
    return {
      shouldGroup: true,
      groups: [createBinaryGroup(dir, files)]
    };
  }
  
  // Check for image directories
  if (isImageDirectory(dir, files)) {
    return {
      shouldGroup: true,
      groups: [createImageGroup(dir, files)]
    };
  }
  
  // Check for migration/versioned directories
  if (isMigrationDirectory(dir, files)) {
    return {
      shouldGroup: true,
      groups: [createMigrationGroup(dir, files)]
    };
  }
  
  // Check for test directories with many small files
  if (isTestDirectory(dir, files) && files.length > 10) {
    return {
      shouldGroup: true,
      groups: [createTestGroup(dir, files)]
    };
  }
  
  // Group by file extension if there are many similar files
  if (files.length > 15) {
    const extGroups = groupByExtension(dir, files);
    if (extGroups.length > 0) {
      return {
        shouldGroup: true,
        groups: extGroups
      };
    }
  }
  
  return { shouldGroup: false, groups: [] };
}

function isBinaryDirectory(dir: string, files: FileEntry[]): boolean {
  const binaryExts = new Set(['exe', 'dll', 'so', 'dylib', 'bin', 'dat']);
  const binaryCount = files.filter(f => 
    binaryExts.has(path.extname(f.path).slice(1).toLowerCase())
  ).length;
  
  return binaryCount > files.length * 0.8; // 80% binary files
}

function isImageDirectory(dir: string, files: FileEntry[]): boolean {
  const imageExts = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico', 'bmp']);
  const imageCount = files.filter(f => 
    imageExts.has(path.extname(f.path).slice(1).toLowerCase())
  ).length;
  
  return imageCount > files.length * 0.8 || // 80% images
         (imageCount > 5 && dir.toLowerCase().includes('image')) ||
         (imageCount > 5 && dir.toLowerCase().includes('upload')) ||
         (imageCount > 5 && dir.toLowerCase().includes('asset'));
}

function isMigrationDirectory(dir: string, files: FileEntry[]): boolean {
  const dirLower = dir.toLowerCase();
  return dirLower.includes('migration') || 
         dirLower.includes('version') ||
         files.every(f => /^\d{8,}/.test(path.basename(f.path))); // timestamp-named files
}

function isTestDirectory(dir: string, files: FileEntry[]): boolean {
  const dirLower = dir.toLowerCase();
  return dirLower.includes('test') || 
         dirLower.includes('spec') ||
         files.filter(f => f.path.includes('test') || f.path.includes('spec')).length > files.length * 0.7;
}

function createBinaryGroup(dir: string, files: FileEntry[]): FileGroup {
  const totalSize = files.reduce((sum, f) => sum + f.bytes, 0);
  
  return {
    path: dir,
    pattern: '*.{exe,dll,bin,so}',
    count: files.length,
    totalSize,
    description: `${files.length} binary files`,
    samples: files.slice(0, 3).map(f => path.basename(f.path))
  };
}

function createImageGroup(dir: string, files: FileEntry[]): FileGroup {
  const totalSize = files.reduce((sum, f) => sum + f.bytes, 0);
  const imageTypes = [...new Set(files.map(f => path.extname(f.path).slice(1).toLowerCase()))];
  
  return {
    path: dir,
    pattern: `*.{${imageTypes.join(',')}}`,
    count: files.length,
    totalSize,
    description: `${files.length} images (${imageTypes.join(', ')})`,
    samples: files.slice(0, 3).map(f => path.basename(f.path))
  };
}

function createMigrationGroup(dir: string, files: FileEntry[]): FileGroup {
  const totalSize = files.reduce((sum, f) => sum + f.bytes, 0);
  
  return {
    path: dir,
    pattern: 'migration_*',
    count: files.length,
    totalSize,
    description: `${files.length} database migrations`,
    samples: files.slice(0, 2).map(f => path.basename(f.path))
  };
}

function createTestGroup(dir: string, files: FileEntry[]): FileGroup {
  const totalSize = files.reduce((sum, f) => sum + f.bytes, 0);
  
  return {
    path: dir,
    pattern: '*test*',
    count: files.length,
    totalSize,
    description: `${files.length} test files`,
    samples: files.slice(0, 3).map(f => path.basename(f.path))
  };
}

function groupByExtension(dir: string, files: FileEntry[]): FileGroup[] {
  const extGroups = new Map<string, FileEntry[]>();
  
  for (const file of files) {
    const ext = path.extname(file.path).slice(1).toLowerCase();
    if (!extGroups.has(ext)) {
      extGroups.set(ext, []);
    }
    extGroups.get(ext)!.push(file);
  }
  
  const groups: FileGroup[] = [];
  
  for (const [ext, extFiles] of extGroups) {
    if (extFiles.length >= 8) { // Group if 8+ files of same type
      const totalSize = extFiles.reduce((sum, f) => sum + f.bytes, 0);
      
      groups.push({
        path: dir,
        pattern: `*.${ext}`,
        count: extFiles.length,
        totalSize,
        description: `${extFiles.length} ${ext.toUpperCase()} files`,
        samples: extFiles.slice(0, 3).map(f => path.basename(f.path))
      });
    }
  }
  
  return groups;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
