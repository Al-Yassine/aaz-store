import fs from 'fs';
const code = fs.readFileSync(new URL('../src/data/products.js', import.meta.url), 'utf8');
let stack = [];
const pairs = {'{': '}', '[': ']', '(': ')'};
const opens = new Set(['{','[','(']);
const closes = new Set(['}',']',')']);
for (let i=0;i<code.length;i++){
  const ch = code[i];
  if (opens.has(ch)) stack.push({ch, i});
  if (closes.has(ch)){
    if (stack.length===0){
      console.error('Unmatched close', ch, 'at', i);
      break;
    }
    const last = stack.pop();
    if (pairs[last.ch] !== ch){
      console.error('Mismatched pair', last.ch, 'at', last.i, 'closing with', ch, 'at', i);
      break;
    }
  }
}
if (stack.length) {
  console.error('Unclosed openers remaining count:', stack.length, 'top:', stack[stack.length-1]);
  const idx = stack[stack.length-1].i;
  console.error('Context around unmatched opener:', code.slice(Math.max(0, idx-200), idx+200));
} else console.log('All braces/brackets matched');
// Also show a larger context around previously detected mismatch region
const start=29100, end=29850; console.error('Context slice 29100-29850:\n', code.slice(start,end));
