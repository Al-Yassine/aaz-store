const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, '..', 'src', 'data', 'products.js');
let src = fs.readFileSync(file, 'utf8');

// Very small heuristic: replace "image: "...",\n    category: with ensuring images: ["..."], if images: not present
src = src.replace(/image:\s*"([^"]+)"([\s\S]*?)(?:images:\s*\[)/gi, (m, img, rest) => {
  // if images: already exists, leave as-is
  return `image: "${img}"${rest}`;
});

// Where image: exists but images: does not, insert images: [image]
src = src.replace(/(image:\s*"([^"]+)",?\s*)(category:\s*"[^"]+"|sizes:|colors:|description:)/gi, (m, imgLine, imgPath, nextKey) => {
  // check if images: appears earlier in the same product block
  const blockStart = src.lastIndexOf('{', src.indexOf(m));
  const blockEnd = src.indexOf('}', src.indexOf(m));
  const block = src.slice(blockStart, blockEnd);
  if (/images\s*:/i.test(block)) return m; // already has images
  return `${imgLine}images: ["${imgPath.replace(/^(?:\/\/)?/,'/').replace(/^\/images\//i,'/Images/')}",],\n    ${nextKey}`;
});

fs.writeFileSync(file, src, 'utf8');
console.log('Ensured images arrays (heuristic).');
