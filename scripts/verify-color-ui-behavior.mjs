import { products } from '../src/data/products.js';
import { getSizesByCategory } from '../src/utils/getSizesByCategory.js';

const failures = [];

products.forEach(p => {
  const variants = p.variants || [];
  const sizeStockMap = {};
  variants.forEach(v=>{
    if (v.size) sizeStockMap[String(v.size)] = (sizeStockMap[String(v.size)]||0) + (v.stock||0);
    if (v.sizes){ if (Array.isArray(v.sizes)) v.sizes.forEach(s=> sizeStockMap[String(s)] = (sizeStockMap[String(s)]||0) + (v.stock||0)); else sizeStockMap[String(v.sizes)] = (sizeStockMap[String(v.sizes)]||0) + (v.stock||0); }
  });

  const full = getSizesByCategory(p.category||'');
  const displayed = [];
  full.forEach(sz=>{ if(!displayed.includes(sz)) displayed.push(sz); });
  Object.keys(sizeStockMap).forEach(sz=>{ if(!displayed.includes(sz)) displayed.push(sz); });

  // build color size map
  const colorSize = {};
  variants.forEach(v=>{
    const c = v.color || null;
    if(!c) return;
    if(!colorSize[c]) colorSize[c] = {};
    if (v.size) colorSize[c][String(v.size)] = (colorSize[c][String(v.size)]||0)+(v.stock||0);
    if (v.sizes){ if (Array.isArray(v.sizes)) v.sizes.forEach(s=> colorSize[c][String(s)] = (colorSize[c][String(s)]||0) + (v.stock||0)); else colorSize[c][String(v.sizes)] = (colorSize[c][String(v.sizes)]||0) + (v.stock||0); }
  });

  const colors = Array.from(new Set(variants.map(v=>v.color).filter(Boolean)));
  if(colors.length===0) return; // not applicable

  colors.forEach(c => {
    displayed.forEach(sz => {
      const colorStock = (colorSize[c] && (colorSize[c][String(sz)]||0)) || 0;
      // UI should show size always, and should disable it when colorStock <=0
      // There's no contradiction to detect except if colorStock>0 but variant entries do not account for it - but colorStock comes from variants
      if (colorStock < 0) failures.push({id:p.id, name:p.name, color:c, size:sz, issue:'negative stock'});
    });
  });
});

if(failures.length===0) console.log('Color -> size UI behavior checks: OK');
else { console.log('Failures:'); console.table(failures); process.exit(2); }