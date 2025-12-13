import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithPhoneNumber,
    RecaptchaVerifier,
    PhoneAuthProvider,
    updateProfile,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    linkWithCredential,
    EmailAuthProvider
} from 'firebase/auth';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL
};

const app = initializeApp(firebaseConfig);

export const database = getDatabase(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const emailProvider = new EmailAuthProvider();

export {
    signInWithPopup,
    signInWithPhoneNumber,
    RecaptchaVerifier,
    PhoneAuthProvider,
    updateProfile,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    linkWithCredential,
    EmailAuthProvider
};

// Helper to update rider location
export const updateRiderLocation = (riderId: string, location: { lat: number; lng: number }) => {
    const riderRef = ref(database, `riders/${riderId}`);
    return update(riderRef, {
        location,
        lastUpdated: Date.now()
    });
};

// Helper to subscribe to delivery updates
export const subscribeToDelivery = (deliveryId: string, callback: (data: any) => void) => {
    const deliveryRef = ref(database, `active_deliveries/${deliveryId}`);
    return onValue(deliveryRef, (snapshot) => {
        const data = snapshot.val();
        if (data) callback(data);
    });
};
