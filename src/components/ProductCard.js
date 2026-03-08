import React, { useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import PhotoSlider from './PhotoSlider';
import ImageViewer from './ImageViewer';
import { formatPrice, hasDiscount } from '../utils/formatPrice';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imagePointerStateRef = useRef({
    startX: null,
    startY: null,
    hasMoved: false
  });

  const resetImagePointerState = () => {
    imagePointerStateRef.current.startX = null;
    imagePointerStateRef.current.startY = null;
    imagePointerStateRef.current.hasMoved = false;
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleImageClick = (e) => {
    if (e.target.closest('.slider-arrow') || 
        e.target.closest('.slider-dot')) {
      resetImagePointerState();
      return;
    }

    if (imagePointerStateRef.current.hasMoved) {
      resetImagePointerState();
      return;
    }

    resetImagePointerState();
    
    navigate(`/product/${product.id}`, { state: { from: `${location.pathname}${location.search}` } });
  };

  const handleImagePointerDown = (e) => {
    if (typeof e.button === 'number' && e.button !== 0) {
      return;
    }

    imagePointerStateRef.current.startX = e.clientX;
    imagePointerStateRef.current.startY = e.clientY;
    imagePointerStateRef.current.hasMoved = false;
  };

  const handleImagePointerMove = (e) => {
    if (
      imagePointerStateRef.current.startX === null ||
      imagePointerStateRef.current.startY === null
    ) {
      return;
    }

    const deltaX = Math.abs(e.clientX - imagePointerStateRef.current.startX);
    const deltaY = Math.abs(e.clientY - imagePointerStateRef.current.startY);

    if (deltaX > 8 || deltaY > 8) {
      imagePointerStateRef.current.hasMoved = true;
    }
  };

  const handleImagePointerCancel = () => {
    resetImagePointerState();
  };

  const handleImageFullscreen = (index) => {
    setCurrentImageIndex(index);
    setIsImageViewerOpen(true);
  };

  // Check if product is out of stock
  const isOutOfStock = product.customStatus === 'Out Of Stock' || 
    (product.variants && product.variants.every(v => v.stock === 0));

  // Determine which badge to show
  const getBadge = () => {
    if (isOutOfStock) {
      return { text: 'Rupture de stock', type: 'out-of-stock' };
    }
    if (product.isNew) {
      return { text: 'Nouveau', type: 'new' };
    }
    if (product.isBestSeller) {
      return { text: 'Best-seller', type: 'best-seller' };
    }
    return null;
  };

  const badge = getBadge();

  const displayImages = Array.from(new Set((product.images && product.images.length ? product.images : [product.image]).map(img => (img || '').replace(/^\/\/?images\//i, '/Images/'))));

  return (
    <div className="product-card">
      {badge && (
        <span className={`product-badge product-badge-${badge.type}`}>
          {badge.text}
        </span>
      )}
      <div
        className="product-image-container"
        onClick={handleImageClick}
        onPointerDown={handleImagePointerDown}
        onPointerMove={handleImagePointerMove}
        onPointerCancel={handleImagePointerCancel}
      >
        <div className="product-image">
          <PhotoSlider 
            images={displayImages} 
            productName={product.name} 
            compact={true}
            onImageClick={handleImageFullscreen}
          />
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
          disabled={isOutOfStock}
        >
          {isOutOfStock ? 'Épuisé' : 'Ajouter au Panier'}
        </button>
      </div>

      {isImageViewerOpen && (
        <ImageViewer
          images={displayImages}
          currentIndex={currentImageIndex}
          onClose={() => setIsImageViewerOpen(false)}
          onNavigate={(index) => setCurrentImageIndex(index)}
        />
      )}
    </div>
  );
};

export default ProductCard;
