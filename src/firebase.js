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

  // Trim accidental spaces/quotes copied from env dashboards.
  return value.trim().replace(/^['"]|['"]$/g, '');
};

const getEnv = (key, fallback = '') => {
  const value = sanitizeEnvValue(process.env[key]);
  return value || fallback;
};

const apiKeyFromEnv = getEnv('REACT_APP_FIREBASE_API_KEY');
const missingOrPlaceholderApiKeys = new Set([
  '',
  'your_api_key_here',
  'your_api_key'
]);

const fallbackFirebaseConfig = {
  apiKey: 'AIzaSyC60yn8Yvyf8U6wHiqG79OJ6pZCF5w_Tjs',
  authDomain: 'aazstore-71de7.firebaseapp.com',
  projectId: 'aazstore-71de7',
  storageBucket: 'aazstore-71de7.firebasestorage.app',
  messagingSenderId: '935908899228',
  appId: '1:935908899228:web:2e1d8fe86784901e80f059',
  measurementId: 'G-XXXXXXXXXX'
};

// Use canonical Firebase web config values for this project as safe defaults.
// Firebase web SDK keys are public in frontend apps.
const aiZaKeyPattern = /AIza[0-9A-Za-z_-]{30,}/;

const resolveApiKey = (rawValue) => {
  if (missingOrPlaceholderApiKeys.has(rawValue)) {
    return fallbackFirebaseConfig.apiKey;
  }

  const inlineKeyMatch = rawValue.match(aiZaKeyPattern);
  if (inlineKeyMatch) {
    return inlineKeyMatch[0];
  }

  const looksLikeEnvReference = rawValue.startsWith('REACT_APP_') || rawValue.includes('=');
  if (looksLikeEnvReference) {
    console.warn(
      '[Firebase config] REACT_APP_FIREBASE_API_KEY looks malformed (env reference/assignment). Falling back to built-in key.'
    );
    return fallbackFirebaseConfig.apiKey;
  }

  return rawValue;
};

const apiKey = resolveApiKey(apiKeyFromEnv);

if (missingOrPlaceholderApiKeys.has(apiKeyFromEnv)) {
  console.warn(
    '[Firebase config] REACT_APP_FIREBASE_API_KEY is missing/placeholder. Using built-in AAZ Store Firebase project config.'
  );
}

// Firebase configuration for AAZ Store
// Project: aazstore-71de7
const firebaseConfig = {
  apiKey,
  authDomain: getEnv('REACT_APP_FIREBASE_AUTH_DOMAIN', fallbackFirebaseConfig.authDomain),
  projectId: getEnv('REACT_APP_FIREBASE_PROJECT_ID', fallbackFirebaseConfig.projectId),
  storageBucket: getEnv('REACT_APP_FIREBASE_STORAGE_BUCKET', fallbackFirebaseConfig.storageBucket),
  messagingSenderId: getEnv('REACT_APP_FIREBASE_MESSAGING_SENDER_ID', fallbackFirebaseConfig.messagingSenderId),
  appId: getEnv('REACT_APP_FIREBASE_APP_ID', fallbackFirebaseConfig.appId),
  measurementId: getEnv('REACT_APP_FIREBASE_MEASUREMENT_ID', fallbackFirebaseConfig.measurementId)
};

const maskApiKey = (value) => {
  if (!value) {
    return '(empty)';
  }

  if (value.length <= 8) {
    return '***';
  }

  return `${value.slice(0, 4)}...${value.slice(-4)}`;
};

let app = null;
let auth = null;
let firestore = null;
let functions = null;
let firebaseInitError = null;

try {
  // Initialize Firebase and services in one guarded block so invalid config never white-screens the app.
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  firestore = getFirestore(app);
  functions = getFunctions(app, 'us-central1');

  // Connect to emulators in development (optional)
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
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    apiKey: maskApiKey(firebaseConfig.apiKey)
  });
}

const isFirebaseReady = Boolean(app && auth && firestore && functions);

export { app, auth, firestore, functions, firebaseInitError, isFirebaseReady };
