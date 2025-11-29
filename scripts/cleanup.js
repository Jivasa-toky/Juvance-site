 
// scripts/cleanup.js
const fs = require('fs');
const path = require('path');

const targetDir = process.argv[2]; // e.g., 'data' or 'logs'
if (!targetDir) {
  console.error('Usage: node scripts/cleanup.js <folder>');
  process.exit(1);
}

const dirPath = path.join(__dirname, '..', targetDir);
if (!fs.existsSync(dirPath)) {
  console.error('Folder does not exist:', dirPath);
  process.exit(1);
}

for (const name of fs.readdirSync(dirPath)) {
  const p = path.join(dirPath, name);
  const stat = fs.statSync(p);
  if (stat.isDirectory()) {
    fs.rmSync(p, { recursive: true, force: true });
  } else {
    fs.unlinkSync(p);
  }
}
console.log(`Cleared contents of ${dirPath}`);
