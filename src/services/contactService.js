import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { functions, firestore } from '../firebase';

const CONTACT_MESSAGES_COLLECTION = 'contactMessages';

const shouldSkipNotificationInDevelopment =
  process.env.NODE_ENV === 'development' &&
  process.env.REACT_APP_ENABLE_CONTACT_NOTIFICATION !== 'true';

export const CONTACT_MESSAGE_STATUS = {
  NEW: 'new',
  READ: 'read',
  RESOLVED: 'resolved'
};

const sanitizeValue = (value) => (value || '').toString().trim();

const isValidStatus = (status) => Object.values(CONTACT_MESSAGE_STATUS).includes(status);

const isNonBlockingNotificationError = (error) => {
  const message = (error?.message || '').toString().toLowerCase();
  const code = (error?.code || '').toString().toLowerCase();

  return (
    message.includes('failed to fetch') ||
    message.includes('cors') ||
    message.includes('network') ||
    message.includes('preflight') ||
    code.includes('functions/not-found') ||
    code.includes('functions/unavailable')
  );
};

export const createContactMessage = async ({ name, email, subject, message }) => {
  try {
    const payload = {
      name: sanitizeValue(name),
      email: sanitizeValue(email),
      subject: sanitizeValue(subject),
      message: sanitizeValue(message),
      createdAt: serverTimestamp(),
      status: CONTACT_MESSAGE_STATUS.NEW
    };

    const docRef = await addDoc(collection(firestore, CONTACT_MESSAGES_COLLECTION), payload);

    return {
      success: true,
      messageId: docRef.id
    };
  } catch (error) {
    console.error('Error creating contact message:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const sendContactMessageNotification = async (messageId) => {
  try {
    if (!messageId) {
      return {
        success: false,
        error: 'Message ID is required'
      };
    }

    if (shouldSkipNotificationInDevelopment) {
      return {
        success: true,
        skipped: true,
        reason: 'Contact notification is disabled in local development.'
      };
    }

    const callable = httpsCallable(functions, 'sendContactMessageNotification');
    await callable({ messageId });

    return { success: true };
  } catch (error) {
    if (isNonBlockingNotificationError(error)) {
      console.warn('Contact message notification unavailable (non-blocking):', error);
      return {
        success: false,
        nonBlocking: true,
        error: error.message,
        errorCode: error.code || ''
      };
    }

    console.error('Error sending contact message notification:', error);
    return {
      success: false,
      error: error.message,
      errorCode: error.code || ''
    };
  }
};

export const getAllContactMessages = async () => {
  try {
    const messagesRef = collection(firestore, CONTACT_MESSAGES_COLLECTION);
    const q = query(messagesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const messages = [];

    querySnapshot.forEach((messageDoc) => {
      messages.push({ id: messageDoc.id, ...messageDoc.data() });
    });

    return {
      success: true,
      data: messages
    };
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const updateContactMessageStatus = async (messageId, status) => {
  try {
    if (!messageId) {
      return {
        success: false,
        error: 'Message ID is required'
      };
    }

    if (!isValidStatus(status)) {
      return {
        success: false,
        error: 'Invalid contact message status'
      };
    }

    const messageRef = doc(firestore, CONTACT_MESSAGES_COLLECTION, messageId);
    await updateDoc(messageRef, { status });

    return { success: true };
  } catch (error) {
    console.error('Error updating contact message status:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

