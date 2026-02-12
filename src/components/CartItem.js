import React from 'react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../utils/formatPrice';
import './CartItem.css';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const itemId = item.cartItemId || item.id;

  // compute available stock for this cart item (based on selectedSize if present)
  const variants = item.variants || [];
  const availableStockForSize = item.selectedSize ? variants.reduce((sum, v) => (
    (v.sizes || []).includes(item.selectedSize) ? sum + (v.stock || 0) : sum
  ), 0) : variants.reduce((sum, v) => sum + (v.stock || 0), 0);

  const isAtMax = availableStockForSize ? item.quantity >= availableStockForSize : false;

  const { showToast } = useToast();

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    if (availableStockForSize && newQuantity > availableStockForSize) {
      showToast('Quantité demandée supérieure au stock disponible pour cet article', 'warning');
      return;
    }

    updateQuantity(itemId, newQuantity);
  };

  return (
    <div className="cart-item">
      <div className="cart-item-image">
        <img src={item.image} alt={item.name} loading="lazy" />
      </div>
      
      <div className="cart-item-details">
        <h3 className="cart-item-name">{item.name}</h3>
        <p className="cart-item-category">{item.category}</p>
        {item.selectedSize && (
          <p className="cart-item-size">
            <strong>Taille:</strong> {item.selectedSize}
          </p>
        )}
        <p className="cart-item-price">{formatPrice(item.price)}</p>
      </div>
      
      <div className="cart-item-controls">
        <div className="quantity-controls">
          <button 
            className="quantity-btn"
            onClick={() => handleQuantityChange(item.quantity - 1)}
          >
            -
          </button>
          <span className="quantity">{item.quantity}</span>
          <button 
            className="quantity-btn"
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={isAtMax}
          >
            +
          </button>
        </div>
        
        <button 
          className="remove-btn"
          onClick={() => removeFromCart(itemId)}
        >
          Supprimer
        </button>
      </div>
      
      <div className="cart-item-total">
        <span className="item-total-price">
          {formatPrice(item.price * item.quantity)}
        </span>
      </div>
    </div>
  );
};

export default CartItem;
