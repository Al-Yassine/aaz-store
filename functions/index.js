const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Initialize Firebase Admin
admin.initializeApp();

// Configure nodemailer transporter
// You should set these configuration values in Firebase environment config:
// firebase functions:config:set gmail.email="your-email@gmail.com" gmail.password="your-app-password"
const gmailEmail = functions.config().gmail?.email || process.env.GMAIL_EMAIL;
const gmailPassword = functions.config().gmail?.password || process.env.GMAIL_PASSWORD;

const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailEmail,
    pass: gmailPassword
  }
});

// App name for emails
const APP_NAME = 'AAZ Store';

// Helper function to get user email from order
async function getUserEmail(userId) {
  try {
    const userRecord = await admin.auth().getUser(userId);
    return userRecord.email;
  } catch (error) {
    console.error('Error getting user email:', error);
    return null;
  }
}

// Helper function to format price
function formatPrice(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0
  }).format(amount);
}

// Helper function to format date
function formatDate(timestamp) {
  if (!timestamp) return 'N/A';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

// Get status label in French
function getStatusLabel(status) {
  const labels = {
    'pending': 'En attente',
    'confirmed': 'Confirmée',
    'shipped': 'Expédiée',
    'delivered': 'Livrée',
    'cancelled': 'Annulée'
  };
  return labels[status] || status;
}

function getPaymentMethodLabel(paymentMethod) {
  if (paymentMethod === 'cod') return 'Paiement a la livraison';
  if (paymentMethod === 'pickup') return 'Reservation / retrait en magasin';
  return 'NITA/Amana';
}

/**
 * Send order confirmation email when a new order is created
 * Callable from client-side
 */
exports.sendOrderConfirmationEmail = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be authenticated to send emails.'
    );
  }

  const { orderId } = data;
  
  if (!orderId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Order ID is required.'
    );
  }

  try {
    // Get order details
    const orderDoc = await admin.firestore()
      .collection('orders')
      .doc(orderId)
      .get();

    if (!orderDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Order not found.'
      );
    }

    const order = orderDoc.data();
    const userEmail = await getUserEmail(order.userId);

    if (!userEmail) {
      console.warn('No email found for user:', order.userId);
      return { success: false, message: 'No user email found' };
    }

    // Build products list for email
    const productsList = order.products?.map(p => 
      `• ${p.name} (Taille: ${p.selectedSize}, Qté: ${p.quantity}) - ${formatPrice(p.price * p.quantity)}`
    ).join('\n') || 'N/A';

    // Send email
    const mailOptions = {
      from: `${APP_NAME} <${gmailEmail}>`,
      to: userEmail,
      subject: `Confirmation de votre commande #${orderId.slice(-8).toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a2e;">Bonjour,</h2>
          <p>Merci pour votre commande sur ${APP_NAME} !</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1a1a2e; margin-top: 0;">Détails de la commande</h3>
            <p><strong>Numéro de commande:</strong> #${orderId.slice(-8).toUpperCase()}</p>
            <p><strong>Date:</strong> ${formatDate(order.createdAt)}</p>
            <p><strong>Statut:</strong> ${getStatusLabel(order.status)}</p>
            <p><strong>Méthode de paiement:</strong> ${order.paymentMethod === 'cod' ? 'Paiement à la livraison' : 'NITA/Amana'}</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1a1a2e; margin-top: 0;">Produits commandés</h3>
            <pre style="white-space: pre-wrap; font-family: inherit;">${productsList}</pre>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1a1a2e; margin-top: 0;">Informations de livraison</h3>
            <p><strong>Nom:</strong> ${order.deliveryInfo?.fullName || 'N/A'}</p>
            <p><strong>Téléphone:</strong> ${order.deliveryInfo?.phone || 'N/A'}</p>
            <p><strong>Région:</strong> ${order.deliveryRegion || 'N/A'}</p>
            <p><strong>Quartier:</strong> ${order.deliveryInfo?.quartier || 'N/A'}</p>
            <p><strong>Adresse:</strong> ${order.deliveryInfo?.address || 'N/A'}</p>
          </div>
          
          <div style="background: #1a1a2e; color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 1.2em;"><strong>Total: ${formatPrice(order.totalPrice)}</strong></p>
          </div>
          
          <p>Nous vous tiendrons informé de l'avancement de votre commande.</p>
          
          <p style="margin-top: 30px;">
            Merci,<br>
            L'équipe ${APP_NAME}
          </p>
        </div>
      `
    };

    await mailTransport.sendMail(mailOptions);
    console.log('Order confirmation email sent to:', userEmail);

    return { success: true };
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to send email.'
    );
  }
});

/**
 * Send order status update email
 * Callable from client-side
 */
exports.sendOrderStatusUpdateEmail = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be authenticated to send emails.'
    );
  }

  const { orderId, newStatus } = data;
  
  if (!orderId || !newStatus) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Order ID and new status are required.'
    );
  }

  try {
    // Get order details
    const orderDoc = await admin.firestore()
      .collection('orders')
      .doc(orderId)
      .get();

    if (!orderDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Order not found.'
      );
    }

    const order = orderDoc.data();
    const userEmail = await getUserEmail(order.userId);

    if (!userEmail) {
      console.warn('No email found for user:', order.userId);
      return { success: false, message: 'No user email found' };
    }

    // Status-specific messages
    const statusMessages = {
      'pending': 'Votre commande est en attente de traitement.',
      'confirmed': 'Votre commande a été confirmée et est en cours de préparation.',
      'shipped': 'Votre commande a été expédiée et est en route vers vous.',
      'delivered': 'Votre commande a été livrée. Merci pour votre confiance !',
      'cancelled': 'Votre commande a été annulée. Contactez-nous si vous avez des questions.'
    };

    // Send email
    const mailOptions = {
      from: `${APP_NAME} <${gmailEmail}>`,
      to: userEmail,
      subject: `Mise à jour de votre commande #${orderId.slice(-8).toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a2e;">Bonjour,</h2>
          <p>Le statut de votre commande a été mis à jour.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1a1a2e; margin-top: 0;">Détails de la commande</h3>
            <p><strong>Numéro de commande:</strong> #${orderId.slice(-8).toUpperCase()}</p>
            <p><strong>Nouveau statut:</strong> <span style="color: #1a1a2e; font-weight: bold;">${getStatusLabel(newStatus)}</span></p>
          </div>
          
          <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #27ae60;">
            <p style="margin: 0;">${statusMessages[newStatus] || 'Le statut de votre commande a changé.'}</p>
          </div>
          
          <p>Vous pouvez suivre l'avancement de votre commande sur notre site.</p>
          
          <p style="margin-top: 30px;">
            Merci,<br>
            L'équipe ${APP_NAME}
          </p>
        </div>
      `
    };

    await mailTransport.sendMail(mailOptions);
    console.log('Status update email sent to:', userEmail);

    return { success: true };
  } catch (error) {
    console.error('Error sending status update email:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to send email.'
    );
  }
});

/**
 * Triggered when an order is created - sends confirmation email
 */
exports.onOrderCreated = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    const order = snap.data();
    const orderId = context.params.orderId;

    try {
      const userEmail = await getUserEmail(order.userId);

      if (!userEmail) {
        console.warn('No email found for user:', order.userId);
        return null;
      }

      // Build products list for email
      const productsList = order.products?.map(p => 
        `• ${p.name} (Taille: ${p.selectedSize}, Qté: ${p.quantity}) - ${formatPrice(p.price * p.quantity)}`
      ).join('\n') || 'N/A';

      // Send email
      const mailOptions = {
        from: `${APP_NAME} <${gmailEmail}>`,
        to: userEmail,
        subject: `Confirmation de votre commande #${orderId.slice(-8).toUpperCase()}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a1a2e;">Bonjour,</h2>
            <p>Merci pour votre commande sur ${APP_NAME} !</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1a1a2e; margin-top: 0;">Détails de la commande</h3>
              <p><strong>Numéro de commande:</strong> #${orderId.slice(-8).toUpperCase()}</p>
              <p><strong>Date:</strong> ${formatDate(order.createdAt)}</p>
              <p><strong>Statut:</strong> ${getStatusLabel(order.status)}</p>
              <p><strong>Méthode de paiement:</strong> ${getPaymentMethodLabel(order.paymentMethod)}</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1a1a2e; margin-top: 0;">Produits commandés</h3>
              <pre style="white-space: pre-wrap; font-family: inherit;">${productsList}</pre>
            </div>
            
            <div style="background: #1a1a2e; color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 1.2em;"><strong>Total: ${formatPrice(order.totalPrice)}</strong></p>
            </div>
            
            <p>Nous vous tiendrons informé de l'avancement de votre commande.</p>
            
            <p style="margin-top: 30px;">
              Merci,<br>
              L'équipe ${APP_NAME}
            </p>
          </div>
        `
      };

      await mailTransport.sendMail(mailOptions);
      console.log('Order confirmation email sent to:', userEmail);

      return null;
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
      return null;
    }
  });

/**
 * Triggered when an order status is updated - sends status update email
 */
exports.onOrderStatusUpdated = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const previousStatus = change.before.data().status;
    const newStatus = change.after.data().status;
    const orderId = context.params.orderId;

    // Only send email if status actually changed
    if (previousStatus === newStatus) {
      return null;
    }

    try {
      const order = change.after.data();
      const userEmail = await getUserEmail(order.userId);

      if (!userEmail) {
        console.warn('No email found for user:', order.userId);
        return null;
      }

      // Status-specific messages
      const statusMessages = {
        'pending': 'Votre commande est en attente de traitement.',
        'confirmed': 'Votre commande a été confirmée et est en cours de préparation.',
        'shipped': 'Votre commande a été expédiée et est en route vers vous.',
        'delivered': 'Votre commande a été livrée. Merci pour votre confiance !',
        'cancelled': 'Votre commande a été annulée. Contactez-nous si vous avez des questions.'
      };

      // Send email
      const mailOptions = {
        from: `${APP_NAME} <${gmailEmail}>`,
        to: userEmail,
        subject: `Mise à jour de votre commande #${orderId.slice(-8).toUpperCase()}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a1a2e;">Bonjour,</h2>
            <p>Le statut de votre commande a été mis à jour.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1a1a2e; margin-top: 0;">Détails de la commande</h3>
              <p><strong>Numéro de commande:</strong> #${orderId.slice(-8).toUpperCase()}</p>
              <p><strong>Ancien statut:</strong> ${getStatusLabel(previousStatus)}</p>
              <p><strong>Nouveau statut:</strong> <span style="color: #1a1a2e; font-weight: bold;">${getStatusLabel(newStatus)}</span></p>
            </div>
            
            <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #27ae60;">
              <p style="margin: 0;">${statusMessages[newStatus] || 'Le statut de votre commande a changé.'}</p>
            </div>
            
            <p>Vous pouvez suivre l'avancement de votre commande sur notre site.</p>
            
            <p style="margin-top: 30px;">
              Merci,<br>
              L'équipe ${APP_NAME}
            </p>
          </div>
        `
      };

      await mailTransport.sendMail(mailOptions);
      console.log('Status update email sent to:', userEmail);

      return null;
    } catch (error) {
      console.error('Error sending status update email:', error);
      return null;
    }
  });
