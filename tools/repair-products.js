const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, '..', 'src', 'data', 'products.js');
const backup = file + '.repairbak';
let src = fs.readFileSync(file, 'utf8');
fs.writeFileSync(backup, src, 'utf8');
console.log('Backup written to', backup);

// find array start and end
const startMatch = src.match(/export\s+const\s+products\s*=\s*\[/);
if (!startMatch) { console.error('products array not found'); process.exit(1); }
const arrStart = src.indexOf('[', startMatch.index);
// find the matching closing '];' by scanning
let i = arrStart + 1;
let depth = 1;
let arrEnd = -1;
while (i < src.length) {
  const ch = src[i];
  if (ch === '{') depth++;
  else if (ch === '}') depth--;
  if (depth === 0) { arrEnd = i; break; }
  i++;
}
if (arrEnd === -1) { console.error('Could not find end of products array'); process.exit(1); }
const before = src.slice(0, arrStart+1);
const after = src.slice(arrEnd);
const body = src.slice(arrStart+1, arrEnd);

// Split into objects by parsing balancing braces
let blocks = [];
let buf = '';
let d = 0;
for (let j = 0; j < body.length; j++) {
  const ch = body[j];
  buf += ch;
  if (ch === '{') d++;
  else if (ch === '}') d--;
  if (d === 0 && buf.trim()) {
    blocks.push(buf);
    buf = '';
  }
}

function normalizePath(p) {
  if (!p) return p;
  return p.replace(/^\/?\/images\//i, '/Images/').replace(/^\/\//, '/');
}

const fixedBlocks = blocks.map(block => {
  // if block already has images: return as-is after normalizing any image paths in existing arrays
  if (/\bimages\s*:\s*\[/i.test(block)) {
    // normalize all "..." paths
    return block.replace(/"(.*?)"/g, (m, p1) => '"' + p1.replace(/^\/?\/images\//i, '/Images/').replace(/^\/\//,'/') + '"');
  }
  // collect stray string-only lines that look like image paths
  const lines = block.split(/\n/);
  const imageLines = [];
  const kept = [];
  for (let ln of lines) {
    if (/^\s*["']\/?\/?images\/[^"]+["']\s*,?\s*$/i.test(ln) || /^\s*["']\/Images\/[^"]+["']\s*,?\s*$/.test(ln)) {
      const m = ln.match(/(["'])(.*?)\1/);
      if (m) imageLines.push(normalizePath(m[2]));
      continue;
    }
    kept.push(ln);
  }
  if (imageLines.length === 0) return block.replace(/"(.*?)"/g, (m,p1)=>'"'+normalizePath(p1)+'"');
  // Insert images: [...] after the image: line if present, else after name:
  let out = [];
  let inserted = false;
  for (let k = 0; k < kept.length; k++) {
    out.push(kept[k]);
    if (!inserted && /\bimage\s*:\s*"/i.test(kept[k])) {
      const indentMatch = kept[k].match(/^(\s*)/);
      const indent = indentMatch ? indentMatch[1] : '  ';
      out.push(indent + 'images: [');
      for (const p of imageLines) {
        out.push(indent + '  "' + p + '",');
      }
      out.push(indent + '],');
      inserted = true;
    }
  }
  if (!inserted) {
    // try after name
    out = [];
    inserted = false;
    for (let k = 0; k < kept.length; k++) {
      out.push(kept[k]);
      if (!inserted && /\bname\s*:\s*"/i.test(kept[k])) {
        const indentMatch = kept[k].match(/^(\s*)/);
        const indent = indentMatch ? indentMatch[1] : '  ';
        out.push(indent + 'images: [');
        for (const p of imageLines) {
          out.push(indent + '  "' + p + '",');
        }
        out.push(indent + '],');
        inserted = true;
      }
    }
  }
  return out.join('\n');
});

const rebuilt = before + '\n' + fixedBlocks.join(',\n') + '\n' + after;
fs.writeFileSync(file, rebuilt, 'utf8');
console.log('Repaired products.js and inserted images arrays where missing.');
