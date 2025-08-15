// Manual test for CodeMap AI functionality
const fs = require('fs');
const path = require('path');

// Simple manual scan of this repository
function manualScan() {
    const workspaceRoot = process.cwd();
    console.log(`Scanning workspace: ${workspaceRoot}`);
    
    // Get all TypeScript files
    const files = findFiles(workspaceRoot, ['.ts', '.js', '.json', '.md']);
    console.log(`Found ${files.length} files`);
    
    // Generate a simple CODEMAP
    let codemap = `# CODEMAP v1\n`;
    codemap += `project: CodeMap-AI-Extension   root: /   last_scan: ${new Date().toISOString()}\n\n`;
    
    codemap += `## DIRECTORIES\n`;
    codemap += `- /src — TypeScript extension source code\n`;
    codemap += `- /src/index — Core indexing and scanning logic\n`;
    codemap += `- /src/scanners — Framework-specific scanners\n`;
    codemap += `- /src/triggers — Event triggers (save, git, workspace)\n`;
    codemap += `- /src/utils — Utility functions\n\n`;
    
    codemap += `## FILES (index)\n`;
    
    for (const file of files.slice(0, 10)) { // Show first 10 files
        const relativePath = path.relative(workspaceRoot, file).replace(/\\/g, '/');
        const stats = fs.statSync(file);
        const ext = path.extname(file).slice(1);
        
        codemap += `### /${relativePath}\n`;
        codemap += `lang: ${ext}  size: ${formatBytes(stats.size)}\n`;
        
        // Try to get a summary
        try {
            const content = fs.readFileSync(file, 'utf8');
            const firstLine = content.split('\n').find(line => 
                line.trim() && 
                !line.trim().startsWith('//') && 
                !line.trim().startsWith('#')
            );
            if (firstLine) {
                codemap += `summary: ${firstLine.slice(0, 80)}\n`;
            }
        } catch (e) {
            // Skip binary files
        }
        
        codemap += `\n`;
    }
    
    // Write CODEMAP.md
    fs.writeFileSync('CODEMAP.md', codemap);
    console.log('CODEMAP.md generated successfully!');
}

function findFiles(dir, extensions) {
    const results = [];
    const excluded = ['node_modules', '.git', 'dist', '.vscode'];
    
    function walk(currentDir) {
        try {
            for (const entry of fs.readdirSync(currentDir)) {
                const fullPath = path.join(currentDir, entry);
                const stats = fs.statSync(fullPath);
                
                if (stats.isDirectory()) {
                    if (!excluded.includes(entry)) {
                        walk(fullPath);
                    }
                } else {
                    const ext = path.extname(entry);
                    if (extensions.includes(ext)) {
                        results.push(fullPath);
                    }
                }
            }
        } catch (e) {
            // Skip directories we can't read
        }
    }
    
    walk(dir);
    return results;
}

function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

// Run the manual scan
manualScan();
