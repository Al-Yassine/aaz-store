import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { products } from '../data/products';
import PhotoSlider from '../components/PhotoSlider';
import ProductCard from '../components/ProductCard';
import ProductReviews from '../components/ProductReviews';
import { formatPrice, hasDiscount } from '../utils/formatPrice';
import { getSizesByCategory, getDefaultSize } from '../utils/getSizesByCategory';
import { useCart } from '../context/CartContext';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const productId = parseInt(id, 10);
  const product = products.find(p => p.id === productId);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Get sizes based on product category
  const availableSizes = product ? getSizesByCategory(product.category) : [];
  const defaultSize = product ? getDefaultSize(product.category) : 'M';

  const [selectedSize, setSelectedSize] = useState(defaultSize);
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || product?.image);

  if (!product) {
    return (
      <div className="product-detail page">
        <div className="container">
          <p>Produit non trouvé. <Link to="/products">Retour aux produits</Link></p>
        </div>
      </div>
    );
  }

  const similar = products.filter(p => p.category === product.category && p.id !== product.id).slice(0,4);

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Veuillez sélectionner une taille');
      return;
    }
    
    addToCart({
      ...product,
      selectedSize,
      selectedColor,
      cartItemId: `${product.id}-${selectedSize}-${selectedColor}`
    });
    
    alert(`${product.name} (Taille: ${selectedSize}) ajouté au panier!`);
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      alert('Veuillez sélectionner une taille');
      return;
    }
    
    const checkoutItem = {
      ...product,
      selectedSize,
      selectedColor,
      quantity: 1,
      cartItemId: `${product.id}-${selectedSize}-${selectedColor}`
    };
    
    navigate('/checkout', { state: { items: [checkoutItem], fromBuyNow: true } });
  };

  const displayImages = (product.images || [product.image]).map(img => img.replace(/^\/\/?images\//i, '/Images/'));

  return (
    <div className="product-detail page">
      <div className="container">
        <div className="detail-grid">
          <div className="detail-media">
            <PhotoSlider images={displayImages} productName={product.name} compact={false} />
          </div>

          <div className="detail-info">
            <h1 className="detail-title">{product.name}</h1>

          <div className="detail-price-container">
            {hasDiscount(product) && (
              <p className="detail-price-old">{formatPrice(product.originalPrice)}</p>
            )}
            <p className="detail-price">{formatPrice(product.price)}</p>
          </div>

          <div className="detail-options">
            <div className="option-group">
              <label>Taille</label>
              <div className="options size-options">
                {availableSizes.map(size => (
                  <button 
                    key={size} 
                    className={`option-btn size-btn ${selectedSize === size ? 'active' : ''}`} 
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="option-group">
              <label>Color</label>
              <div className="options colors">
                {(product.colors || []).length > 0 ? (
                  product.colors.map(color => (
                    <button key={color} className={`color-swatch ${selectedColor===color? 'active':''}`} style={{background: color}} onClick={() => setSelectedColor(color)} aria-label={`Select color ${color}`} />
                  ))
                ) : (
                  <p className="muted">No color variants</p>
                )}
              </div>
            </div>
          </div>

          <div className="detail-actions">
            <button className="primary-btn" onClick={handleAddToCart}>
              Ajouter au Panier
            </button>
            <button className="buy-now-btn" onClick={handleBuyNow}>
              Acheter maintenant
            </button>
          </div>
        </div>
        </div>

        {/* Product Description */}
        {product.description && (
          <div className="product-description-section">
            <h3 className="section-title">Description</h3>
            <p className="detail-description">{product.description}</p>
          </div>
        )}

        {/* Customer Reviews */}
        <ProductReviews productId={product.id} />

        <div className="similar-section">
          <h3>Similar products</h3>
          <div className="similar-grid">
            {similar.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
