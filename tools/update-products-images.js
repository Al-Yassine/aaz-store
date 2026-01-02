const fs = require('fs');
const path = require('path');

const workspace = path.resolve(__dirname, '..');
const productsFile = path.join(workspace, 'src', 'data', 'products.js');
const imagesRoot = path.join(workspace, 'public', 'Images');

function walk(dir) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files = files.concat(walk(full));
    else files.push(full);
  }
  return files;
}

const allFiles = walk(imagesRoot);
const mapByBasename = new Map();
for (const f of allFiles) {
  const base = path.basename(f).toLowerCase();
  const rel = '/Images' + f.replace(imagesRoot, '').replace(/\\/g, '/');
  if (!mapByBasename.has(base)) mapByBasename.set(base, rel);
}

let content = fs.readFileSync(productsFile, 'utf8');

// Replace /images/ prefix with /Images/ where possible and fix basenames
const imgRegex = /"(\/images\/[^"]+)"/gi;
let m;
const replacements = new Map();
while ((m = imgRegex.exec(content)) !== null) {
  const orig = m[1];
  const basename = path.basename(orig).toLowerCase();
  let replacement = null;
  // direct equivalent
  const direct = path.join(workspace, 'public', orig.replace(/^\//, ''));
  if (fs.existsSync(direct)) {
    replacement = '/' + path.relative(path.join(workspace, 'public'), direct).replace(/\\/g, '/');
    // ensure leading /Images
    if (!replacement.startsWith('/Images')) replacement = replacement.replace(/^/,'/');
  }
  if (!replacement && mapByBasename.has(basename)) {
    replacement = mapByBasename.get(basename);
  }
  if (!replacement) {
    // fallback: change prefix to /Images/
    replacement = orig.replace(/^\/images\//i, '/Images/');
  }
  replacements.set(orig, replacement);
}

// Apply replacements
for (const [orig, replacement] of replacements.entries()) {
  const re = new RegExp(orig.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
  content = content.replace(re, replacement);
}

// Collapse images arrays to single image entry for consistency
// Find images: [ ... ] blocks and replace with single entry using image field if present
content = content.replace(/images:\s*\[([^\]]+)\]/gi, (match, p1) => {
  // extract first string path inside
  const m = p1.match(/"([^"]+)"/);
  if (m && m[1]) return `images: ["${m[1]}"]`;
  return 'images: []';
});

// Ensure image fields use /Images/ prefix (already handled above by replacements)
content = content.replace(/image:\s*"(\/images\/[^"]+)"/gi, (m, p1) => {
  const key = p1;
  const repl = replacements.get(key) || p1.replace(/^\/images\//i, '/Images/');
  return `image: "${repl}"`;
});

fs.writeFileSync(productsFile, content, 'utf8');
console.log('Updated products.js with', replacements.size, 'path replacements.');
console.log('Collapsed images arrays to single entries.');
