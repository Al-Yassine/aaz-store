import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
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
import { formatPrice } from '../utils/formatPrice';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { currentUser, isAdmin, userData, loading: authLoading, refreshUserData } = useAuth();
  const { showToast } = useToast();
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
      showToast('Veuillez vous connecter', 'error');
      navigate('/admin/login');
    }
  }, [currentUser, authLoading, navigate, showToast]);

  // For development: Allow setting self as admin
  const handleMakeAdmin = async () => {
    if (!currentUser) return;
    
    try {
      const result = await setUserAsAdmin(currentUser.uid);
      if (result.success) {
        showToast('Vous êtes maintenant administrateur !', 'success');
        await refreshUserData();
      } else {
        showToast('Erreur: ' + result.error, 'error');
      }
    } catch (error) {
      showToast('Erreur lors de la mise à jour du rôle', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
      showToast('Déconnexion réussie', 'success');
      navigate('/admin/login');
    } catch (error) {
      showToast('Erreur lors de la déconnexion', 'error');
    }
  };

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAdmin) return;
      
      setLoading(true);
      try {
        const [ordersResult, statsResult] = await Promise.all([
          getAllOrders(),
          getOrderStatistics()
        ]);
        
        if (ordersResult.success) {
          setOrders(ordersResult.data);
          setFilteredOrders(ordersResult.data);
        } else {
          showToast('Erreur lors du chargement des commandes', 'error');
        }
        
        if (statsResult.success) {
          setStats(statsResult.data);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        showToast('Erreur lors du chargement des données', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAdmin, showToast]);

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
        
        showToast('Statut mis à jour avec succès', 'success');
      } else {
        showToast(result.error || 'Erreur lors de la mise à jour', 'error');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('Erreur lors de la mise à jour du statut', 'error');
    }
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    
    try {
      const result = await deleteOrder(orderToDelete);
      
      if (result.success) {
        setOrders(prevOrders => prevOrders.filter(order => order.id !== orderToDelete));
        setStats(prevStats => ({
          ...prevStats,
          total: prevStats.total - 1
        }));
        showToast('Commande supprimée avec succès', 'success');
      } else {
        showToast(result.error || 'Erreur lors de la suppression', 'error');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      showToast('Erreur lors de la suppression de la commande', 'error');
    } finally {
      setShowDeleteConfirm(false);
      setOrderToDelete(null);
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

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
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
                  <th>ID</th>
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
                    <td className="order-id">{order.id.slice(-8).toUpperCase()}</td>
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
                        {order.paymentMethod === 'cod' ? 'À la livraison' : 'NITA/Amana'}
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
                <p><strong>ID:</strong> {selectedOrder.id}</p>
                <p><strong>Date:</strong> {formatDate(selectedOrder.createdAt)}</p>
                <p><strong>Statut:</strong> 
                  <span className={`status-badge ${getStatusClass(selectedOrder.status)}`}>
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                </p>
                <p><strong>Méthode de paiement:</strong> 
                  {selectedOrder.paymentMethod === 'cod' ? 'À la livraison' : 'NITA/Amana'}
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
