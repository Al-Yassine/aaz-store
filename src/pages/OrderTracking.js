import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserOrders, ORDER_STATUS, timestampToDate } from '../services/orderService';
import { formatPrice } from '../utils/formatPrice';
import './OrderTracking.css';

const TRACKING_STEPS = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.CONFIRMED,
  ORDER_STATUS.SHIPPED,
  ORDER_STATUS.DELIVERED
];

const normalizeOrderReference = (value = '') => {
  return value.toString().trim().toUpperCase().replace(/\s+/g, '');
};

const getOrderReference = (order = {}) => {
  const idValue = (order.id || '').toString().trim();
  if (idValue) {
    return idValue.slice(-8).toUpperCase();
  }

  const legacyOrderNumber = (order.orderNumber || '').toString().trim().toUpperCase();
  return legacyOrderNumber;
};

const getStatusLabel = (status) => {
  const labels = {
    [ORDER_STATUS.PENDING]: 'En attente',
    [ORDER_STATUS.CONFIRMED]: 'Confirmee',
    [ORDER_STATUS.SHIPPED]: 'Expediee',
    [ORDER_STATUS.DELIVERED]: 'Livree',
    [ORDER_STATUS.CANCELLED]: 'Annulee'
  };

  return labels[status] || 'Inconnu';
};

const getStatusDescription = (status) => {
  const descriptions = {
    [ORDER_STATUS.PENDING]: 'Nous avons bien recu votre commande. Verification en cours.',
    [ORDER_STATUS.CONFIRMED]: 'Votre commande est confirmee et en preparation.',
    [ORDER_STATUS.SHIPPED]: 'Votre commande est en route vers vous.',
    [ORDER_STATUS.DELIVERED]: 'Commande livree. Merci pour votre confiance !',
    [ORDER_STATUS.CANCELLED]: 'Cette commande a ete annulee. Contactez-nous pour assistance.'
  };

  return descriptions[status] || 'Statut de commande indisponible.';
};

const getPaymentMethodLabel = (method) => {
  if (method === 'cod') return 'Paiement a la livraison';
  if (method === 'pickup') return 'Reservation / Retrait magasin';
  return 'Paiement via NITA / Amana';
};

const formatDate = (timestamp) => {
  const date = timestampToDate(timestamp);
  if (!date) return 'N/A';

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const OrderTracking = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [pageError, setPageError] = useState('');
  const [searchError, setSearchError] = useState('');

  const initialOrderReference = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const fromState = location.state?.orderRef || location.state?.orderNumber || '';
    const fromQuery = params.get('orderRef') || params.get('orderNumber') || '';
    return normalizeOrderReference(fromState || fromQuery);
  }, [location.search, location.state]);

  const [searchInput, setSearchInput] = useState(initialOrderReference);
  const [submittedOrderReference, setSubmittedOrderReference] = useState(initialOrderReference);

  useEffect(() => {
    setSearchInput(initialOrderReference);
    setSubmittedOrderReference(initialOrderReference);
    setSearchError('');
  }, [initialOrderReference]);

  useEffect(() => {
    if (authLoading || !currentUser) {
      return;
    }

    const fetchOrders = async () => {
      setLoadingOrders(true);
      setPageError('');

      const result = await getUserOrders(currentUser.uid);

      if (result.success) {
        setOrders(result.data || []);
      } else {
        setPageError(result.error || 'Impossible de charger vos commandes actuellement.');
      }

      setLoadingOrders(false);
    };

    fetchOrders();
  }, [authLoading, currentUser]);

  const trackedOrder = useMemo(() => {
    if (!submittedOrderReference) {
      return null;
    }

    return orders.find((order) => getOrderReference(order) === submittedOrderReference) || null;
  }, [orders, submittedOrderReference]);

  const recentTrackableOrders = useMemo(() => {
    return orders.filter((order) => !!getOrderReference(order)).slice(0, 6);
  }, [orders]);

  const showNotFound =
    Boolean(submittedOrderReference) &&
    !loadingOrders &&
    !trackedOrder;

  const trackOrderReference = (value) => {
    const normalized = normalizeOrderReference(value);
    setSearchInput(normalized);

    if (!normalized) {
      setSubmittedOrderReference('');
      setSearchError('Veuillez saisir une reference de commande.');
      navigate('/order-tracking', { replace: true });
      return;
    }

    setSearchError('');
    setSubmittedOrderReference(normalized);
    navigate(`/order-tracking?orderRef=${encodeURIComponent(normalized)}`, { replace: true });
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    trackOrderReference(searchInput);
  };

  const handleQuickTrack = (orderReference) => {
    trackOrderReference(orderReference);
  };

  if (authLoading) {
    return (
      <div className="order-tracking-page page">
        <div className="container">
          <div className="tracking-card tracking-loading-card">
            <div className="tracking-spinner" aria-hidden="true"></div>
            <p>Chargement de votre espace de suivi...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="order-tracking-page page">
        <div className="container">
          <div className="tracking-card tracking-login-card">
            <h1>Suivi de commande</h1>
            <p>
              Le suivi est disponible pour les clients connectes. Connectez-vous pour consulter l'etat
              de vos commandes en temps reel.
            </p>
            <div className="tracking-login-actions">
              <Link to="/signin" className="tracking-primary-btn">
                Se connecter
              </Link>
              <Link to="/contact" className="tracking-secondary-link">
                Contacter le support
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentStatusIndex = TRACKING_STEPS.indexOf(trackedOrder?.status || '');
  const isCancelled = trackedOrder?.status === ORDER_STATUS.CANCELLED;

  return (
    <div className="order-tracking-page page">
      <div className="container">
        <header className="tracking-header">
          <h1>Suivi de commande</h1>
          <p>Recherchez votre commande avec sa reference (ex: AB12CD34).</p>
        </header>

        <section className="tracking-card tracking-search-card">
          <form className="tracking-search-form" onSubmit={handleSearchSubmit} noValidate>
            <label htmlFor="tracking-order-number" className="tracking-search-label">
              Reference de commande
            </label>
            <div className="tracking-search-row">
              <input
                id="tracking-order-number"
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="AB12CD34"
                className={searchError ? 'tracking-search-input input-error' : 'tracking-search-input'}
                aria-invalid={!!searchError}
              />
              <button type="submit" className="tracking-primary-btn tracking-search-btn">
                Suivre
              </button>
            </div>
            {searchError && <p className="tracking-inline-error">{searchError}</p>}
          </form>

          {pageError && <p className="tracking-inline-error">{pageError}</p>}

          {loadingOrders && (
            <div className="tracking-loading-inline" aria-live="polite">
              <div className="tracking-spinner" aria-hidden="true"></div>
              <span>Chargement de vos commandes...</span>
            </div>
          )}
        </section>

        {trackedOrder && (
          <section className="tracking-card tracking-result-card" aria-live="polite">
            <div className="tracking-result-top">
              <div>
                <h2>{getOrderReference(trackedOrder) || 'N/A'}</h2>
                <p>Commande passee le {formatDate(trackedOrder.createdAt)}</p>
              </div>
              <span className={`tracking-status-badge tracking-status-${trackedOrder.status}`}>
                {getStatusLabel(trackedOrder.status)}
              </span>
            </div>

            <p className="tracking-status-description">{getStatusDescription(trackedOrder.status)}</p>

            <div className={`tracking-progress ${isCancelled ? 'is-cancelled' : ''}`}>
              {TRACKING_STEPS.map((step) => {
                const stepIndex = TRACKING_STEPS.indexOf(step);
                const stepClass = isCancelled
                  ? 'upcoming'
                  : stepIndex < currentStatusIndex
                    ? 'done'
                    : stepIndex === currentStatusIndex
                      ? 'active'
                      : 'upcoming';

                return (
                  <div key={step} className={`tracking-step ${stepClass}`}>
                    <span className="tracking-step-dot" aria-hidden="true"></span>
                    <span className="tracking-step-label">{getStatusLabel(step)}</span>
                  </div>
                );
              })}
            </div>

            {isCancelled && (
              <p className="tracking-cancelled-note">
                Cette commande est annulee. Si besoin, notre equipe peut vous accompagner.
              </p>
            )}

            <div className="tracking-meta-grid">
              <div className="tracking-meta-item">
                <span className="tracking-meta-label">Derniere mise a jour</span>
                <span className="tracking-meta-value">{formatDate(trackedOrder.updatedAt)}</span>
              </div>
              <div className="tracking-meta-item">
                <span className="tracking-meta-label">Paiement</span>
                <span className="tracking-meta-value">{getPaymentMethodLabel(trackedOrder.paymentMethod)}</span>
              </div>
              <div className="tracking-meta-item">
                <span className="tracking-meta-label">Region / Retrait</span>
                <span className="tracking-meta-value">{trackedOrder.deliveryRegion || 'N/A'}</span>
              </div>
              <div className="tracking-meta-item">
                <span className="tracking-meta-label">Montant total</span>
                <span className="tracking-meta-value">{formatPrice(trackedOrder.totalPrice || 0)}</span>
              </div>
            </div>

            <div className="tracking-items-card">
              <h3>Articles de la commande</h3>
              <div className="tracking-items-list">
                {(trackedOrder.products || []).map((product, index) => (
                  <div className="tracking-item-row" key={`${product.id || product.name || 'item'}-${index}`}>
                    <div className="tracking-item-main">
                      <span className="tracking-item-name">{product.name || 'Article'}</span>
                      <span className="tracking-item-meta">
                        Qte: {product.quantity || 1}
                        {product.selectedSize ? ` - Taille ${product.selectedSize}` : ''}
                        {product.selectedColor ? ` - Couleur ${product.selectedColor}` : ''}
                      </span>
                    </div>
                    <span className="tracking-item-price">{formatPrice((product.price || 0) * (product.quantity || 1))}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {showNotFound && (
          <section className="tracking-card tracking-not-found" aria-live="polite">
            <h3>Commande introuvable</h3>
            <p>
              Aucune commande correspondant a <strong>{submittedOrderReference}</strong> n'a ete trouvee
              sur votre compte.
            </p>
          </section>
        )}

        <section className="tracking-card tracking-recent-card">
          <h3>Vos commandes recentes</h3>
          {recentTrackableOrders.length === 0 ? (
            <p className="tracking-empty-state">Aucune commande recente avec numero de suivi disponible.</p>
          ) : (
            <div className="tracking-recent-list">
              {recentTrackableOrders.map((order) => (
                <div className="tracking-recent-row" key={order.id}>
                  <div className="tracking-recent-main">
                    <span className="tracking-recent-number">{getOrderReference(order) || 'N/A'}</span>
                    <span className="tracking-recent-date">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="tracking-recent-side">
                    <span className={`tracking-status-badge tracking-status-${order.status}`}>
                      {getStatusLabel(order.status)}
                    </span>
                    <button
                      type="button"
                      className="tracking-secondary-btn"
                      onClick={() => handleQuickTrack(getOrderReference(order))}
                    >
                      Suivre
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default OrderTracking;
