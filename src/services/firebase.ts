import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, update } from 'firebase/database';

// TODO: Replace with your Firebase project configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);

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
