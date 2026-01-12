import { products } from '../src/data/products.js';
import { getSizesByCategory } from '../src/utils/getSizesByCategory.js';

const problems = [];

products.forEach(p => {
  const variants = p.variants || [];
  const colors = Array.from(new Set(variants.map(v=>v.color).filter(Boolean)));
  const colorSizeMap = {};
  variants.forEach(v=>{
    const c = v.color || null;
    if (!c) return;
    if (!colorSizeMap[c]) colorSizeMap[c] = {};
    if (v.size) colorSizeMap[c][String(v.size)] = (colorSizeMap[c][String(v.size)]||0) + (v.stock||0);
    if (v.sizes){ if (Array.isArray(v.sizes)) v.sizes.forEach(s=>colorSizeMap[c][String(s)] = (colorSizeMap[c][String(s)]||0) + (v.stock||0)); else colorSizeMap[c][String(v.sizes)] = (colorSizeMap[c][String(v.sizes)]||0) + (v.stock||0); }
  });

  // Ensure that for each color, we can compute stock per displayed size
  const allSizes = getSizesByCategory(p.category||'');
  Object.keys(colorSizeMap).forEach(c=>{
    const missing = allSizes.filter(sz=>!(sz in colorSizeMap[c]) && !variants.some(v=>String(v.size)===String(sz) || (Array.isArray(v.sizes) && v.sizes.includes(sz))));
    if (missing.length>0) problems.push({id:p.id, name:p.name, color: c, missingSizes: missing});
  });
});

if (problems.length===0){
  console.log('Per-color size mapping looks consistent (or variants explicitly define sizes).');
} else {
  console.log('Problems found:');
  console.table(problems.slice(0,200));
  process.exit(2);
}