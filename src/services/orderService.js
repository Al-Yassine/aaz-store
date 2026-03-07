import { 
  collection, 
  addDoc,
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { auth, firestore, functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';

const ORDERS_COLLECTION = 'orders';

const getOrderDisplayReference = (orderId) => {
  if (!orderId || typeof orderId !== 'string') {
    return 'N/A';
  }
  return orderId.slice(-8).toUpperCase();
};

// Align order identity with the real Firebase auth state before hitting Firestore rules.
const normalizeOrderIdentity = (orderData = {}) => {
  const firebaseUser = auth?.currentUser || null;
  const normalizedOrder = { ...orderData };

  if (firebaseUser?.uid) {
    normalizedOrder.userId = firebaseUser.uid;
    normalizedOrder.customerEmail = normalizedOrder.customerEmail || firebaseUser.email || '';
    normalizedOrder.isGuest = false;
    normalizedOrder.checkoutMode = 'account';
    return normalizedOrder;
  }

  normalizedOrder.userId = null;
  normalizedOrder.isGuest = true;
  normalizedOrder.checkoutMode = normalizedOrder.checkoutMode || 'guest';
  normalizedOrder.customerEmail = normalizedOrder.customerEmail || '';

  return normalizedOrder;
};

/**
 * Order status constants
 */
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

/**
 * Create a new order
 * @param {object} orderData - Order data
 * @param {string} orderData.userId - User's unique ID
 * @param {array} orderData.products - Array of product objects
 * @param {number} orderData.totalPrice - Total order price
 * @param {string} orderData.paymentMethod - Payment method
 * @param {string} orderData.deliveryRegion - Delivery region
 * @param {object} orderData.deliveryInfo - Delivery information
 * @returns {Promise<object>} - Result object with order ID and display reference
 */
export const createOrder = async (orderData) => {
  try {
    const ordersRef = collection(firestore, ORDERS_COLLECTION);
    const normalizedOrderData = normalizeOrderIdentity(orderData);

    const order = {
      ...normalizedOrderData,
      status: ORDER_STATUS.PENDING,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(ordersRef, order);
    
    // Guests are unauthenticated, so skip callable email notification for guest orders.
    if (!normalizedOrderData.isGuest && normalizedOrderData.userId) {
      try {
        const sendOrderEmail = httpsCallable(functions, 'sendOrderConfirmationEmail');
        await sendOrderEmail({ orderId: docRef.id });
      } catch (emailError) {
        // Don't fail the order if email fails
        console.warn('Failed to send order confirmation email:', emailError);
      }
    }
    
    return { 
      success: true, 
      orderId: docRef.id,
      // Keep the same response key for UI compatibility, but use random Firestore ID reference.
      orderNumber: getOrderDisplayReference(docRef.id)
    };
  } catch (error) {
    console.error('Error creating order:', error);

    if (error?.code === 'permission-denied') {
      return {
        success: false,
        error: 'Permissions Firestore insuffisantes. Verifiez les regles Firestore publiees puis reessayez.'
      };
    }

    return { 
      success: false, 
      error: error.message 
    };
  }
};

/**
 * Get an order by ID
 * @param {string} orderId - Order's unique ID
 * @returns {Promise<object>} - Order data
 */
export const getOrder = async (orderId) => {
  try {
    const orderRef = doc(firestore, ORDERS_COLLECTION, orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (orderSnap.exists()) {
      return { 
        success: true, 
        data: { id: orderSnap.id, ...orderSnap.data() } 
      };
    } else {
      return { 
        success: false, 
        error: 'Order not found' 
      };
    }
  } catch (error) {
    console.error('Error getting order:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

/**
 * Get all orders for a specific user
 * @param {string} userId - User's unique ID
 * @returns {Promise<object>} - Array of orders
 */
export const getUserOrders = async (userId) => {
  try {
    const ordersRef = collection(firestore, ORDERS_COLLECTION);
    const q = query(ordersRef, where('userId', '==', userId));
    
    const querySnapshot = await getDocs(q);
    const orders = [];
    
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });

    // Keep newest orders first without requiring a composite Firestore index.
    orders.sort((a, b) => {
      const aTime = timestampToDate(a.createdAt)?.getTime() || 0;
      const bTime = timestampToDate(b.createdAt)?.getTime() || 0;
      return bTime - aTime;
    });
    
    return { 
      success: true, 
      data: orders 
    };
  } catch (error) {
    console.error('Error getting user orders:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

/**
 * Get all orders (Admin only)
 * @returns {Promise<object>} - Array of all orders
 */
export const getAllOrders = async () => {
  try {
    const ordersRef = collection(firestore, ORDERS_COLLECTION);
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    const orders = [];
    
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    
    return { 
      success: true, 
      data: orders 
    };
  } catch (error) {
    console.error('Error getting all orders:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

/**
 * Get orders filtered by status (Admin only)
 * @param {string} status - Order status to filter by
 * @returns {Promise<object>} - Array of filtered orders
 */
export const getOrdersByStatus = async (status) => {
  try {
    const ordersRef = collection(firestore, ORDERS_COLLECTION);
    const q = query(ordersRef, where('status', '==', status));
    
    const querySnapshot = await getDocs(q);
    const orders = [];
    
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });

    // Keep newest orders first without requiring a composite Firestore index.
    orders.sort((a, b) => {
      const aTime = timestampToDate(a.createdAt)?.getTime() || 0;
      const bTime = timestampToDate(b.createdAt)?.getTime() || 0;
      return bTime - aTime;
    });
    
    return { 
      success: true, 
      data: orders 
    };
  } catch (error) {
    console.error('Error getting orders by status:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

/**
 * Update order status (Admin only)
 * @param {string} orderId - Order's unique ID
 * @param {string} newStatus - New status value
 * @returns {Promise<object>} - Result object
 */
export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    // Validate status
    if (!Object.values(ORDER_STATUS).includes(newStatus)) {
      return { 
        success: false, 
        error: 'Invalid order status' 
      };
    }
    
    const orderRef = doc(firestore, ORDERS_COLLECTION, orderId);
    await updateDoc(orderRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    });
    
    // Trigger email notification via Cloud Function
    try {
      const sendStatusEmail = httpsCallable(functions, 'sendOrderStatusUpdateEmail');
      await sendStatusEmail({ orderId, newStatus });
    } catch (emailError) {
      // Don't fail the update if email fails
      console.warn('Failed to send status update email:', emailError);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

/**
 * Delete an order (Admin only)
 * @param {string} orderId - Order's unique ID
 * @returns {Promise<object>} - Result object
 */
export const deleteOrder = async (orderId) => {
  try {
    const orderRef = doc(firestore, ORDERS_COLLECTION, orderId);
    await deleteDoc(orderRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting order:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

/**
 * Get order statistics (Admin only)
 * @returns {Promise<object>} - Statistics object
 */
export const getOrderStatistics = async () => {
  try {
    const result = await getAllOrders();
    
    if (!result.success) {
      return result;
    }
    
    const orders = result.data;
    const stats = {
      total: orders.length,
      pending: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      totalRevenue: 0
    };
    
    orders.forEach(order => {
      stats[order.status] = (stats[order.status] || 0) + 1;
      if (order.status !== ORDER_STATUS.CANCELLED) {
        stats.totalRevenue += order.totalPrice || 0;
      }
    });
    
    return { 
      success: true, 
      data: stats 
    };
  } catch (error) {
    console.error('Error getting order statistics:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

/**
 * Convert Firestore timestamp to JavaScript Date
 * @param {Timestamp|object} timestamp - Firestore timestamp
 * @returns {Date|null} - JavaScript Date or null
 */
export const timestampToDate = (timestamp) => {
  if (!timestamp) return null;
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000);
  }
  return null;
};

/**
 * Format order for display
 * @param {object} order - Order object
 * @returns {object} - Formatted order
 */
export const formatOrder = (order) => {
  return {
    ...order,
    createdAtFormatted: order.createdAt ? timestampToDate(order.createdAt) : null,
    updatedAtFormatted: order.updatedAt ? timestampToDate(order.updatedAt) : null
  };
};

const orderService = {
  ORDER_STATUS,
  createOrder,
  getOrder,
  getUserOrders,
  getAllOrders,
  getOrdersByStatus,
  updateOrderStatus,
  deleteOrder,
  getOrderStatistics,
  timestampToDate,
  formatOrder
};

export default orderService;
