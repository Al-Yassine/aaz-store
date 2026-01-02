import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';
import { formatPrice } from '../utils/formatPrice';
import './Cart.css';

const Cart = () => {
  const { items, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate('/checkout', { state: { items, fromBuyNow: false } });
  };

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>Votre panier est vide</h2>
            <p>Il semble que vous n'ayez pas encore ajouté d'articles à votre panier.</p>
            <a href="/products" className="btn btn-primary">
              Commencer les Achats
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Panier d'Achat</h1>
          <p className="page-subtitle">
            Vérifiez vos articles avant de finaliser votre commande
          </p>
        </div>

        <div className="cart-content">
          <div className="cart-items">
            {items.map(item => (
              <CartItem key={item.cartItemId || item.id} item={item} />
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-card">
              <h3>Résumé de la Commande</h3>
              
              <div className="summary-row">
                <span>Articles ({items.length})</span>
                <span>{formatPrice(getTotalPrice())}</span>
              </div>
              
              <div className="summary-row">
                <span>Sous-total</span>
                <span>{formatPrice(getTotalPrice())}</span>
              </div>
              
              <div className="summary-divider"></div>
              
              <div className="summary-row total">
                <span>Total</span>
                <span>{formatPrice(getTotalPrice())}</span>
              </div>
              
              <p className="shipping-note">Les frais de livraison seront calculés à la caisse</p>

              <button 
                className="checkout-btn"
                onClick={handleCheckout}
              >
                Finaliser la Commande
              </button>

              <button 
                className="clear-cart-btn"
                onClick={clearCart}
              >
                Vider le Panier
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
