import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
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
    let verificationEmailSent = false;

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

    try {
      // Firebase Auth built-in verification email (no paid external API required).
      await sendEmailVerification(user);
      verificationEmailSent = true;
    } catch (verificationError) {
      console.error('Error sending verification email:', verificationError);
    }

    // Do not keep new users logged in until they verify their email.
    await signOut(auth);

    return {
      success: true,
      user,
      verificationEmailSent,
      requiresEmailVerification: true
    };
  } catch (error) {
    console.error('Error signing up:', error);
    return { 
      success: false, 
      error: getErrorMessage(error.code),
      errorCode: error.code
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
    const user = userCredential.user;

    try {
      await user.reload();
    } catch (reloadError) {
      console.error('Error reloading user profile after sign-in:', reloadError);
    }

    if (!user.emailVerified) {
      await signOut(auth);
      return {
        success: false,
        error: getErrorMessage('auth/email-not-verified'),
        errorCode: 'auth/email-not-verified'
      };
    }

    return { success: true, user };
  } catch (error) {
    console.error('Error signing in:', error);
    return { 
      success: false, 
      error: getErrorMessage(error.code),
      errorCode: error.code
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
      error: getErrorMessage(error.code),
      errorCode: error.code
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
      error: getErrorMessage(error.code),
      errorCode: error.code
    };
  }
};

/**
 * Resend account verification email.
 * Requires user credentials to authenticate before sending verification email.
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<object>} - Result object
 */
export const resendVerificationEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const { user } = userCredential;

    try {
      await user.reload();
    } catch (reloadError) {
      console.error('Error reloading user profile before resending verification:', reloadError);
    }

    if (user.emailVerified) {
      await signOut(auth);
      return {
        success: false,
        error: getErrorMessage('auth/email-already-verified'),
        errorCode: 'auth/email-already-verified'
      };
    }

    await sendEmailVerification(user);
    await signOut(auth);

    return { success: true };
  } catch (error) {
    console.error('Error resending verification email:', error);
    return {
      success: false,
      error: getErrorMessage(error.code),
      errorCode: error.code
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
    'auth/email-not-verified': 'Veuillez confirmer votre adresse email avant de vous connecter. Consultez votre boite de reception et vos spams.',
    'auth/email-already-verified': 'Votre adresse email est deja confirmee. Vous pouvez vous connecter.',
    'auth/too-many-requests': 'Trop de tentatives. Veuillez réessayer plus tard.',
    'auth/requires-recent-login': 'Veuillez vous reconnecter pour effectuer cette action.',
    'auth/network-request-failed': 'Erreur de connexion. Vérifiez votre connexion internet.'
  };

  return errorMessages[errorCode] || 'Une erreur est survenue. Veuillez réessayer.';
};

const authService = {
  signUp,
  signIn,
  logOut,
  resetPassword,
  resendVerificationEmail,
  subscribeToAuthChanges,
  getCurrentUser
};

export default authService;
