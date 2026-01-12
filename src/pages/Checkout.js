import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';
import './Checkout.css';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { items: cartItems, clearCart } = useCart();
  
  const checkoutItems = location.state?.items || cartItems;
  const fromBuyNow = location.state?.fromBuyNow || false;

  const [formData, setFormData] = useState({
    fullName: '',
    region: '',
    quartier: '',
    address: '',
    phone: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [errors, setErrors] = useState({});

  const isNiameyRegion = formData.region === 'Niamey';

  const deliveryFee = isNiameyRegion ? 1000 : 2000;
  const deliveryTimeText = isNiameyRegion ? '1 jour' : '2 jours';

  const subtotal = checkoutItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal + deliveryFee;

  useEffect(() => {
    if (!isNiameyRegion && paymentMethod === 'cod') {
      setPaymentMethod('nita');
    }
  }, [formData.region, isNiameyRegion, paymentMethod]);

  if (!checkoutItems || checkoutItems.length === 0) {
    return (
      <div className="checkout-page page">
        <div className="container">
          <div className="empty-checkout">
            <h2>Panier vide</h2>
            <p>Vous n'avez aucun article à commander.</p>
            <button className="primary-btn" onClick={() => navigate('/products')}>
              Continuer vos achats
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Le nom complet est requis';
    }
    
    if (!formData.region) {
      newErrors.region = 'La région est requise';
    }
    
    if (!formData.quartier.trim()) {
      newErrors.quartier = 'Le quartier est requis';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'L\'adresse complète est requise';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Le numéro de téléphone est requis';
    } else if (!/^\+?[0-9\s-]{8,}$/.test(formData.phone)) {
      newErrors.phone = 'Numéro de téléphone invalide';
    }

    if (!isNiameyRegion && paymentMethod === 'cod') {
      newErrors.paymentMethod = 'Paiement à la livraison disponible uniquement à Niamey. Veuillez sélectionner le paiement via NITA ou Amana.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirmOrder = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setOrderConfirmed(true);
    
    if (!fromBuyNow) {
      setTimeout(() => {
        clearCart();
      }, 2000);
    }
  };

  if (orderConfirmed) {
    return (
      <div className="checkout-page page">
        <div className="container">
          <div className="order-confirmation">
            {paymentMethod === 'cod' ? (
              <>
                <div className="confirmation-icon success">✅</div>
                <h2>Commande confirmée !</h2>
                <p className="confirmation-message">
                  Votre commande a été confirmée. Vous paierez à la livraison.
                </p>
              </>
            ) : (
              <>
                <div className="confirmation-icon pending">⏳</div>
                <h2>Commande en attente</h2>
                <p className="confirmation-message">
                  Votre commande est en attente de paiement. Elle sera confirmée dès réception du transfert.
                </p>
              </>
            )}
            
            <div className="order-summary-box">
              <h3>Récapitulatif de votre commande</h3>
              <div className="summary-row">
                <span>Sous-total:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Livraison ({formData.region || 'À définir'}):</span>
                <span>{formatPrice(deliveryFee)}</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            
            <button className="primary-btn" onClick={() => navigate('/products')}>
              Continuer vos achats
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page page">
      <div className="container">
        <h1 className="checkout-title">Finaliser votre commande</h1>
        
        <div className="checkout-grid">
          {/* Customer Information Form */}
          <div className="checkout-form-section">
            <h2 className="section-title">Informations de livraison</h2>
            
            <form onSubmit={handleConfirmOrder} className="checkout-form">
              <div className="form-group">
                <label htmlFor="fullName">Nom complet *</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={errors.fullName ? 'error' : ''}
                  placeholder="Entrez votre nom complet"
                />
                {errors.fullName && <span className="error-message">{errors.fullName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="region">Région *</label>
                <select
                  id="region"
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  className={errors.region ? 'error' : ''}
                >
                  <option value="">-- Sélectionnez une région --</option>
                  <option value="Agadez">Agadez</option>
                  <option value="Diffa">Diffa</option>
                  <option value="Dosso">Dosso</option>
                  <option value="Maradi">Maradi</option>
                  <option value="Niamey">Niamey</option>
                  <option value="Tahoua">Tahoua</option>
                  <option value="Tillabéri">Tillabéri</option>
                  <option value="Zinder">Zinder</option>
                </select>
                {errors.region && <span className="error-message">{errors.region}</span>}
                {formData.region && (
                  <div className="delivery-info">
                    <span className="delivery-time">
                      ⏱️ Livraison estimée : <strong>{deliveryTimeText}</strong>
                    </span>
                    <span className="delivery-fee">
                      💰 Frais de livraison : <strong>{formatPrice(deliveryFee)}</strong>
                    </span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="quartier">Quartier *</label>
                <input
                  type="text"
                  id="quartier"
                  name="quartier"
                  value={formData.quartier}
                  onChange={handleInputChange}
                  className={errors.quartier ? 'error' : ''}
                  placeholder="Entrez votre quartier"
                />
                {errors.quartier && <span className="error-message">{errors.quartier}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="address">Adresse complète *</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={errors.address ? 'error' : ''}
                  placeholder="Entrez votre adresse complète"
                  rows="3"
                />
                {errors.address && <span className="error-message">{errors.address}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Numéro de téléphone *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={errors.phone ? 'error' : ''}
                  placeholder="+227 XX XX XX XX"
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>

              {/* Payment Method */}
              <div className="payment-section">
                <h3 className="section-subtitle">Mode de paiement</h3>
                
                {!isNiameyRegion && formData.region && (
                  <div className="payment-restriction-notice">
                    <span className="restriction-icon">⚠️</span>
                    <span className="restriction-text">
                      Paiement à la livraison disponible uniquement à Niamey. Pour les autres régions, veuillez utiliser le paiement via NITA ou Amana.
                    </span>
                  </div>
                )}
                
                <div className="payment-options">
                  <label 
                    className={`payment-option ${paymentMethod === 'cod' ? 'active' : ''} ${!isNiameyRegion ? 'disabled' : ''}`}
                    onClick={(e) => {
                      if (!isNiameyRegion) {
                        e.preventDefault();
                        return false;
                      }
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => {
                        if (isNiameyRegion) {
                          setPaymentMethod(e.target.value);
                        }
                      }}
                      disabled={!isNiameyRegion}
                    />
                    <div className="payment-option-content">
                      <span className="payment-title">
                        Paiement à la livraison
                        {!isNiameyRegion && <span className="unavailable-badge">Non disponible</span>}
                      </span>
                      <span className="payment-description">
                        Paiement en espèces à la livraison. {!isNiameyRegion && 'Disponible uniquement à Niamey.'}
                      </span>
                    </div>
                  </label>

                  <label className={`payment-option ${paymentMethod === 'nita' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="nita"
                      checked={paymentMethod === 'nita'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div className="payment-option-content">
                      <span className="payment-title">Paiement via NITA / Amana</span>
                      <span className="payment-description">
                        Veuillez effectuer le transfert au numéro suivant : <strong>+227 89 60 94 97</strong>. 
                        Votre commande sera confirmée après réception du paiement.
                      </span>
                    </div>
                  </label>
                </div>
                {errors.paymentMethod && (
                  <span className="error-message">{errors.paymentMethod}</span>
                )}
              </div>

              <button 
                type="submit" 
                className="confirm-btn"
                disabled={!formData.region}
              >
                Confirmer ma commande
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="order-summary-section">
            <h2 className="section-title">Récapitulatif</h2>
            
            <div className="order-items">
              {checkoutItems.map((item) => (
                <div key={item.cartItemId || item.id} className="order-item">
                  <img 
                    src={item.selectedColor || item.image || item.images?.[0]} 
                    alt={item.name}
                    className="order-item-image"
                  />
                  <div className="order-item-details">
                    <h4>{item.name}</h4>
                    <p className="item-meta">
                      Taille: {item.selectedSize} | Qté: {item.quantity}
                    </p>
                    <p className="item-price">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="order-totals">
              <div className="total-row">
                <span>Sous-total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="total-row">
                <div className="delivery-details">
                  <span>Livraison ({formData.region || 'À définir'})</span>
                  <span className="delivery-time-badge">⏱️ {deliveryTimeText}</span>
                </div>
                <span>{formatPrice(deliveryFee)}</span>
              </div>
              <div className="total-row total-final">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;