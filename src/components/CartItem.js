import React from 'react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';
import './CartItem.css';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const itemId = item.cartItemId || item.id;

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  return (
    <div className="cart-item">
      <div className="cart-item-image">
        <img src={item.image} alt={item.name} />
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
