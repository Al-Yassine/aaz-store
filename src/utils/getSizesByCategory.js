// Get size options based on product category
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
  
  // Shoes
  if (categoryLower.includes('chaussure') || categoryLower.includes('shoe') || 
      categoryLower.includes('sneaker') || categoryLower.includes('boot')) {
    return ['40', '41', '42', '43', '44', '45', '46'];
  }
  
  // Default sizes for other categories
  return ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
};

// Get default size based on category
export const getDefaultSize = (category) => {
  const sizes = getSizesByCategory(category);
  // Return middle size as default
  return sizes[Math.floor(sizes.length / 2)];
};