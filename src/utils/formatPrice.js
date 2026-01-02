export const formatPrice = (price) => {
  if (!price && price !== 0) return '0 CFA';
  
  // Convert to string and remove decimals
  const priceStr = Math.round(price).toString();
  
  // Add space every 3 digits from the right
  const formatted = priceStr.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  
  return `${formatted} CFA`;
};

export const hasDiscount = (product) => {
  return product.originalPrice && product.originalPrice > product.price;
};

export const getDiscountPercentage = (originalPrice, currentPrice) => {
  if (!originalPrice || !currentPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};