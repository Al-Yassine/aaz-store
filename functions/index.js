const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');

// Initialize Firebase Admin
admin.initializeApp();

// Configure nodemailer transporter
// You should set these configuration values in Firebase environment config:
// firebase functions:config:set gmail.email="your-email@gmail.com" gmail.password="your-app-password"
const gmailEmail = functions.config().gmail?.email || process.env.GMAIL_EMAIL;
const gmailPassword = functions.config().gmail?.password || process.env.GMAIL_PASSWORD;
const sendGridApiKey = functions.config().sendgrid?.key || process.env.SENDGRID_API_KEY;
const sendGridFromEmail = functions.config().sendgrid?.from_email || process.env.SENDGRID_FROM_EMAIL;
const storeAdminEmail = functions.config().store?.admin_email || process.env.STORE_ADMIN_EMAIL;
const dashboardBaseUrl = functions.config().store?.dashboard_url || process.env.STORE_DASHBOARD_URL;

const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailEmail,
    pass: gmailPassword
  }
});

// App name for emails
const APP_NAME = 'AAZ Store';

if (sendGridApiKey) {
  sgMail.setApiKey(sendGridApiKey);
}

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

function getOrderDisplayNumber(order, orderId) {
  if (typeof orderId === 'string' && orderId.trim()) {
    return orderId.trim().slice(-8).toUpperCase();
  }
  if (order && typeof order.orderNumber === 'string' && order.orderNumber.trim()) {
    return order.orderNumber.trim();
  }
  return 'N/A';
}

function escapeHtml(value) {
  return (value || '')
    .toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function toSingleLineText(value) {
  return (value || '').toString().trim().replace(/\s+/g, ' ');
}

function getMessageDashboardLink(messageId) {
  if (!dashboardBaseUrl) {
    return '';
  }

  const normalizedBase = dashboardBaseUrl.endsWith('/')
    ? dashboardBaseUrl.slice(0, -1)
    : dashboardBaseUrl;

  return `${normalizedBase}/admin/dashboard?messageId=${encodeURIComponent(messageId)}`;
}

async function sendMailWithFallback({ to, subject, html, text }) {
  if (sendGridApiKey) {
    const fromEmail = sendGridFromEmail || gmailEmail;
    if (!fromEmail) {
      throw new Error('Missing sender email for SendGrid. Configure SENDGRID_FROM_EMAIL or GMAIL_EMAIL.');
    }

    await sgMail.send({
      to,
      from: fromEmail,
      subject,
      html,
      text
    });

    return 'sendgrid';
  }

  if (!gmailEmail || !gmailPassword) {
    throw new Error('No email provider configured. Add SendGrid key or Gmail credentials.');
  }

  await mailTransport.sendMail({
    from: `${APP_NAME} <${gmailEmail}>`,
    to,
    subject,
    html,
    text
  });

  return 'gmail';
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
    const orderNumber = getOrderDisplayNumber(order, orderId);
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
      subject: `Confirmation de votre commande ${orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a2e;">Bonjour,</h2>
          <p>Merci pour votre commande sur ${APP_NAME} !</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1a1a2e; margin-top: 0;">Détails de la commande</h3>
            <p><strong>Numéro de commande:</strong> ${orderNumber}</p>
            <p><strong>Date:</strong> ${formatDate(order.createdAt)}</p>
            <p><strong>Statut:</strong> ${getStatusLabel(order.status)}</p>
            <p><strong>Méthode de paiement:</strong> ${getPaymentMethodLabel(order.paymentMethod)}</p>
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
    const orderNumber = getOrderDisplayNumber(order, orderId);
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
      subject: `Mise a jour de votre commande ${orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a2e;">Bonjour,</h2>
          <p>Le statut de votre commande a été mis à jour.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1a1a2e; margin-top: 0;">Détails de la commande</h3>
            <p><strong>Numéro de commande:</strong> ${orderNumber}</p>
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
 * Send contact message notification email to store admin.
 * Callable from client-side after a contact message is saved.
 */
exports.sendContactMessageNotification = functions.https.onCall(async (data) => {
  const messageId = typeof data?.messageId === 'string' ? data.messageId.trim() : '';

  if (!messageId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Message ID is required.'
    );
  }

  try {
    const messageRef = admin.firestore().collection('contactMessages').doc(messageId);
    const messageDoc = await messageRef.get();

    if (!messageDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Contact message not found.');
    }

    const messageData = messageDoc.data() || {};

    if (messageData.notificationSentAt) {
      return { success: true, skipped: true };
    }

    const recipient = storeAdminEmail || gmailEmail;
    if (!recipient) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Admin recipient email is not configured.'
      );
    }

    const senderName = toSingleLineText(messageData.name) || 'N/A';
    const senderEmail = toSingleLineText(messageData.email) || 'N/A';
    const subject = toSingleLineText(messageData.subject) || 'Sans sujet';
    const rawMessage = (messageData.message || '').toString().trim() || 'N/A';
    const createdAtLabel = formatDate(messageData.createdAt);
    const dashboardLink = getMessageDashboardLink(messageId);

    const htmlMessageBody = escapeHtml(rawMessage).replace(/\n/g, '<br>');
    const htmlDashboardBlock = dashboardLink
      ? `<p><strong>Ouvrir dans le dashboard:</strong> <a href="${escapeHtml(dashboardLink)}">Voir le message</a></p>`
      : '<p><strong>Dashboard link:</strong> Non configure (STORE_DASHBOARD_URL manquant)</p>';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #1f2937;">
        <h2 style="margin-bottom: 8px; color: #111827;">Nouveau message client</h2>
        <p style="margin-top: 0; color: #4b5563;">Un client a envoye un nouveau message via la page Contact.</p>

        <div style="background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; margin: 18px 0;">
          <p><strong>ID message:</strong> ${escapeHtml(messageId)}</p>
          <p><strong>Date:</strong> ${escapeHtml(createdAtLabel)}</p>
          <p><strong>Nom:</strong> ${escapeHtml(senderName)}</p>
          <p><strong>Email:</strong> ${escapeHtml(senderEmail)}</p>
          <p><strong>Sujet:</strong> ${escapeHtml(subject)}</p>
          ${htmlDashboardBlock}
        </div>

        <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px;">
          <h3 style="margin-top: 0; margin-bottom: 10px; color: #111827;">Message</h3>
          <p style="line-height: 1.6; margin: 0; white-space: normal;">${htmlMessageBody}</p>
        </div>
      </div>
    `;

    const textLines = [
      'Nouveau message client',
      '',
      `ID message: ${messageId}`,
      `Date: ${createdAtLabel}`,
      `Nom: ${senderName}`,
      `Email: ${senderEmail}`,
      `Sujet: ${subject}`,
      dashboardLink ? `Dashboard: ${dashboardLink}` : 'Dashboard: STORE_DASHBOARD_URL non configure',
      '',
      'Message:',
      rawMessage
    ];

    const provider = await sendMailWithFallback({
      to: recipient,
      subject: `[${APP_NAME}] Nouveau message client: ${subject}`,
      html: htmlContent,
      text: textLines.join('\n')
    });

    await messageRef.set(
      {
        notificationSentAt: admin.firestore.FieldValue.serverTimestamp(),
        notificationProvider: provider,
        notificationRecipient: recipient
      },
      { merge: true }
    );

    return { success: true, provider };
  } catch (error) {
    console.error('Error sending contact notification email:', error);

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      'internal',
      'Failed to send contact notification email.'
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
    const orderNumber = getOrderDisplayNumber(order, orderId);

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
        subject: `Confirmation de votre commande ${orderNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a1a2e;">Bonjour,</h2>
            <p>Merci pour votre commande sur ${APP_NAME} !</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1a1a2e; margin-top: 0;">Détails de la commande</h3>
              <p><strong>Numéro de commande:</strong> ${orderNumber}</p>
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
      const orderNumber = getOrderDisplayNumber(order, orderId);
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
        subject: `Mise a jour de votre commande ${orderNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a1a2e;">Bonjour,</h2>
            <p>Le statut de votre commande a été mis à jour.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1a1a2e; margin-top: 0;">Détails de la commande</h3>
              <p><strong>Numéro de commande:</strong> ${orderNumber}</p>
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
