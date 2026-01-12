import fs from 'fs';
import path from 'path';
const filePath = new URL('../src/data/products.js', import.meta.url);
const mod = await import('../src/data/products.js');
const products = JSON.parse(JSON.stringify(mod.products));

const CATEGORY_SIZES = {
  Costumes: ["44","46","48","50","52","54","56","58","60"],
  Blazers: ["44","46","48","50","52","54","56","58","60"],
  Chemises: ["S","M","L","XL","XXL","3XL"],
  "T-shirt-Polo": ["S","M","L","XL","XXL","3XL"],
  Chaussures: ["40","41","42","43","44","45"],
};

products.forEach(product => {
  const sizes = CATEGORY_SIZES[product.category];
  if (!sizes) return;
  product.variants = product.variants || [];
  const existing = new Set();
  product.variants.forEach(v => {
    if (v.size) existing.add(String(v.size));
    if (v.sizes) {
      if (Array.isArray(v.sizes)) v.sizes.forEach(s => existing.add(String(s)));
      else existing.add(String(v.sizes));
    }
  });
  sizes.forEach(s => {
    if (!existing.has(String(s))) product.variants.push({ size: String(s), stock: 0 });
  });
});

// Serialize back to file: keep header lines from original until 'export const products = [' then replace array only
let original = fs.readFileSync(filePath, 'utf8');
const startIdx = original.indexOf('export const products =');
if (startIdx === -1) throw new Error('export not found');
const arrStart = original.indexOf('[', startIdx);
const arrEnd = original.lastIndexOf('];');
if (arrStart === -1 || arrEnd === -1) throw new Error('array bounds not found');
const header = original.slice(0, startIdx);
const footer = original.slice(arrEnd+2);
const newArrayText = JSON.stringify(products, null, 2);
const newContent = header + 'export const products = ' + newArrayText + ';\n\n' + footer;
fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Wrote updated products.js');
