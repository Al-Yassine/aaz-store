/**
 * Formats a price with proper spacing (95 000 CFA)
 * @param {number} price - The price to format
 * @returns {string} - Formatted price string
 */
export const formatPrice = (price) => {
  if (!price && price !== 0) return '0 CFA';
  
  // Convert to string and remove decimals
  const priceStr = Math.round(price).toString();
  
  // Add space every 3 digits from the right
  const formatted = priceStr.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  
  return `${formatted} CFA`;
};

/**
 * Checks if a product has a discount
 * @param {object} product - The product object
 * @returns {boolean} - True if product has originalPrice
 */
export const hasDiscount = (product) => {
  return product.originalPrice && product.originalPrice > product.price;
};

/**
 * Calculates discount percentage
 * @param {number} originalPrice - Original price
 * @param {number} currentPrice - Current price
 * @returns {number} - Discount percentage
 */
export const getDiscountPercentage = (originalPrice, currentPrice) => {
  if (!originalPrice || !currentPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};