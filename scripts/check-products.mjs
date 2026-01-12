import('../src/data/products.js').then(m=>{
  const { products } = m;
  const sampleIds = [1,19,31,52,63,73];
  sampleIds.forEach(id => {
    const p = products.find(x=> x.id===id);
    if (!p) return console.log(`id ${id} not found`);
    const sizes = p.variants ? p.variants.map(v => v.size || v.sizes).flat() : [];
    console.log(`id ${id}  (${p.category}): sizes count ${sizes.length}, sizes: ${[...new Set(sizes)].join(', ')}`);
  });
}).catch(err=>{ console.error(err); process.exit(1); });
