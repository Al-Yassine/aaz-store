import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { products } from '../data/products';
import PhotoSlider from '../components/PhotoSlider';
import ProductCard from '../components/ProductCard';
import ProductReviews from '../components/ProductReviews';
import { formatPrice, hasDiscount } from '../utils/formatPrice';
import ImageViewer from '../components/ImageViewer';
import SharePopup from '../components/SharePopup';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { getSizesByCategory } from '../utils/getSizesByCategory';
import sizeInventory from '../data/sizeInventory.json';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const productId = parseInt(id, 10);
  const product = products.find(p => p.id === productId);
  const navigate = useNavigate();
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSharePopupOpen, setIsSharePopupOpen] = useState(false);

  const variants = useMemo(() => product?.variants || [], [product?.variants]);

  const sizeStockMap = useMemo(() => {
    let map = {};
    if (sizeInventory && sizeInventory[productId]) {
      map = { ...sizeInventory[productId] };
    } else {
      variants.forEach(v => {
        if (v.size) {
          map[v.size] = (map[v.size] || 0) + (v.stock || 0);
        } else if (v.sizes) {
          if (Array.isArray(v.sizes)) {
            v.sizes.forEach(sz => {
              map[sz] = (map[sz] || 0) + (v.stock || 0);
            });
          } else {
            map[v.sizes] = (map[v.sizes] || 0) + (v.stock || 0);
          }
        }
      });
    }
    const fullSizes = getSizesByCategory(product?.category || '');
    fullSizes.forEach(sz => { if (!(sz in map)) map[sz] = 0; });
    return map;
  }, [productId, variants, product?.category]);

  const displayedSizes = useMemo(() => {
    const fullSizes = getSizesByCategory(product?.category || '');
    const variantSizes = Object.keys(sizeStockMap);
    const displayed = [];
    fullSizes.forEach(sz => { if (!displayed.includes(sz)) displayed.push(sz); });
    variantSizes.forEach(sz => { if (!displayed.includes(sz)) displayed.push(sz); });
    return displayed;
  }, [sizeStockMap, product?.category]);

  const colorSizeStock = useMemo(() => {
    const map = {};
    variants.forEach(v => {
      const c = v.color || null;
      if (!c) return;
      if (!map[c]) map[c] = {};
      if (v.size) {
        map[c][v.size] = (map[c][v.size] || 0) + (v.stock || 0);
      } else if (v.sizes) {
        if (Array.isArray(v.sizes)) {
          v.sizes.forEach(sz => {
            map[c][sz] = (map[c][sz] || 0) + (v.stock || 0);
          });
        } else {
          map[c][v.sizes] = (map[c][v.sizes] || 0) + (v.stock || 0);
        }
      }
    });
    return map;
  }, [variants]);

  const defaultSize = useMemo(() => 
    displayedSizes.find(sz => (sizeStockMap[sz] || 0) > 0) || null,
    [displayedSizes, sizeStockMap]
  );

  const { addToCart, items } = useCart();
  const { showToast } = useToast();
  const [selectedSize, setSelectedSize] = useState(defaultSize);
  const [quantity, setQuantity] = useState(1);

  const colorsFromProduct = useMemo(() => 
    Array.isArray(product?.colors) && product.colors.length > 0
      ? product.colors
      : Array.from(new Set(variants.map(v => v.color).filter(Boolean))),
    [product?.colors, variants]
  );
  const [selectedColor, setSelectedColor] = useState(colorsFromProduct[0] || null);
  const colors = colorsFromProduct;

  const getStockForSize = useCallback((size) => {
    if (selectedColor && colorSizeStock[selectedColor]) {
      return colorSizeStock[selectedColor][size] || 0;
    }
    return (sizeStockMap[size] || 0);
  }, [selectedColor, colorSizeStock, sizeStockMap]);

  // available stock for current selection
  const availableStockForSelection = selectedSize ? getStockForSize(selectedSize) : 0; 

  // Clamp quantity when size or color changes or when stock changes
  useEffect(() => {
    const available = selectedSize ? getStockForSize(selectedSize) : 0;
    // ensure at least 1 and no more than available stock
    setQuantity(q => {
      const minQ = 1;
      const newQ = Math.min(Math.max(q, minQ), Math.max(available, 1));
      return newQ;
    });
  }, [selectedSize, getStockForSize]);


  // When color changes we should ensure selected size is available for that color; keep it disabled if not
  const handleColorSelect = (color) => {
    setSelectedColor(color);
    const colorStocks = color && colorSizeStock[color] ? colorSizeStock[color] : null;
    const currentSizeStock = selectedSize ? (colorStocks ? (colorStocks[selectedSize] || 0) : (sizeStockMap[selectedSize] || 0)) : 0;
    if (!selectedSize || currentSizeStock <= 0) {
      // pick first size available for this color; prefer color-specific then global
      const newSize = displayedSizes.find(sz => (colorStocks ? (colorStocks[sz] || 0) > 0 : (sizeStockMap[sz] || 0) > 0)) || null;
      setSelectedSize(newSize);
    }
  };

  const isProductInStock = (product?.customStatus !== 'Out Of Stock') && Object.values(sizeStockMap).some(n => n > 0);

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
      showToast('Veuillez sélectionner une taille', 'warning');
      return;
    }

    if (!isProductInStock || !availableStockForSelection) {
      showToast("La taille sélectionnée n'est pas disponible pour le moment.", 'warning');
      return;
    }

    // determine available stock for this size (prefer color-specific via getStockForSize)
    const availableStock = availableStockForSelection;

    const cartItemId = `${product.id}-${selectedSize}-${selectedColor}`;
    const existing = items.find(it => (it.cartItemId || it.id) === cartItemId);
    const existingQty = existing ? existing.quantity : 0;

    if (existingQty + quantity > availableStock) {
      showToast("Vous ne pouvez pas ajouter autant d'articles (stock insuffisant)", 'error');
      return;
    }

    addToCart({
      ...product,
      selectedSize,
      selectedColor,
      cartItemId,
      quantity
    });

    showToast(`${product.name} (Taille: ${selectedSize}) x${quantity} ajouté au panier!`, 'success');
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      showToast('Veuillez sélectionner une taille', 'warning');
      return;
    }

    if (!isProductInStock || !availableStockForSelection) {
      showToast("La taille sélectionnée n'est pas disponible pour le moment.", 'warning');
      return;
    }

    const availableStock = availableStockForSelection;

    if (quantity > availableStock) {
      showToast('Quantité demandée supérieure au stock disponible', 'error');
      return;
    }
    
    const checkoutItem = {
      ...product,
      selectedSize,
      selectedColor,
      quantity,
      cartItemId: `${product.id}-${selectedSize}-${selectedColor}`
    };
    
    navigate('/checkout', { state: { items: [checkoutItem], fromBuyNow: true } });
  };

  const displayImages = (product.images || [product.image]).map(img => img.replace(/^\/\/?images\//i, '/Images/'));

  const handleImageClick = (index) => {
    setCurrentImageIndex(index);
    setIsImageViewerOpen(true);
  };

  const productUrl = `${window.location.origin}/product/${product.id}`;

  return (
    <div className="product-detail page">
      <div className="container">
        <div className="detail-grid">
          <div className="detail-media">
            <div className="product-image-wrapper">
              <PhotoSlider 
                images={displayImages} 
                productName={product.name} 
                compact={false}
                onImageClick={handleImageClick}
              />
              <button 
                className="share-icon-btn"
                onClick={() => setIsSharePopupOpen(true)}
                aria-label="Partager ce produit"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
              </button>
            </div>
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
                {displayedSizes && displayedSizes.length > 0 ? (
                  displayedSizes.map(size => (
                    <button 
                      key={size} 
                      className={`option-btn size-btn ${selectedSize === size ? 'active' : ''}`} 
                      onClick={() => getStockForSize(size) > 0 && setSelectedSize(size)}
                      disabled={!(getStockForSize(size) > 0)}
                      aria-disabled={!(getStockForSize(size) > 0)}
                      title={!(getStockForSize(size) > 0) ? 'Rupture de stock' : `Taille ${size}`}
                    >
                      <span className="size-label">{size}</span>
                    </button>
                  ))
                ) : (
                  <p className="muted">Aucune taille assignée pour ce produit</p>
                )}
              </div>
            </div>

            <div className="option-group">
              <label>Color</label>
              <div className="options colors">
                {(colors && colors.length > 0) ? (
                  colors.map(color => (
                    <button key={color} className={`color-swatch ${selectedColor===color? 'active':''}`} style={{background: color}} onClick={() => handleColorSelect(color)} aria-label={`Select color ${color}`} />
                  ))
                ) : (
                  <p className="muted">No color variants</p>
                )}
              </div>
            </div>
          </div>

          <div className="detail-actions">
            {!isProductInStock && (
              <p className="muted" style={{marginRight: '1rem'}}>Produit en rupture de stock</p>
            )}

            <div className="quantity-control" role="group" aria-label="Quantity selector">
              <button className="qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={!selectedSize || quantity <= 1} aria-label="Decrease quantity">−</button>
              <div className="qty-display" aria-live="polite">{quantity}</div>
              <button className="qty-btn" onClick={() => setQuantity(q => Math.min(availableStockForSelection || 1, q + 1))} disabled={!selectedSize || (availableStockForSelection <= quantity)} aria-label="Increase quantity">+</button>
            </div>

            <button className="primary-btn" onClick={handleAddToCart} disabled={!isProductInStock}>
              Ajouter au Panier
            </button>
            <button className="buy-now-btn" onClick={handleBuyNow} disabled={!isProductInStock}>
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

      {isImageViewerOpen && (
        <ImageViewer
          images={displayImages}
          currentIndex={currentImageIndex}
          onClose={() => setIsImageViewerOpen(false)}
          onNavigate={(index) => setCurrentImageIndex(index)}
        />
      )}

      {isSharePopupOpen && (
        <SharePopup
          productName={product.name}
          productUrl={productUrl}
          productImage={displayImages[0]}
          onClose={() => setIsSharePopupOpen(false)}
        />
      )}
    </div>
  );
};

export default ProductDetail;
