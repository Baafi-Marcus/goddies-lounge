import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, update } from 'firebase/database';
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
    apiKey: "AIzaSyAqJgYdNQxD9JFCD3dDA_eGZwHIivmL__w",
    authDomain: "goddies-lounge.firebaseapp.com",
    projectId: "goddies-lounge",
    storageBucket: "goddies-lounge.firebasestorage.app",
    messagingSenderId: "386661338162",
    appId: "1:386661338162:web:763adfe3ce4a53113a802b",
    measurementId: "G-0DCPDM1ZEX",
    databaseURL: "https://goddies-lounge-default-rtdb.firebaseio.com"
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
