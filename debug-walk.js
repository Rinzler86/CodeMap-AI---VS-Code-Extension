// Debug version of walkWorkspace to test locally
const fs = require('fs');
const path = require('path');

const EXCLUDED_DIRS = ["node_modules", ".git", ".vscode", ".idea", "dist", "build", "target", ".venv", "__pycache__"];

function debugWalkWorkspace(root, maxFileKB = 800) {
  const results = [];
  console.log(`Starting scan of: ${root}`);
  
  function walk(dir) {
    try {
      const entries = fs.readdirSync(dir);
      console.log(`\nScanning directory: ${dir}`);
      console.log(`Found ${entries.length} entries: ${entries.join(', ')}`);
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory()) {
          if (EXCLUDED_DIRS.includes(entry)) {
            console.log(`❌ Skipping excluded directory: ${entry}`);
            continue;
          }
          console.log(`📁 Entering directory: ${entry}`);
          walk(fullPath);
        } else {
          console.log(`📄 Found file: ${entry} (${stats.size} bytes)`);
          
          if (stats.size > maxFileKB * 1024) {
            console.log(`❌ Skipping large file: ${entry} (${stats.size} bytes > ${maxFileKB * 1024})`);
            continue;
          }
          
          // Skip binary files by extension
          const ext = path.extname(entry).toLowerCase();
          const binaryExts = ['.exe', '.dll', '.so', '.dylib', '.bin', '.zip', '.tar', '.gz', '.jpg', '.png', '.gif', '.pdf', '.ico', '.woff', '.woff2', '.ttf'];
          if (binaryExts.includes(ext)) {
            console.log(`❌ Skipping binary file: ${entry} (extension: ${ext})`);
            continue;
          }
          
          console.log(`✅ Adding file: ${fullPath}`);
          results.push(fullPath);
        }
      }
    } catch (e) {
      console.log(`❌ Error reading directory ${dir}:`, e.message);
    }
  }
  
  walk(root);
  console.log(`\n📊 SUMMARY: Found ${results.length} files total`);
  return results;
}

// Test on this CodeMapExtension project
console.log('='.repeat(60));
console.log('TESTING FILE DISCOVERY ON CODEMAPEXTENSION PROJECT');
console.log('='.repeat(60));

const testResults = debugWalkWorkspace(process.cwd());
console.log('\n📋 FILES FOUND:');
testResults.forEach((file, index) => {
  console.log(`${index + 1}. ${path.relative(process.cwd(), file)}`);
});
