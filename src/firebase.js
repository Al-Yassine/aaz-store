import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  connectAuthEmulator 
} from 'firebase/auth';
import { 
  getFirestore, 
  connectFirestoreEmulator 
} from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const sanitizeEnvValue = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().replace(/^['"]|['"]$/g, '');
};

const UTF8_BOM = String.fromCharCode(0xfeff);

const getEnv = (key) => {
  return sanitizeEnvValue(process.env[key] || process.env[`${UTF8_BOM}${key}`]);
};

const getFirebaseEnv = (reactAppKey, fallbackKey) => {
  return getEnv(reactAppKey) || getEnv(fallbackKey);
};

const createFirebaseInitError = (code, message) => {
  const error = new Error(message);
  error.code = code;
  return error;
};

const maskValue = (value) => {
  if (!value) {
    return '(missing)';
  }

  if (value.length <= 10) {
    return `${value.slice(0, 2)}...`;
  }

  return `${value.slice(0, 6)}...${value.slice(-4)}`;
};

const looksLikeFirebaseApiKey = (value) => {
  return /^AIza[A-Za-z0-9_-]{20,}$/.test(value);
};

const hasSuspiciousApiKeyValue = (value) => {
  if (!value) {
    return false;
  }

  return value.startsWith('REACT_APP_') || value.includes('${');
};

const firebaseConfig = {
  apiKey: getFirebaseEnv('REACT_APP_FIREBASE_API_KEY', 'FIREBASE_API_KEY'),
  authDomain: getFirebaseEnv('REACT_APP_FIREBASE_AUTH_DOMAIN', 'FIREBASE_AUTH_DOMAIN'),
  projectId: getFirebaseEnv('REACT_APP_FIREBASE_PROJECT_ID', 'FIREBASE_PROJECT_ID'),
  storageBucket: getFirebaseEnv('REACT_APP_FIREBASE_STORAGE_BUCKET', 'FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getFirebaseEnv('REACT_APP_FIREBASE_MESSAGING_SENDER_ID', 'FIREBASE_MESSAGING_SENDER_ID'),
  appId: getFirebaseEnv('REACT_APP_FIREBASE_APP_ID', 'FIREBASE_APP_ID'),
  measurementId: getFirebaseEnv('REACT_APP_FIREBASE_MEASUREMENT_ID', 'FIREBASE_MEASUREMENT_ID')
};

const requiredConfigKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missingConfigKeys = requiredConfigKeys.filter((key) => !firebaseConfig[key]);

let app = null;
let auth = null;
let firestore = null;
let functions = null;
let firebaseInitError = null;

try {
  if (missingConfigKeys.length > 0) {
    throw createFirebaseInitError(
      'auth/firebase-init-failed',
      `Missing Firebase config keys: ${missingConfigKeys.join(', ')}`
    );
  }

  if (!looksLikeFirebaseApiKey(firebaseConfig.apiKey) || hasSuspiciousApiKeyValue(firebaseConfig.apiKey)) {
    throw createFirebaseInitError(
      'auth/invalid-api-key',
      'Firebase API key format is invalid. Check REACT_APP_FIREBASE_API_KEY in .env.local and restart npm start.'
    );
  }

  app = initializeApp(firebaseConfig);

  auth = getAuth(app);
  firestore = getFirestore(app);
  functions = getFunctions(app, 'us-central1');

  if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_EMULATORS === 'true') {
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(firestore, 'localhost', 8080);
    connectFunctionsEmulator(functions, 'localhost', 5001);
  }

} catch (error) {
  firebaseInitError = error;

  console.error('[Firebase config] Firebase initialization failed.', {
    code: error?.code || '',
    message: error?.message || '',
    apiKeyPreview: maskValue(firebaseConfig.apiKey),
    missingConfigKeys
  });
}

const isFirebaseReady = Boolean(app && auth && firestore && functions);

export { app, auth, firestore, functions, firebaseInitError, isFirebaseReady };
