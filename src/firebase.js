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

// Firebase configuration for AAZ Store
// Project: aazstore-71de7
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDemoKeyForDevelopmentOnly",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "aazstore-71de7.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "aazstore-71de7",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "aazstore-71de7.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:123456789:web:abcdef123456",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-XXXXXXXXXX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const firestore = getFirestore(app);
const functions = getFunctions(app, 'us-central1');

// Connect to emulators in development (optional)
if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(firestore, 'localhost', 8080);
  connectFunctionsEmulator(functions, 'localhost', 5001);
}

export { app, auth, firestore, functions };
