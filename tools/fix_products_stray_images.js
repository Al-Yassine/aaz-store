const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, '..', 'src', 'data', 'products.js');
const backup = file + '.straybak';
let src = fs.readFileSync(file, 'utf8');
fs.writeFileSync(backup, src, 'utf8');
console.log('Backup saved to', backup);

const lines = src.split('\n');
const out = [];
let i = 0;

function normalize(p) {
  if (!p) return p;
  // remove surrounding quotes and trailing characters
  p = p.trim();
  // remove leading commas
  if (p.startsWith(',')) p = p.slice(1).trim();
  // extract quoted content
  const m = p.match(/^["']([^"']+)["']/);
  if (m) p = m[1];
  // normalize slashes
  p = p.replace(/^\/\//, '/');
  p = p.replace(/^\/?images\//i, '/Images/');
  return p;
}

while (i < lines.length) {
  const line = lines[i];
  out.push(line);

  const imageMatch = line.match(/^(\s*)image:\s*["']([^"']+)["']\s*,?\s*$/i);
  if (imageMatch) {
    const indent = imageMatch[1] || '';
    const mainImg = normalize(imageMatch[2]);
    // look ahead for stray quoted lines
    let j = i + 1;
    // skip empty lines
    while (j < lines.length && /^\s*$/.test(lines[j])) j++;
    // if next line starts with a quoted path, collect consecutive
    const collected = [];
    while (j < lines.length) {
      const m = lines[j].match(/^\s*["']([^"']+)["']\s*,?\s*]?\s*,?\s*$/);
      if (m) {
        collected.push(normalize(m[1]));
        j++;
        continue;
      }
      // if line contains only '],' or '],' with whitespace, skip and advance but stop
      if (/^\s*\],?\s*$/.test(lines[j])) { j++; break; }
      // stop if next non-empty line is a property (e.g., category:)
      if (/^\s*[a-zA-Z0-9_\-]+\s*:\s*/.test(lines[j])) break;
      // otherwise stop
      break;
    }
    if (collected.length > 0) {
      // remove the lines we consumed from out (we already pushed image line)
      // so we need to pop any lines we pushed that correspond to the collected lines; but we didn't push them yet because we stopped pushing when encountering them; however we did push the image line only. We'll advance i to j-1 and then insert images array lines now.
      // build images array including mainImg + collected
      const imgs = [mainImg].concat(collected.filter(Boolean));
      // insert images array after the last pushed line (which is the image line)
      imgs.forEach((p, idx) => {
        // no-op here
      });
      // create images block
      const arrLines = [];
      arrLines.push(indent + 'images: [');
      imgs.forEach(p => arrLines.push(indent + '  "' + p + '",'));
      arrLines.push(indent + '],');
      // append images block to out
      out.push(...arrLines);
      // advance i to j-1 (outer loop will i++)
      i = j - 1;
    }
  }
  i++;
}

const fixed = out.join('\n');
fs.writeFileSync(file, fixed, 'utf8');
console.log('Fixed stray images; written to', file);
