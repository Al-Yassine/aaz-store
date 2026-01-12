import('../src/data/products.js').then(m=>{
  const products = m.products;
  const CATEGORY_SIZES = {
    Costumes: ["44","46","48","50","52","54","56","58","60"],
    Blazers: ["44","46","48","50","52","54","56","58","60"],
    Chemises: ["S","M","L","XL","XXL","3XL"],
    "T-shirt-Polo": ["S","M","L","XL","XXL","3XL"],
    Chaussures: ["40","41","42","43","44","45"],
  };
  let failures = 0;
  products.forEach(p=>{
    const sizes = (p.variants||[]).map(v=> v.size).filter(Boolean);
    const expected = CATEGORY_SIZES[p.category];
    if (!expected) return;
    const missing = expected.filter(s=> !sizes.includes(s));
    if (missing.length){
      failures++;
      console.error(`id ${p.id} (${p.category}) missing sizes: ${missing.join(', ')}`);
    }
  });
  if (failures===0) console.log('All products have expected sizes'); else console.log(failures, 'products missing sizes');
}).catch(e=>{ console.error('import error', e); process.exit(1); });
