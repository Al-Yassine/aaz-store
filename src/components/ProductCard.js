import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import PhotoSlider from './PhotoSlider';
import { formatPrice, hasDiscount } from '../utils/formatPrice';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleImageClick = (e) => {
    // Don't navigate if clicking on slider controls
    if (e.target.closest('.slider-arrow') || 
        e.target.closest('.slider-dot')) {
      return;
    }
    
    // Navigate to product detail
    navigate(`/product/${product.id}`);
  };

  // Keep full images array (deduped) and normalize paths
  const displayImages = Array.from(new Set((product.images && product.images.length ? product.images : [product.image]).map(img => (img || '').replace(/^\/\/?images\//i, '/Images/'))));

  return (
    <div className="product-card">
      <div className="product-image-container" onClick={handleImageClick}>
        <div className="product-image">
          <PhotoSlider images={displayImages} productName={product.name} compact={true} />
        </div>
      </div>
      <div className="product-info">
        <Link to={`/product/${product.id}`} className="product-name-link">
          <h3 className="product-name">{product.name}</h3>
        </Link>
        <p className="product-category">{product.category}</p>

        <div className="product-price-container">
          {hasDiscount(product) && (
            <p className="product-price-old">{formatPrice(product.originalPrice)}</p>
          )}
          <p className="product-price">{formatPrice(product.price)}</p>
        </div>
        <button 
          className="add-to-cart-btn" 
          onClick={handleAddToCart}
        >
          Ajouter au Panier
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
