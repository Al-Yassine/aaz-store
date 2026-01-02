const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, '..', 'src', 'data', 'products.js');
const backup = file + '.bak';
let src = fs.readFileSync(file, 'utf8');
fs.writeFileSync(backup, src, 'utf8');
console.log('Backup written to', backup);

const lines = src.split('\n');
let out = [];
let i = 0;
while (i < lines.length) {
  const line = lines[i];
  out.push(line);
  // detect lines like: image: "...",
  if (/^\s*image:\s*"[^"]+",?\s*$/.test(line)) {
    // lookahead to see if next non-empty line starts with a string literal ("...",
    let j = i + 1;
    // skip blank lines
    while (j < lines.length && /^\s*$/.test(lines[j])) {
      j++;
    }
    if (j < lines.length && /^\s*"[^"]+"\s*,?\s*$/.test(lines[j])) {
      // We found stray string lines — insert images: [ before j and find the block end
      const indentMatch = lines[j].match(/^(\s*)"/);
      const indent = indentMatch ? indentMatch[1] : '    ';
      // insert images: [
      out.push(indent.replace(/\s/g, '') ? indent + 'images: [' : '  images: [');
      // now copy subsequent string lines until we hit a line that looks like \], or a property line (starts with letters and colon)
      let k = j;
      while (k < lines.length) {
        const l = lines[k];
        if (/^\s*"[^"]+"\s*,?\s*$/.test(l)) {
          // normalize leading slashes to /Images/
          const s = l.replace(/"([^"]+)"/, (m, p1) => '"' + p1.replace(/^\/\/?images\//i, '/Images/') + '"');
          out.push(s);
          k++;
          continue;
        }
        // if line is closing bracket '],' present, skip adding it because we'll add closing
        if (/^\s*\],?\s*$/.test(l)) {
          k++;
          break;
        }
        // if we reach a new property of the object (e.g., category:), stop
        if (/^\s*[a-zA-Z0-9_\-]+\s*:\s*/.test(l)) {
          break;
        }
        // otherwise, copy and move on
        k++;
      }
      // add closing bracket
      out.push((indent? indent : '    ') + '],');
      // set i to k-1 so next loop continues from k
      i = k - 1;
    }
  }
  i++;
}

const fixed = out.join('\n');
fs.writeFileSync(file, fixed, 'utf8');
console.log('Fixed product images arrays in', file);
