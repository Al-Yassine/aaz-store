import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
const mod = await import('../src/data/products.js');
const products = mod.products || [];
const projRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicImages = path.join(projRoot, 'public', 'Images');
const srcImages = path.join(projRoot, 'src', 'Images');

const missing = [];
function checkPath(p) {
  if (!p) return;
  // Normalize leading slashes
  const rel = p.replace(/^\/*/, '');
  const publicPath = path.join(projRoot, rel);
  const alternatePublic = path.join(publicImages, rel.replace(/^Images\//, ''));
  const srcPath = path.join(projRoot, rel.replace(/^Images\//, 'src/Images/'));
  if (fs.existsSync(publicPath)) return true;
  if (fs.existsSync(alternatePublic)) return true;
  if (fs.existsSync(srcPath)) return true;
  return false;
}

products.forEach(p=>{
  const check = (val) => {
    if (!val) return;
    if (Array.isArray(val)) val.forEach(check);
    else if (typeof val === 'string') {
      if (!checkPath(val)) missing.push({id:p.id, name:p.name, path:val});
    }
  };
  check(p.image);
  check(p.images);
});

if (missing.length===0) {
  console.log('All referenced images exist on disk.');
} else {
  console.log('Missing images count:', missing.length);
  console.table(missing.slice(0,200));
}
