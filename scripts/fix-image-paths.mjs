import fs from 'fs';
import path from 'path';

const root = process.cwd();
const productsPath = path.join(root, 'src', 'data', 'products.js');
const publicImages = path.join(root, 'public', 'Images');

function readProducts(){
  const raw = fs.readFileSync(productsPath, 'utf8');
  const match = raw.match(/const\s+products\s*=\s*(\[([\s\S]*)\]);/m);
  if(!match) throw new Error('Could not parse products array from products.js');
  const arrayText = match[1];
  let jsonLike = arrayText
    .replace(/\bundefined\b/g, 'null')
    .replace(/(\w+):/g, '"$1":')
    .replace(/'/g, '"');
  jsonLike = jsonLike.replace(/,\s*([}\]])/g, '$1');
  try{
    return JSON.parse(jsonLike);
  }catch(e){
    console.error('Failed to JSON.parse products text. Falling back to eval.');
    const products = eval(arrayText);
    return products;
  }
}

function walkDir(dir){
  const out = [];
  const items = fs.readdirSync(dir, {withFileTypes:true});
  for(const it of items){
    const p = path.join(dir, it.name);
    if(it.isDirectory()) out.push(...walkDir(p));
    else out.push(p);
  }
  return out;
}

function relToImages(p){
  const rel = p.replace(root, '').replace(/\\/g, '/');
  const idx = rel.indexOf('/Images');
  if(idx>=0) return rel.slice(idx);
  return '/Images' + rel;
}

(async function main(){
  console.log('Reading products...');
  const products = readProducts();
  console.log(`Loaded ${products.length} products`);

  console.log('Indexing public Images...');
  const allFiles = walkDir(publicImages);
  const filenameIndex = new Map();
  for(const f of allFiles){
    filenameIndex.set(path.basename(f).toLowerCase(), f);
  }

  const fixes = [];

  for(const p of products){
    const fields = [];
    if(p.image) fields.push(['image','image']);
    if(Array.isArray(p.images)) fields.push(...p.images.map((_,i)=>['images',i]));

    for(const [field, index] of fields){
      const val = (field==='image') ? p.image : p.images[index];
      if(!val) continue;
      const rel = val.replace(/^\//,'');
      const absPublic = path.join(root, rel);
      if(fs.existsSync(absPublic)) continue;
      const basename = path.basename(val).toLowerCase();
      if(filenameIndex.has(basename)){
        const found = filenameIndex.get(basename);
        const newRel = relToImages(found);
        // apply to product
        if(field==='image') p.image = newRel;
        else p.images[index] = newRel;
        fixes.push({product: p.slug || p.title || p.id || '(unknown)', old: val, new: newRel});
      } else {
        // try fuzzy match by prefix (e.g., derimod-1.jpg -> derimod-2.jpg)
        const stem = basename.replace(/[-_]?\d+\.[a-z]+$/,'').replace(/[-_]?\d+\.[a-z]+$/,'');
        const candidates = Array.from(filenameIndex.keys()).filter(k=>k.startsWith(stem));
        if(candidates.length>0){
          const cand = candidates[0];
          const found = filenameIndex.get(cand);
          const newRel = relToImages(found);
          if(field==='image') p.image = newRel;
          else p.images[index] = newRel;
          fixes.push({product: p.slug || p.title || p.id || '(unknown)', old: val, new: newRel, fuzzy:true});
        }
      }
    }
  }

  console.log(`Found ${fixes.length} fixes`);
  for(const f of fixes) console.log(f.product, f.old, '->', f.new);

  if(fixes.length===0){
    console.log('No changes to apply');
    return;
  }

  // Backup original
  fs.copyFileSync(productsPath, productsPath + '.bak');
  console.log('Backup created', productsPath + '.bak');

  // Replace in source file by simple string replace of old values with new ones
  let src = fs.readFileSync(productsPath, 'utf8');
  for(const f of fixes){
    const oldEsc = f.old.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const re = new RegExp(`(["'])${oldEsc}(["'])`, 'g');
    src = src.replace(re, `"${f.new}"`);
  }

  fs.writeFileSync(productsPath, src, 'utf8');
  console.log('Applied fixes to', productsPath);

  console.log('Re-running image check:');
  let missing = 0;
  for(const p of products){
    if(p.image){
      const check = path.join(root, p.image.replace(/^\//, ''));
      if(!fs.existsSync(check)) missing++;
    }
    if(Array.isArray(p.images)){
      for(const img of p.images){
        if(img){
          const check = path.join(root, img.replace(/^\//, ''));
          if(!fs.existsSync(check)) missing++;
        }
      }
    }
  }
  console.log('Missing after fixes:', missing);
})();
