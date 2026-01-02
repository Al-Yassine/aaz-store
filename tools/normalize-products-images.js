const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, '..', 'src', 'data', 'products.js');
const backup = file + '.normalizebak';
let src = fs.readFileSync(file, 'utf8');
fs.writeFileSync(backup, src, 'utf8');
console.log('Backup written to', backup);

// normalize double-slashes and duplicates inside images arrays
src = src.replace(/images:\s*\[([\s\S]*?)\]/gi, (m, p1) => {
  // extract string entries
  const entries = [];
  const re = /["']([^"']+)["']/g;
  let mm;
  while ((mm = re.exec(p1)) !== null) entries.push(mm[1]);
  const normalized = entries.map(e => e.replace(/^\/\//, '/').replace(/^\/?images\//i, '/Images/')).filter(Boolean);
  const uniq = Array.from(new Set(normalized));
  const out = 'images: [\n' + uniq.map(u => `    "${u}",`).join('\n') + '\n  ]';
  return out;
});

// also fix single image references like image: "//images/..." to normalized
src = src.replace(/image:\s*["']([^"']+)["']/gi, (m,p1) => {
  const norm = p1.replace(/^\/\//, '/').replace(/^\/?images\//i, '/Images/');
  return `image: "${norm}"`;
});

fs.writeFileSync(file, src, 'utf8');
console.log('Normalized images arrays and image paths.');
