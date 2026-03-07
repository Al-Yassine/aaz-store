import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/formatPrice';
import { createOrder } from '../services/orderService';
import './Checkout.css';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { items: cartItems, clearCart } = useCart();
  const { currentUser } = useAuth();
  
  const checkoutItems = location.state?.items || cartItems || [];
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
  const [loading, setLoading] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [checkoutMode, setCheckoutMode] = useState(currentUser ? 'account' : 'guest');
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  const isNiameyRegion = formData.region === 'Niamey';
  const isPickupOrder = paymentMethod === 'pickup';

  // Delivery fees apply only for home delivery orders.
  const deliveryFee = !isPickupOrder && formData.region ? (isNiameyRegion ? 1000 : 2000) : 0;
  const deliveryTimeText = isPickupOrder
    ? 'Retrait en magasin'
    : (formData.region ? (isNiameyRegion ? '1 jour' : '2 jours') : null);

  const subtotal = checkoutItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal + deliveryFee;

  const confirmationItems = confirmedOrder?.items || checkoutItems;
  const confirmationSubtotal = confirmedOrder?.subtotal ?? subtotal;
  const confirmationDeliveryFee = confirmedOrder?.deliveryFee ?? deliveryFee;
  const confirmationTotal = confirmedOrder?.total ?? total;
  const confirmationIsPickup = confirmedOrder?.isPickupOrder ?? isPickupOrder;
  const confirmationRegion = confirmedOrder?.deliveryRegion || formData.region;
  const canTrackCreatedOrder = Boolean(currentUser && orderNumber);

  useEffect(() => {
    if (formData.region && !isNiameyRegion && paymentMethod === 'cod') {
      setPaymentMethod('nita');
    }
  }, [formData.region, isNiameyRegion, paymentMethod]);

  useEffect(() => {
    if (currentUser) {
      setCheckoutMode('account');
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || currentUser.displayName || ''
      }));
    }
  }, [currentUser]);

  if (!orderConfirmed && (!checkoutItems || checkoutItems.length === 0)) {
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
    if (submitError) {
      setSubmitError('');
    }
  };

  const handlePaymentMethodChange = (value) => {
    setPaymentMethod(value);

    if (errors.paymentMethod) {
      setErrors(prev => ({ ...prev, paymentMethod: '' }));
    }

    if (submitError) {
      setSubmitError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Le nom complet est requis';
    }
    
    if (!isPickupOrder) {
      if (!formData.region) {
        newErrors.region = 'La région est requise';
      }

      if (!formData.quartier.trim()) {
        newErrors.quartier = 'Le quartier est requis';
      }

      if (!formData.address.trim()) {
        newErrors.address = 'L\'adresse complète est requise';
      }
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Le numéro de téléphone est requis';
    } else if (!/^\+?[0-9\s-]{8,}$/.test(formData.phone)) {
      newErrors.phone = 'Numéro de téléphone invalide';
    }

    if (!isPickupOrder && !isNiameyRegion && paymentMethod === 'cod') {
      newErrors.paymentMethod = 'Paiement à la livraison disponible uniquement à Niamey. Veuillez sélectionner le paiement via NITA ou Amana.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    setSubmitError('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // Prepare order data with safe defaults to prevent undefined values in Firestore
    const orderData = {
      userId: currentUser?.uid || null,
      isGuest: !currentUser,
      checkoutMode: currentUser ? 'account' : checkoutMode,
      customerEmail: currentUser?.email || "",
      products: (checkoutItems || []).map(item => ({
        id: item?.id || "",
        name: item?.name || "",
        price: item?.price || 0,
        quantity: item?.quantity || 1,
        selectedSize: item?.selectedSize || "",
        selectedColor: item?.selectedColor || "",
        image: item?.image || item?.images?.[0] || ""
      })),
      totalPrice: total || 0,
      subtotal: subtotal || 0,
      deliveryFee: deliveryFee || 0,
      paymentMethod: paymentMethod || "cod",
      deliveryRegion: isPickupOrder ? 'Retrait en magasin' : (formData?.region || ""),
      deliveryInfo: {
        fullName: formData?.fullName || "",
        phone: formData?.phone || "",
        quartier: isPickupOrder ? '' : (formData?.quartier || ""),
        address: isPickupOrder ? '' : (formData?.address || "")
      }
    };

    // Create order in Firestore
    const result = await createOrder(orderData);
    
    setLoading(false);

    if (result.success) {
      setConfirmedOrder({
        items: checkoutItems.map(item => ({
          id: item?.id || '',
          cartItemId: item?.cartItemId || '',
          name: item?.name || 'Article',
          quantity: item?.quantity || 1,
          price: item?.price || 0,
          selectedSize: item?.selectedSize || '',
          selectedColor: item?.selectedColor || ''
        })),
        subtotal,
        deliveryFee,
        total,
        isPickupOrder,
        deliveryRegion: isPickupOrder ? 'Retrait en magasin' : (formData?.region || '')
      });

      setOrderNumber(result.orderNumber || (result.orderId ? result.orderId.slice(-8).toUpperCase() : ''));
      setOrderConfirmed(true);
      
      if (!fromBuyNow) {
        clearCart();
      }
    } else {
      setSubmitError(result.error || 'Erreur lors de la creation de la commande');
    }
  };

  if (orderConfirmed) {
    return (
      <div className="checkout-page page">
        <div className="container">
          <div className="order-confirmation">
            {paymentMethod === 'pickup' ? (
              <>
                <div className="confirmation-icon success">✅</div>
                <h2>Reservation confirmee !</h2>
                <p className="confirmation-message">
                  Votre reference <strong>{orderNumber || 'N/A'}</strong> est enregistree. Vous pouvez recuperer votre commande directement en magasin.
                </p>
              </>
            ) : paymentMethod === 'cod' ? (
              <>
                <div className="confirmation-icon success">✅</div>
                <h2>Commande confirmée !</h2>
                <p className="confirmation-message">
                  Votre reference <strong>{orderNumber || 'N/A'}</strong> a ete confirmee. Vous paierez a la livraison.
                </p>
              </>
            ) : (
              <>
                <div className="confirmation-icon pending">⏳</div>
                <h2>Commande en attente</h2>
                <p className="confirmation-message">
                  Votre reference <strong>{orderNumber || 'N/A'}</strong> est en attente de paiement. Elle sera confirmee des reception du transfert.
                </p>
              </>
            )}
            
            <div className="order-summary-box">
              <h3>Récapitulatif de votre commande</h3>
              <div className="summary-row">
                <span>Reference de commande:</span>
                <span>{orderNumber || 'N/A'}</span>
              </div>
              <div className="summary-row">
                <span>Sous-total:</span>
                <span>{formatPrice(confirmationSubtotal)}</span>
              </div>
              <div className="summary-row">
                <span>{confirmationIsPickup ? 'Retrait en magasin:' : `Livraison (${confirmationRegion || 'A definir'}):`}</span>
                <span>{formatPrice(confirmationDeliveryFee)}</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>{formatPrice(confirmationTotal)}</span>
              </div>
            </div>

            <div className="confirmation-items-box">
              <h3>Articles commandés</h3>
              <div className="confirmation-items-list">
                {confirmationItems.map((item, index) => (
                  <div
                    key={item.cartItemId || item.id || `${item.name}-${index}`}
                    className="confirmation-item-row"
                  >
                    <div className="confirmation-item-main">
                      <span className="confirmation-item-name">{item.name}</span>
                      <span className="confirmation-item-meta">
                        Qté: {item.quantity}
                        {item.selectedSize ? ` • Taille: ${item.selectedSize}` : ''}
                        {item.price ? ` • ${formatPrice(item.price)} / unité` : ''}
                      </span>
                    </div>
                    <span className="confirmation-item-total">
                      {formatPrice((item.price || 0) * (item.quantity || 1))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="confirmation-actions">
              {canTrackCreatedOrder && (
                <button
                  className="secondary-btn"
                  onClick={() => navigate(`/order-tracking?orderRef=${encodeURIComponent(orderNumber)}`)}
                >
                  Suivre cette commande
                </button>
              )}
              <button className="primary-btn" onClick={() => navigate('/products')}>
                Continuer vos achats
              </button>
            </div>
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
            {!currentUser && (
              <div className="checkout-account-choice">
                <h2 className="choice-title">Comment souhaitez-vous continuer ?</h2>
                <p className="choice-subtitle">
                  Vous pouvez commander sans compte, ou vous connecter pour retrouver vos commandes plus facilement.
                </p>
                <div className="choice-actions">
                  <button
                    type="button"
                    className={`choice-btn ${checkoutMode === 'guest' ? 'active' : ''}`}
                    onClick={() => setCheckoutMode('guest')}
                  >
                    Continuer en tant qu'invité
                  </button>
                  <button
                    type="button"
                    className="choice-btn secondary"
                    onClick={() => navigate('/signin', { state: { from: 'checkout' } })}
                  >
                    Se connecter / Creer un compte
                  </button>
                </div>
              </div>
            )}

            {currentUser && (
              <div className="checkout-authenticated-notice">
                <strong>Compte connecte :</strong> {currentUser.email}
              </div>
            )}

            <h2 className="section-title">
              {isPickupOrder ? 'Informations de reservation' : 'Informations de livraison'}
            </h2>
            
            <form onSubmit={handleConfirmOrder} className="checkout-form" noValidate>
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

              {!isPickupOrder && (
                <>
                  <div className="form-group">
                    <label htmlFor="region">Region *</label>
                    <select
                      id="region"
                      name="region"
                      value={formData.region}
                      onChange={handleInputChange}
                      className={errors.region ? 'error' : ''}
                    >
                      <option value="">-- Selectionnez une region --</option>
                      <option value="Agadez">Agadez</option>
                      <option value="Diffa">Diffa</option>
                      <option value="Dosso">Dosso</option>
                      <option value="Maradi">Maradi</option>
                      <option value="Niamey">Niamey</option>
                      <option value="Tahoua">Tahoua</option>
                      <option value="Tillaberi">Tillaberi</option>
                      <option value="Zinder">Zinder</option>
                    </select>
                    {errors.region && <span className="error-message">{errors.region}</span>}
                    {formData.region && (
                      <div className="delivery-info">
                        <span className="delivery-time">
                          Livraison estimee : <strong>{deliveryTimeText}</strong>
                        </span>
                        <span className="delivery-fee">
                          Frais de livraison : <strong>{formatPrice(deliveryFee)}</strong>
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
                    <label htmlFor="address">Adresse complete *</label>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={errors.address ? 'error' : ''}
                      placeholder="Entrez votre adresse complete"
                      rows="3"
                    />
                    {errors.address && <span className="error-message">{errors.address}</span>}
                  </div>
                </>
              )}

              {isPickupOrder && (
                <div className="delivery-info">
                  <span className="delivery-time">
                    Retrait en magasin : <strong>Reservation sans frais de livraison</strong>
                  </span>
                </div>
              )}

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
                
                {!isPickupOrder && !isNiameyRegion && formData.region && (
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
                          handlePaymentMethodChange(e.target.value);
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
                      onChange={(e) => handlePaymentMethodChange(e.target.value)}
                    />
                    <div className="payment-option-content">
                      <span className="payment-title">Paiement via NITA / Amana</span>
                      <span className="payment-description">
                        Veuillez effectuer le transfert au numéro suivant : <strong>+227 89 60 94 97</strong>. 
                        Votre commande sera confirmée après réception du paiement.
                      </span>
                    </div>
                  </label>

                  <label className={`payment-option ${paymentMethod === 'pickup' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="pickup"
                      checked={paymentMethod === 'pickup'}
                      onChange={(e) => handlePaymentMethodChange(e.target.value)}
                    />
                    <div className="payment-option-content">
                      <span className="payment-title">Reservation et retrait en magasin</span>
                      <span className="payment-description">
                        Reservez vos articles maintenant et venez les recuperer en boutique. Aucun frais de livraison.
                      </span>
                    </div>
                  </label>
                </div>
                {errors.paymentMethod && (
                  <span className="error-message">{errors.paymentMethod}</span>
                )}
              </div>

              {submitError && (
                <div className="checkout-submit-error" role="alert">
                  {submitError}
                </div>
              )}

              <button 
                type="submit" 
                className="confirm-btn"
                disabled={loading || (!isPickupOrder && !formData.region)}
              >
                {loading ? 'Traitement en cours...' : 'Confirmer ma commande'}
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
                    loading="lazy"
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

              {/* Delivery row: show fee/time only if region selected, otherwise prompt to define */}
              {isPickupOrder ? (
                <div className="total-row">
                  <div className="delivery-details">
                    <span>Retrait en magasin</span>
                    <span className="delivery-time-badge">Sans frais de livraison</span>
                  </div>
                  <span>{formatPrice(0)}</span>
                </div>
              ) : !formData.region ? (
                <div className="total-row">
                  <div className="delivery-details">
                    <span>Livraison (À définir)</span>
                  </div>
                  <span>—</span>
                </div>
              ) : (
                <div className="total-row">
                  <div className="delivery-details">
                    <span>Livraison ({formData.region})</span>
                    {deliveryTimeText && <span className="delivery-time-badge">⏱️ {deliveryTimeText}</span>}
                  </div>
                  <span>{formatPrice(deliveryFee)}</span>
                </div>
              )}

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
