import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import PhotoSlider from './PhotoSlider';
import { formatPrice, hasDiscount } from '../utils/formatPrice';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleImageClick = (e) => {
    if (e.target.closest('.slider-arrow') || 
        e.target.closest('.slider-dot')) {
      return;
    }
    
    navigate(`/product/${product.id}`, { state: { from: `${location.pathname}${location.search}` } });
  };

  const displayImages = Array.from(new Set((product.images && product.images.length ? product.images : [product.image]).map(img => (img || '').replace(/^\/\/?images\//i, '/Images/'))));

  return (
    <div className="product-card">
      <div className="product-image-container" onClick={handleImageClick}>
        <div className="product-image">
          <PhotoSlider images={displayImages} productName={product.name} compact={true} />
        </div>
      </div>
      <div className="product-info">
        <Link to={`/product/${product.id}`} state={{ from: `${location.pathname}${location.search}` }} className="product-name-link">
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
