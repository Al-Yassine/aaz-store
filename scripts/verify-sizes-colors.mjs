import { products } from '../src/data/products.js';
import { getSizesByCategory } from '../src/utils/getSizesByCategory.js';

const problems = [];

products.forEach(p => {
  const variants = p.variants || [];
  // collect variant sizes
  const variantSizes = new Set();
  variants.forEach(v => {
    if (v.size) variantSizes.add(String(v.size));
    if (v.sizes) {
      if (Array.isArray(v.sizes)) v.sizes.forEach(s => variantSizes.add(String(s)));
      else variantSizes.add(String(v.sizes));
    }
  });

  // collect displayed sizes as ProductDetail will (union of getSizesByCategory and variant sizes)
  const catSizes = getSizesByCategory(p.category || '');
  const displayed = [];
  catSizes.forEach(sz => { if (!displayed.includes(sz)) displayed.push(sz); });
  Array.from(variantSizes).forEach(sz => { if (!displayed.includes(sz)) displayed.push(sz); });

  // verify all variantSizes are present
  const missingSizes = Array.from(variantSizes).filter(sz => !displayed.includes(sz));

  // colors
  const variantColors = Array.from(new Set(variants.map(v=>v.color).filter(Boolean)));
  const productColors = Array.isArray(p.colors) ? p.colors : [];
  const colorsToDisplay = productColors.length>0 ? productColors : variantColors;
  const missingColors = variantColors.filter(c => !colorsToDisplay.includes(c));

  if (missingSizes.length>0 || missingColors.length>0) {
    problems.push({id:p.id, name:p.name, missingSizes, missingColors});
  }
});

if (problems.length===0) {
  console.log('All products display expected sizes and colors.');
} else {
  console.log('Problems found:');
  console.table(problems.slice(0,200));
  process.exit(2);
}