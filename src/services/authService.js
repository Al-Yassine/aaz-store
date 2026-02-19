import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase';
import { createUserDocument } from './userService';

/**
 * Sign up a new user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {object} additionalData - Additional user data (name, phone)
 * @returns {Promise<object>} - User credential
 */
export const signUp = async (email, password, additionalData = {}) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { user } = userCredential;

    // Update profile with display name
    if (additionalData.name) {
      await updateProfile(user, {
        displayName: additionalData.name
      });
    }

    // Create user document in Firestore
    await createUserDocument(user.uid, {
      email: user.email,
      name: additionalData.name || '',
      phone: additionalData.phone || '',
      role: 'customer',
      createdAt: new Date().toISOString()
    });

    return { success: true, user };
  } catch (error) {
    console.error('Error signing up:', error);
    return { 
      success: false, 
      error: getErrorMessage(error.code) 
    };
  }
};

/**
 * Sign in an existing user
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<object>} - User credential
 */
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Error signing in:', error);
    return { 
      success: false, 
      error: getErrorMessage(error.code) 
    };
  }
};

/**
 * Sign out the current user
 * @returns {Promise<object>} - Result object
 */
export const logOut = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return { 
      success: false, 
      error: getErrorMessage(error.code) 
    };
  }
};

/**
 * Send password reset email
 * @param {string} email - User's email
 * @returns {Promise<object>} - Result object
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error('Error resetting password:', error);
    return { 
      success: false, 
      error: getErrorMessage(error.code) 
    };
  }
};

/**
 * Subscribe to auth state changes
 * @param {function} callback - Callback function
 * @returns {function} - Unsubscribe function
 */
export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Get current user
 * @returns {object|null} - Current user or null
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Translate Firebase error codes to user-friendly French messages
 * @param {string} errorCode - Firebase error code
 * @returns {string} - User-friendly error message
 */
const getErrorMessage = (errorCode) => {
  const errorMessages = {
    'auth/email-already-in-use': 'Cette adresse email est déjà utilisée.',
    'auth/invalid-email': 'Adresse email invalide.',
    'auth/operation-not-allowed': 'Opération non autorisée.',
    'auth/weak-password': 'Le mot de passe est trop faible. Il doit contenir au moins 6 caractères.',
    'auth/user-disabled': 'Ce compte a été désactivé.',
    'auth/user-not-found': 'Aucun compte trouvé avec cette adresse email.',
    'auth/wrong-password': 'Mot de passe incorrect.',
    'auth/invalid-credential': 'Email ou mot de passe incorrect.',
    'auth/too-many-requests': 'Trop de tentatives. Veuillez réessayer plus tard.',
    'auth/requires-recent-login': 'Veuillez vous reconnecter pour effectuer cette action.',
    'auth/network-request-failed': 'Erreur de connexion. Vérifiez votre connexion internet.'
  };

  return errorMessages[errorCode] || 'Une erreur est survenue. Veuillez réessayer.';
};

export default {
  signUp,
  signIn,
  logOut,
  resetPassword,
  subscribeToAuthChanges,
  getCurrentUser
};
