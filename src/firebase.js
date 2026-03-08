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

const getEnv = (key) => {
  return sanitizeEnvValue(process.env[key]);
};


const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

let app = null;
let auth = null;
let firestore = null;
let functions = null;
let firebaseInitError = null;

try {
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
    message: error?.message || ''
  });
}

const isFirebaseReady = Boolean(app && auth && firestore && functions);

export { app, auth, firestore, functions, firebaseInitError, isFirebaseReady };
