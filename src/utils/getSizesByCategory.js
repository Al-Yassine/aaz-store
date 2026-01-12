export const getSizesByCategory = (category) => {
  const categoryLower = (category || '').toLowerCase();
  
  // Costumes & Blazers
  if (categoryLower.includes('costume') || categoryLower.includes('blazer')) {
    return ['46', '48', '50', '52', '54', '56', '58', '60'];
  }
  
  // Shirts & T-Shirts
  if (categoryLower.includes('chemise') || categoryLower.includes('shirt') || 
      categoryLower.includes('t-shirt') || categoryLower.includes('polo')) {
    return ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  }
  
  // Shoes (support English and French terms)
  if (categoryLower.includes('chaussure') || categoryLower.includes('shoe') || 
      categoryLower.includes('sneaker') || categoryLower.includes('boot') ||
      categoryLower.includes('mocassin') || categoryLower.includes('souliers') || categoryLower.includes('souliers')) {
    // standard shoe EU sizes used by this store
    return ['40', '41', '42', '43', '44', '45', '46'];
  }
  
  // Default sizes for other categories
  return ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
};

export const getDefaultSize = (category) => {
  const sizes = getSizesByCategory(category);
  return sizes[Math.floor(sizes.length / 2)];
};