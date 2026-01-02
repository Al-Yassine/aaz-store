const fs = require('fs');
const path = require('path');

const workspace = path.resolve(__dirname, '..');
const productsFile = path.join(workspace, 'src', 'data', 'products.js');
const imagesRoot = path.join(workspace, 'public', 'Images');

const read = fs.readFileSync(productsFile, 'utf8');

// Find all occurrences of "/images/..." in the file
const regex = /"(\/images\/[^"]+)"/g;
let match;
const refs = new Set();
while ((match = regex.exec(read)) !== null) {
  refs.add(match[1]);
}

const results = [];
for (const ref of refs) {
  // normalize and try to find a matching file under public/Images
  const rel = ref.replace(/^\/images\//i, '');
  const candidate = path.join(imagesRoot, rel);
  const candidateAlt = path.join(imagesRoot, rel.toLowerCase());
  const candidateAlt2 = path.join(imagesRoot, rel.replace(/\//g, path.sep));

  let found = null;
  if (fs.existsSync(candidate)) found = path.join('/Images', rel).replace(/\\/g, '/');
  else {
    // try case-insensitive search by walking directories
    const parts = rel.split('/');
    let dir = imagesRoot;
    let ok = true;
    const realParts = [];
    for (const p of parts) {
      const entries = fs.readdirSync(dir);
      const foundName = entries.find(e => e.toLowerCase() === p.toLowerCase());
      if (!foundName) { ok = false; break; }
      realParts.push(foundName);
      dir = path.join(dir, foundName);
    }
    if (ok) found = path.join('/Images', ...realParts).replace(/\\/g, '/');
  }

  results.push({ ref, found });
}

console.log(JSON.stringify(results, null, 2));
