console.log('check-import start');
import('../src/data/products.js').then(m=>{
  console.log('import ok. products count', m.products.length);
}).catch(err=>{ console.error('import error:', err); process.exit(1); });
