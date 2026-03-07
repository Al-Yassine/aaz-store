import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { firestore } from '../firebase';

const USERS_COLLECTION = 'users';

/**
 * Create a new user document in Firestore
 * @param {string} uid - User's unique ID
 * @param {object} userData - User data to store
 * @returns {Promise<object>} - Result object
 */
export const createUserDocument = async (uid, userData) => {
  try {
    const userRef = doc(firestore, USERS_COLLECTION, uid);
    await setDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error creating user document:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

/**
 * Get a user document from Firestore
 * @param {string} uid - User's unique ID
 * @returns {Promise<object>} - User data or error
 */
export const getUserDocument = async (uid) => {
  try {
    const userRef = doc(firestore, USERS_COLLECTION, uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { 
        success: true, 
        data: { id: userSnap.id, ...userSnap.data() } 
      };
    } else {
      return { 
        success: false, 
        error: 'User not found' 
      };
    }
  } catch (error) {
    console.error('Error getting user document:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

/**
 * Update a user document in Firestore
 * @param {string} uid - User's unique ID
 * @param {object} updates - Data to update
 * @returns {Promise<object>} - Result object
 */
export const updateUserDocument = async (uid, updates) => {
  try {
    const userRef = doc(firestore, USERS_COLLECTION, uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating user document:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

/**
 * Check if a user has admin role
 * @param {string} uid - User's unique ID
 * @returns {Promise<boolean>} - True if user is admin
 */
export const isUserAdmin = async (uid) => {
  try {
    const result = await getUserDocument(uid);
    if (result.success) {
      return result.data.role === 'admin';
    }
    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

/**
 * Get user's role
 * @param {string} uid - User's unique ID
 * @returns {Promise<string>} - User's role or 'customer' as default
 */
export const getUserRole = async (uid) => {
  try {
    const result = await getUserDocument(uid);
    if (result.success) {
      return result.data.role || 'customer';
    }
    return 'customer';
  } catch (error) {
    console.error('Error getting user role:', error);
    return 'customer';
  }
};

/**
 * Set user as admin (only callable by existing admin via Cloud Function)
 * This is a client-side helper, actual role change should be done via Cloud Function
 * @param {string} uid - User's unique ID
 * @returns {Promise<object>} - Result object
 */
export const setUserAsAdmin = async (uid) => {
  try {
    const userRef = doc(firestore, USERS_COLLECTION, uid);
    await updateDoc(userRef, {
      role: 'admin',
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error setting user as admin:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

const userService = {
  createUserDocument,
  getUserDocument,
  updateUserDocument,
  isUserAdmin,
  getUserRole,
  setUserAsAdmin
};

export default userService;
