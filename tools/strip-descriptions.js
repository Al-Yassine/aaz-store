const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'data', 'products.js');
const backupPath = filePath + '.bak';

if (!fs.existsSync(filePath)) {
  console.error('products.js not found at', filePath);
  process.exit(1);
}

const original = fs.readFileSync(filePath, 'utf8');
fs.writeFileSync(backupPath, original, 'utf8');
console.log('Backup written to', backupPath);

// Remove occurrences like: description: "...",
// and handle both single and double quotes, optional trailing comma, and whitespace.
const cleaned = original.replace(/,?\s*description\s*:\s*(?:"[\s\S]*?"|'[\s\S]*?')\s*,?/g, match => {
  // If the match starts with a comma and ends with a comma, keep one comma to avoid trailing comma issues
  // Simpler: replace with a single comma if there are two commas nearby
  return '';
});

fs.writeFileSync(filePath, cleaned, 'utf8');
console.log('Descriptions removed from', filePath);
