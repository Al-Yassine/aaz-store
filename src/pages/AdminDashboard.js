import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  getAllOrders, 
  updateOrderStatus, 
  deleteOrder,
  ORDER_STATUS,
  timestampToDate,
  getOrderStatistics
} from '../services/orderService';
import { logOut } from '../services/authService';
import { setUserAsAdmin } from '../services/userService';
import {
  CONTACT_MESSAGE_STATUS,
  getAllContactMessages,
  updateContactMessageStatus
} from '../services/contactService';
import {
  deleteProductReview,
  getAllProductReviews
} from '../services/reviewService';
import { products } from '../data/products';
import { formatPrice } from '../utils/formatPrice';
import './AdminDashboard.css';

const DEFAULT_STORE_ADMIN_WHATSAPP = '22789609497';

const sanitizePhoneForWhatsApp = (value) => (value || '').toString().replace(/\D/g, '');

const formatAmountForWhatsApp = (amount) => {
  return `${new Intl.NumberFormat('fr-FR').format(amount || 0)} CFA`;
};

const MESSAGES_PAGE_SIZE = 8;

const MESSAGE_STATUS_SORT_WEIGHT = {
  [CONTACT_MESSAGE_STATUS.NEW]: 0,
  [CONTACT_MESSAGE_STATUS.READ]: 1,
  [CONTACT_MESSAGE_STATUS.RESOLVED]: 2
};

const getOrderDisplayReference = (order = {}) => {
  const idValue = (order.id || '').toString().trim();
  if (idValue) {
    return idValue.slice(-8).toUpperCase();
  }

  const legacyOrderNumber = (order.orderNumber || '').toString().trim();
  return legacyOrderNumber || 'N/A';
};

const AdminDashboard = () => {
  const { currentUser, isAdmin, userData, loading: authLoading, refreshUserData } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewDeleteConfirmId, setReviewDeleteConfirmId] = useState('');
  const [deletingReviewId, setDeletingReviewId] = useState('');
  const [messages, setMessages] = useState([]);
  const [messageSort, setMessageSort] = useState('date_desc');
  const [messagePage, setMessagePage] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [pageError, setPageError] = useState('');
  const [pageSuccess, setPageSuccess] = useState('');

  const adminWhatsAppPhone = sanitizePhoneForWhatsApp(
    process.env.REACT_APP_ADMIN_WHATSAPP_NUMBER || DEFAULT_STORE_ADMIN_WHATSAPP
  );

  const productNameLookup = useMemo(() => {
    const lookup = new Map();

    products.forEach((product) => {
      const productId = (product?.id ?? '').toString().trim();
      if (!productId) {
        return;
      }

      lookup.set(productId, product?.name || `Produit #${productId}`);
    });

    return lookup;
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('AdminDashboard - authLoading:', authLoading);
    console.log('AdminDashboard - currentUser:', currentUser?.email);
    console.log('AdminDashboard - userData:', userData);
    console.log('AdminDashboard - isAdmin:', isAdmin);
  }, [authLoading, currentUser, userData, isAdmin]);

  // Redirect non-admin users
  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/admin/login', {
        replace: true,
        state: {
          formError: 'Veuillez vous connecter pour acceder au tableau de bord admin.'
        }
      });
    }
  }, [currentUser, authLoading, navigate]);

  // For development: Allow setting self as admin
  const handleMakeAdmin = async () => {
    if (!currentUser) return;
    
    try {
      setPageError('');
      setPageSuccess('');
      const result = await setUserAsAdmin(currentUser.uid);
      if (result.success) {
        setPageSuccess('Vous etes maintenant administrateur !');
        await refreshUserData();
      } else {
        setPageSuccess('');
        setPageError('Erreur: ' + result.error);
      }
    } catch (error) {
      setPageSuccess('');
      setPageError('Erreur lors de la mise a jour du role');
    }
  };

  const handleLogout = async () => {
    try {
      setPageError('');
      setPageSuccess('');
      await logOut();
      navigate('/admin/login', {
        replace: true,
        state: {
          formSuccess: 'Deconnexion reussie.'
        }
      });
    } catch (error) {
      setPageSuccess('');
      setPageError('Erreur lors de la deconnexion');
    }
  };

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAdmin) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setPageError('');
      try {
        const [ordersResult, statsResult, messagesResult, reviewsResult] = await Promise.all([
          getAllOrders(),
          getOrderStatistics(),
          getAllContactMessages(),
          getAllProductReviews()
        ]);

        const loadErrors = [];
        
        if (ordersResult.success) {
          setOrders(ordersResult.data);
          setFilteredOrders(ordersResult.data);
        } else {
          loadErrors.push('Erreur lors du chargement des commandes.');
        }
        
        if (statsResult.success) {
          setStats(statsResult.data);
        }

        if (messagesResult.success) {
          setMessages(messagesResult.data);
        } else {
          loadErrors.push('Erreur lors du chargement des messages clients.');
        }

        if (reviewsResult.success) {
          setReviews(reviewsResult.data || []);
        } else {
          setReviews([]);
          loadErrors.push('Erreur lors du chargement des avis produits.');
        }

        if (loadErrors.length > 0) {
          setPageError(loadErrors.join(' '));
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setPageError('Erreur lors du chargement des donnees');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAdmin]);

  useEffect(() => {
    const targetMessageId = new URLSearchParams(location.search).get('messageId');
    if (!targetMessageId || messages.length === 0) {
      return;
    }

    const targetMessage = messages.find((message) => message.id === targetMessageId);
    if (targetMessage) {
      setSelectedMessage(targetMessage);
      setShowMessageModal(true);
    }
  }, [location.search, messages]);

  // Filter orders by status
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === statusFilter));
    }
  }, [statusFilter, orders]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setPageError('');
      setPageSuccess('');
      const result = await updateOrderStatus(orderId, newStatus);
      
      if (result.success) {
        // Update local state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId 
              ? { ...order, status: newStatus, updatedAt: new Date() }
              : order
          )
        );
        
        // Update stats
        const statsResult = await getOrderStatistics();
        if (statsResult.success) {
          setStats(statsResult.data);
        }
        
        setPageSuccess('Statut mis a jour avec succes');
      } else {
        setPageSuccess('');
        setPageError(result.error || 'Erreur lors de la mise a jour');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setPageSuccess('');
      setPageError('Erreur lors de la mise a jour du statut');
    }
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    
    try {
      setPageError('');
      setPageSuccess('');
      const result = await deleteOrder(orderToDelete);
      
      if (result.success) {
        setOrders(prevOrders => prevOrders.filter(order => order.id !== orderToDelete));
        setStats(prevStats => ({
          ...prevStats,
          total: prevStats.total - 1
        }));
        setPageSuccess('Commande supprimee avec succes');
      } else {
        setPageSuccess('');
        setPageError(result.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      setPageSuccess('');
      setPageError('Erreur lors de la suppression de la commande');
    } finally {
      setShowDeleteConfirm(false);
      setOrderToDelete(null);
    }
  };

  const confirmDeleteReview = (reviewId) => {
    setReviewDeleteConfirmId(reviewId);
  };

  const cancelDeleteReviewConfirmation = () => {
    if (deletingReviewId) {
      return;
    }

    setReviewDeleteConfirmId('');
  };

  const handleDeleteReview = async (reviewId) => {
    if (!reviewId || deletingReviewId) {
      return;
    }

    setPageError('');
    setPageSuccess('');
    setDeletingReviewId(reviewId);

    try {
      const result = await deleteProductReview(reviewId);

      if (result.success) {
        setReviews((prevReviews) => prevReviews.filter((review) => review.id !== reviewId));
        setReviewDeleteConfirmId('');
        setPageSuccess('Avis supprime avec succes.');
      } else {
        setPageError(result.error || 'Erreur lors de la suppression de l\'avis.');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      setPageError('Erreur lors de la suppression de l\'avis.');
    } finally {
      setDeletingReviewId('');
    }
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const confirmDelete = (orderId) => {
    setOrderToDelete(orderId);
    setShowDeleteConfirm(true);
  };

  const sortedMessages = useMemo(() => {
    const nextMessages = [...messages];

    if (messageSort === 'date_asc') {
      nextMessages.sort((a, b) => {
        const aTime = timestampToDate(a.createdAt)?.getTime() || 0;
        const bTime = timestampToDate(b.createdAt)?.getTime() || 0;
        return aTime - bTime;
      });
      return nextMessages;
    }

    if (messageSort === 'status') {
      nextMessages.sort((a, b) => {
        const aWeight = MESSAGE_STATUS_SORT_WEIGHT[a.status] ?? 99;
        const bWeight = MESSAGE_STATUS_SORT_WEIGHT[b.status] ?? 99;
        if (aWeight !== bWeight) {
          return aWeight - bWeight;
        }

        const aTime = timestampToDate(a.createdAt)?.getTime() || 0;
        const bTime = timestampToDate(b.createdAt)?.getTime() || 0;
        return bTime - aTime;
      });
      return nextMessages;
    }

    nextMessages.sort((a, b) => {
      const aTime = timestampToDate(a.createdAt)?.getTime() || 0;
      const bTime = timestampToDate(b.createdAt)?.getTime() || 0;
      return bTime - aTime;
    });

    return nextMessages;
  }, [messages, messageSort]);

  const totalMessagePages = Math.max(1, Math.ceil(sortedMessages.length / MESSAGES_PAGE_SIZE));

  const paginatedMessages = useMemo(() => {
    const startIndex = (messagePage - 1) * MESSAGES_PAGE_SIZE;
    return sortedMessages.slice(startIndex, startIndex + MESSAGES_PAGE_SIZE);
  }, [sortedMessages, messagePage]);

  useEffect(() => {
    if (messagePage > totalMessagePages) {
      setMessagePage(totalMessagePages);
    }
  }, [messagePage, totalMessagePages]);

  const buildWhatsAppOrderMessage = (order) => {
    const productsText = (order?.products || []).map((product) => {
      const productName = product?.name || 'Produit';
      const sizePart = product?.selectedSize ? ` - Taille ${product.selectedSize}` : '';
      const quantityPart = product?.quantity ? ` x${product.quantity}` : '';
      return `- ${productName}${sizePart}${quantityPart}`;
    }).join('\n');

    return [
      'Nouvelle commande',
      '',
      `Commande: ${getOrderDisplayReference(order)}`,
      `Client: ${order?.deliveryInfo?.fullName || 'N/A'}`,
      `Telephone: ${order?.deliveryInfo?.phone || 'N/A'}`,
      '',
      'Produits:',
      productsText || '- N/A',
      '',
      `Total: ${formatAmountForWhatsApp(order?.totalPrice)}`
    ].join('\n');
  };

  const handleSendWhatsApp = (order) => {
    setPageError('');
    setPageSuccess('');

    if (!adminWhatsAppPhone) {
      setPageError('Numero WhatsApp admin manquant. Configurez REACT_APP_ADMIN_WHATSAPP_NUMBER.');
      return;
    }

    const message = buildWhatsAppOrderMessage(order);
    // encodeURIComponent ensures spaces/new lines are URL-safe for WhatsApp links.
    const whatsappUrl = `https://wa.me/${adminWhatsAppPhone}?text=${encodeURIComponent(message)}`;
    const openedWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    if (!openedWindow) {
      setPageError('Impossible d\'ouvrir WhatsApp. Autorisez les pop-ups puis reessayez.');
      return;
    }

    setPageSuccess('Message WhatsApp pre-rempli ouvert. Verifiez puis envoyez depuis WhatsApp.');
  };

  const handleMessageStatusChange = async (messageId, newStatus) => {
    setPageError('');
    setPageSuccess('');

    const result = await updateContactMessageStatus(messageId, newStatus);
    if (!result.success) {
      setPageError(result.error || 'Erreur lors de la mise a jour du message');
      return;
    }

    setMessages((prevMessages) =>
      prevMessages.map((message) =>
        message.id === messageId
          ? { ...message, status: newStatus }
          : message
      )
    );

    if (selectedMessage?.id === messageId) {
      setSelectedMessage((prev) => (prev ? { ...prev, status: newStatus } : prev));
    }

    setPageSuccess('Statut du message client mis a jour.');
  };

  const openMessageDetails = (message) => {
    setSelectedMessage(message);
    setShowMessageModal(true);
  };

  const closeMessageModal = () => {
    setShowMessageModal(false);

    const params = new URLSearchParams(location.search);
    if (!params.has('messageId')) {
      return;
    }

    params.delete('messageId');
    const nextSearch = params.toString();
    navigate(
      {
        pathname: location.pathname,
        search: nextSearch ? `?${nextSearch}` : ''
      },
      { replace: true }
    );
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';

    const date = timestamp instanceof Date
      ? timestamp
      : timestampToDate(timestamp);

    if (!date) return 'N/A';

    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusLabel = (status) => {
    const labels = {
      [ORDER_STATUS.PENDING]: 'En attente',
      [ORDER_STATUS.CONFIRMED]: 'Confirmée',
      [ORDER_STATUS.SHIPPED]: 'Expédiée',
      [ORDER_STATUS.DELIVERED]: 'Livrée',
      [ORDER_STATUS.CANCELLED]: 'Annulée'
    };
    return labels[status] || status;
  };

  const getStatusClass = (status) => {
    const classes = {
      [ORDER_STATUS.PENDING]: 'status-pending',
      [ORDER_STATUS.CONFIRMED]: 'status-confirmed',
      [ORDER_STATUS.SHIPPED]: 'status-shipped',
      [ORDER_STATUS.DELIVERED]: 'status-delivered',
      [ORDER_STATUS.CANCELLED]: 'status-cancelled'
    };
    return classes[status] || '';
  };

  const getPaymentMethodLabel = (method) => {
    if (method === 'cod') return 'A la livraison';
    if (method === 'pickup') return 'Reservation / Retrait';
    return 'NITA/Amana';
  };

  const getMessageStatusLabel = (status) => {
    if (status === CONTACT_MESSAGE_STATUS.NEW) return 'Nouveau';
    if (status === CONTACT_MESSAGE_STATUS.READ) return 'Lu';
    if (status === CONTACT_MESSAGE_STATUS.RESOLVED) return 'Resolue';
    return status || 'N/A';
  };

  const getMessageStatusClass = (status) => {
    if (status === CONTACT_MESSAGE_STATUS.NEW) return 'message-status-new';
    if (status === CONTACT_MESSAGE_STATUS.READ) return 'message-status-read';
    if (status === CONTACT_MESSAGE_STATUS.RESOLVED) return 'message-status-resolved';
    return '';
  };

  const getReviewProductName = (productId) => {
    const normalizedProductId = (productId || '').toString().trim();

    if (!normalizedProductId) {
      return 'Produit inconnu';
    }

    return productNameLookup.get(normalizedProductId) || `Produit #${normalizedProductId}`;
  };

  const getReviewRatingStars = (ratingValue) => {
    const roundedRating = Math.max(0, Math.min(5, Math.round(Number(ratingValue) || 0)));
    return `${'★'.repeat(roundedRating)}${'☆'.repeat(5 - roundedRating)}`;
  };

  if (authLoading || loading) {
    return (
      <div className="admin-dashboard page">
        <div className="container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show "Make Admin" option for logged-in users who are not admin
  if (currentUser && !isAdmin) {
    return (
      <div className="admin-dashboard page">
        <div className="container">
          <div className="not-admin-container">
            <div className="not-admin-card">
              <h2>Accès Admin Requis</h2>
              {pageSuccess && (
                <div className="admin-inline-success" role="status">
                  <span>{pageSuccess}</span>
                  <button
                    type="button"
                    className="admin-inline-success-close"
                    onClick={() => setPageSuccess('')}
                    aria-label="Fermer le message de succes"
                  >
                    ×
                  </button>
                </div>
              )}
              {pageError && (
                <div className="admin-inline-error" role="alert">
                  <span>{pageError}</span>
                  <button
                    type="button"
                    className="admin-inline-error-close"
                    onClick={() => setPageError('')}
                    aria-label="Fermer le message d'erreur"
                  >
                    ×
                  </button>
                </div>
              )}
              <p>Vous êtes connecté en tant que <strong>{currentUser.email}</strong></p>
              <p>Votre rôle actuel: <strong>{userData?.role || 'customer'}</strong></p>
              <p className="not-admin-info">
                Pour accéder au tableau de bord admin, votre compte doit avoir le rôle "admin".
              </p>
              <div className="not-admin-actions">
                <button className="make-admin-btn" onClick={handleMakeAdmin}>
                  Devenir Admin
                </button>
                <button className="logout-btn" onClick={handleLogout}>
                  Déconnexion
                </button>
              </div>
              <p className="not-admin-note">
                Note: En production, seul un administrateur existant peut attribuer le rôle admin.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard page">
      <div className="container">
        <div className="admin-header">
          <div className="admin-header-content">
            <div className="admin-header-text">
              <h1>Tableau de bord Admin</h1>
              <p>Gestion des commandes</p>
            </div>
            <div className="admin-header-actions">
              <span className="admin-user-info">
                Connecté en tant que: <strong>{currentUser?.email}</strong>
              </span>
              <button className="logout-btn" onClick={handleLogout}>
                Déconnexion
              </button>
            </div>
          </div>
        </div>

        {pageError && (
          <div className="admin-inline-error" role="alert">
            <span>{pageError}</span>
            <button
              type="button"
              className="admin-inline-error-close"
              onClick={() => setPageError('')}
              aria-label="Fermer le message d'erreur"
            >
              ×
            </button>
          </div>
        )}

        {pageSuccess && (
          <div className="admin-inline-success" role="status">
            <span>{pageSuccess}</span>
            <button
              type="button"
              className="admin-inline-success-close"
              onClick={() => setPageSuccess('')}
              aria-label="Fermer le message de succes"
            >
              ×
            </button>
          </div>
        )}

        {/* Statistics Cards */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total Commandes</span>
            </div>
            <div className="stat-card stat-pending">
              <span className="stat-value">{stats.pending}</span>
              <span className="stat-label">En attente</span>
            </div>
            <div className="stat-card stat-confirmed">
              <span className="stat-value">{stats.confirmed}</span>
              <span className="stat-label">Confirmées</span>
            </div>
            <div className="stat-card stat-shipped">
              <span className="stat-value">{stats.shipped}</span>
              <span className="stat-label">Expédiées</span>
            </div>
            <div className="stat-card stat-delivered">
              <span className="stat-value">{stats.delivered}</span>
              <span className="stat-label">Livrées</span>
            </div>
            <div className="stat-card stat-reviews">
              <span className="stat-value">{reviews.length}</span>
              <span className="stat-label">Avis Produits</span>
            </div>
            <div className="stat-card stat-revenue">
              <span className="stat-value">{formatPrice(stats.totalRevenue)}</span>
              <span className="stat-label">Chiffre d'affaires</span>
            </div>
          </div>
        )}

        {/* Filter Section */}
        <div className="filter-section">
          <label htmlFor="status-filter">Filtrer par statut:</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Toutes les commandes</option>
            <option value={ORDER_STATUS.PENDING}>En attente</option>
            <option value={ORDER_STATUS.CONFIRMED}>Confirmées</option>
            <option value={ORDER_STATUS.SHIPPED}>Expédiées</option>
            <option value={ORDER_STATUS.DELIVERED}>Livrées</option>
            <option value={ORDER_STATUS.CANCELLED}>Annulées</option>
          </select>
        </div>

        {/* Orders Table */}
        <div className="orders-table-container">
          {filteredOrders.length === 0 ? (
            <div className="no-orders">
              <p>Aucune commande trouvée</p>
            </div>
          ) : (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>N° Commande</th>
                  <th>Client</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Paiement</th>
                  <th>Région</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="order-id">{getOrderDisplayReference(order)}</td>
                    <td>
                      <div className="customer-info">
                        <span className="customer-name">{order.deliveryInfo?.fullName || 'N/A'}</span>
                        <span className="customer-email">{order.customerEmail || ''}</span>
                      </div>
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td className="order-total">{formatPrice(order.totalPrice)}</td>
                    <td>
                      <span className={`payment-badge ${order.paymentMethod}`}>
                        {getPaymentMethodLabel(order.paymentMethod)}
                      </span>
                    </td>
                    <td>{order.deliveryRegion}</td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`status-select ${getStatusClass(order.status)}`}
                      >
                        <option value={ORDER_STATUS.PENDING}>En attente</option>
                        <option value={ORDER_STATUS.CONFIRMED}>Confirmée</option>
                        <option value={ORDER_STATUS.SHIPPED}>Expédiée</option>
                        <option value={ORDER_STATUS.DELIVERED}>Livrée</option>
                        <option value={ORDER_STATUS.CANCELLED}>Annulée</option>
                      </select>
                    </td>
                    <td className="actions-cell">
                      <button
                        className="action-btn whatsapp-btn"
                        onClick={() => handleSendWhatsApp(order)}
                        title="Envoyer sur WhatsApp"
                      >
                        Envoyer sur WhatsApp
                      </button>
                      <button 
                        className="action-btn view-btn"
                        onClick={() => openOrderDetails(order)}
                        title="Voir détails"
                      >
                        👁️
                      </button>
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => confirmDelete(order.id)}
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <section className="admin-reviews-section">
          <div className="reviews-section-header">
            <h2>Avis Produits</h2>
            <span className="reviews-count-badge">{reviews.length} avis</span>
          </div>

          {reviews.length === 0 ? (
            <div className="no-reviews-admin">
              <p>Aucun avis produit pour le moment.</p>
            </div>
          ) : (
            <div className="reviews-table-container">
              <table className="reviews-table">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Utilisateur</th>
                    <th>Note</th>
                    <th>Commentaire</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => (
                    <tr key={review.id}>
                      <td className="review-product-name">{getReviewProductName(review.productId)}</td>
                      <td>{review.name || 'N/A'}</td>
                      <td>
                        <span className="review-rating-stars" aria-label={`Note ${review.rating || 0} sur 5`}>
                          {getReviewRatingStars(review.rating)}
                        </span>
                        <span className="review-rating-value">{Number(review.rating) || 0}/5</span>
                      </td>
                      <td className="review-comment-cell">{review.comment || 'N/A'}</td>
                      <td>{formatDate(review.createdAt)}</td>
                      <td className="review-actions-cell">
                        {reviewDeleteConfirmId === review.id ? (
                          <div className="review-confirm-actions">
                            <button
                              type="button"
                              className="review-confirm-delete-btn"
                              onClick={() => handleDeleteReview(review.id)}
                              disabled={deletingReviewId === review.id}
                            >
                              {deletingReviewId === review.id ? 'Suppression...' : 'Confirmer'}
                            </button>
                            <button
                              type="button"
                              className="review-cancel-delete-btn"
                              onClick={cancelDeleteReviewConfirmation}
                              disabled={deletingReviewId === review.id}
                            >
                              Annuler
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="review-delete-btn"
                            onClick={() => confirmDeleteReview(review.id)}
                            disabled={Boolean(deletingReviewId)}
                          >
                            Supprimer
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="client-messages-section">
          <div className="messages-section-header">
            <h2>Messages Clients</h2>
            <div className="messages-sort-controls">
              <label htmlFor="messages-sort">Trier:</label>
              <select
                id="messages-sort"
                value={messageSort}
                onChange={(event) => {
                  setMessageSort(event.target.value);
                  setMessagePage(1);
                }}
              >
                <option value="date_desc">Date (plus recents)</option>
                <option value="date_asc">Date (plus anciens)</option>
                <option value="status">Statut</option>
              </select>
            </div>
          </div>

          {sortedMessages.length === 0 ? (
            <div className="no-messages">
              <p>Aucun message client pour le moment.</p>
            </div>
          ) : (
            <>
              <div className="messages-table-container">
                <table className="messages-table">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Email</th>
                      <th>Sujet</th>
                      <th>Message</th>
                      <th>Date</th>
                      <th>Statut</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedMessages.map((message) => (
                      <tr
                        key={message.id}
                        className={message.status === CONTACT_MESSAGE_STATUS.NEW ? 'message-row-unread' : ''}
                      >
                        <td>{message.name || 'N/A'}</td>
                        <td>{message.email || 'N/A'}</td>
                        <td>{message.subject || 'Sans sujet'}</td>
                        <td className="message-preview">
                          {(message.message || '').length > 90
                            ? `${message.message.slice(0, 90)}...`
                            : (message.message || 'N/A')}
                        </td>
                        <td>{formatDate(message.createdAt)}</td>
                        <td>
                          <select
                            value={message.status || CONTACT_MESSAGE_STATUS.NEW}
                            onChange={(event) => handleMessageStatusChange(message.id, event.target.value)}
                            className={`message-status-select ${getMessageStatusClass(message.status)}`}
                          >
                            <option value={CONTACT_MESSAGE_STATUS.NEW}>Nouveau</option>
                            <option value={CONTACT_MESSAGE_STATUS.READ}>Lu</option>
                            <option value={CONTACT_MESSAGE_STATUS.RESOLVED}>Resolue</option>
                          </select>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="action-btn view-btn"
                            onClick={() => openMessageDetails(message)}
                            title="Voir le message"
                          >
                            👁️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalMessagePages > 1 && (
                <div className="messages-pagination">
                  <button
                    type="button"
                    className="messages-page-btn"
                    onClick={() => setMessagePage((prev) => Math.max(1, prev - 1))}
                    disabled={messagePage === 1}
                  >
                    Precedent
                  </button>
                  <span className="messages-page-indicator">
                    Page {messagePage} / {totalMessagePages}
                  </span>
                  <button
                    type="button"
                    className="messages-page-btn"
                    onClick={() => setMessagePage((prev) => Math.min(totalMessagePages, prev + 1))}
                    disabled={messagePage === totalMessagePages}
                  >
                    Suivant
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Détails de la commande</h2>
              <button className="close-btn" onClick={() => setShowOrderModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>Informations de commande</h3>
                <p><strong>Numero de commande:</strong> {getOrderDisplayReference(selectedOrder)}</p>
                <p><strong>ID technique:</strong> {selectedOrder.id}</p>
                <p><strong>Date:</strong> {formatDate(selectedOrder.createdAt)}</p>
                <p><strong>Statut:</strong> 
                  <span className={`status-badge ${getStatusClass(selectedOrder.status)}`}>
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                </p>
                <p><strong>Méthode de paiement:</strong> 
                  {getPaymentMethodLabel(selectedOrder.paymentMethod)}
                </p>
              </div>
              
              <div className="detail-section">
                <h3>Informations de livraison</h3>
                <p><strong>Nom:</strong> {selectedOrder.deliveryInfo?.fullName}</p>
                <p><strong>Téléphone:</strong> {selectedOrder.deliveryInfo?.phone}</p>
                <p><strong>Région:</strong> {selectedOrder.deliveryRegion}</p>
                <p><strong>Quartier:</strong> {selectedOrder.deliveryInfo?.quartier}</p>
                <p><strong>Adresse:</strong> {selectedOrder.deliveryInfo?.address}</p>
              </div>
              
              <div className="detail-section">
                <h3>Produits commandés</h3>
                <div className="ordered-products">
                  {selectedOrder.products?.map((product, index) => (
                    <div key={index} className="ordered-product">
                      <img 
                        src={product.selectedColor || product.image} 
                        alt={product.name}
                        className="product-thumbnail"
                      />
                      <div className="product-details">
                        <span className="product-name">{product.name}</span>
                        <span className="product-meta">
                          Taille: {product.selectedSize} | Qté: {product.quantity}
                        </span>
                        <span className="product-price">{formatPrice(product.price * product.quantity)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="detail-section total-section">
                <p><strong>Sous-total:</strong> {formatPrice(selectedOrder.subtotal || selectedOrder.totalPrice - (selectedOrder.deliveryFee || 0))}</p>
                <p><strong>Livraison:</strong> {formatPrice(selectedOrder.deliveryFee || 0)}</p>
                <p className="total-line"><strong>Total:</strong> {formatPrice(selectedOrder.totalPrice)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Details Modal */}
      {showMessageModal && selectedMessage && (
        <div className="modal-overlay" onClick={closeMessageModal}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>Message Client</h2>
              <button className="close-btn" onClick={closeMessageModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>Informations</h3>
                <p><strong>Nom:</strong> {selectedMessage.name || 'N/A'}</p>
                <p><strong>Email:</strong> {selectedMessage.email || 'N/A'}</p>
                <p><strong>Sujet:</strong> {selectedMessage.subject || 'Sans sujet'}</p>
                <p><strong>Date:</strong> {formatDate(selectedMessage.createdAt)}</p>
                <p>
                  <strong>Statut:</strong>
                  <span className={`status-badge ${getMessageStatusClass(selectedMessage.status)}`}>
                    {getMessageStatusLabel(selectedMessage.status)}
                  </span>
                </p>
              </div>

              <div className="detail-section">
                <h3>Message</h3>
                <p className="message-detail-text">{selectedMessage.message || 'N/A'}</p>
              </div>

              <div className="detail-section message-detail-actions">
                <button
                  type="button"
                  className="message-action-btn"
                  onClick={() => handleMessageStatusChange(selectedMessage.id, CONTACT_MESSAGE_STATUS.READ)}
                  disabled={selectedMessage.status === CONTACT_MESSAGE_STATUS.READ}
                >
                  Marquer comme lu
                </button>
                <button
                  type="button"
                  className="message-action-btn resolved"
                  onClick={() => handleMessageStatusChange(selectedMessage.id, CONTACT_MESSAGE_STATUS.RESOLVED)}
                  disabled={selectedMessage.status === CONTACT_MESSAGE_STATUS.RESOLVED}
                >
                  Marquer comme resolu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirmer la suppression</h2>
            </div>
            <div className="modal-body">
              <p>Êtes-vous sûr de vouloir supprimer cette commande ?</p>
              <p className="warning-text">Cette action est irréversible.</p>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowDeleteConfirm(false)}>
                Annuler
              </button>
              <button className="delete-confirm-btn" onClick={handleDeleteOrder}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
