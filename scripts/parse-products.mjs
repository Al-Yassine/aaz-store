import fs from 'fs';
const code = fs.readFileSync(new URL('../src/data/products.js', import.meta.url), 'utf8');
const start = code.indexOf('export const products =');
if (start === -1) { console.error('start not found'); process.exit(1); }
const arrStart = code.indexOf('[', start);
const arrEnd = code.lastIndexOf('];');
if (arrStart === -1 || arrEnd === -1) { console.error('array bounds not found'); process.exit(1); }
const arrayText = code.slice(arrStart, arrEnd+1);
console.error('arrayText start snippet:', JSON.stringify(arrayText.slice(0,200)));
console.error('arrayText start char codes:', arrayText.slice(0,50).split('').map(c=>c.charCodeAt(0)).join(','));
const testCode = 'const products = ' + arrayText + ';';
try {
  // Try creating a function to parse
  new Function('return ' + arrayText + ';')();
  console.log('Array parsed OK');
} catch (err) {
  console.error('Parse error:', err.message);
  // Binary search to find where parsing breaks
  let lo = 1, hi = arrayText.length, bad = -1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const sub = arrayText.slice(0, mid);
    try {
      new Function('const products = ' + sub + ';');
      lo = mid + 1;
    } catch (e) {
      bad = mid;
      hi = mid - 1;
    }
  }
  if (bad !== -1) {
    const contextRadius = 80;
    const startIdx = Math.max(0, bad - contextRadius);
    const endIdx = Math.min(arrayText.length, bad + contextRadius);
    console.error('Approx error index in array text:', bad);
    console.error('Context:\n' + arrayText.slice(startIdx, endIdx));
  }
  process.exit(1);
}
