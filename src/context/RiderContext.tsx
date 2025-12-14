import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Rider, Delivery } from '../data/riderData';
import { RiderService, DeliveryService } from '../services/neon';
import { updateRiderLocation } from '../services/firebase';

interface RiderContextType {
    // Rider authentication
    currentRider: Rider | null;
    isAuthenticated: boolean;
    login: (registrationNumber: string, password: string) => Promise<boolean>;
    logout: () => void;

    // Rider management
    riders: Rider[];
    addRider: (rider: any) => Promise<void>;
    updateRider: (id: string, updates: Partial<Rider>) => Promise<void>;
    deleteRider: (id: string) => Promise<void>;

    // Delivery management
    deliveries: Delivery[];
    activeDelivery: Delivery | null;
    assignDelivery: (deliveryId: string, riderId: string) => Promise<void>;
    pickupDelivery: (deliveryId: string, verificationCode: string) => Promise<boolean>;
    completeDelivery: (deliveryId: string, customerCode: string) => Promise<boolean>;

    // Rider stats
    loadRiderStats: (riderId: string) => Promise<void>;
}

const RiderContext = createContext<RiderContextType | undefined>(undefined);

export const RiderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [riders, setRiders] = useState<Rider[]>([]);
    const [deliveries, setDeliveries] = useState<Delivery[]>([]);
    const [currentRider, setCurrentRider] = useState<Rider | null>(() => {
        const saved = localStorage.getItem('currentRider');
        return saved ? JSON.parse(saved) : null;
    });

    const [activeDelivery, setActiveDelivery] = useState<Delivery | null>(null);

    // Initial Data Fetch
    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 30000); // Polling every 30s for updates
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        // Fetch Riders
        try {
            const fetchedRiders = await RiderService.getAllRiders();
            // @ts-ignore
            setRiders(fetchedRiders);
        } catch (error) {
            console.error('Failed to load riders:', error);
        }

        // Fetch Deliveries
        try {
            const fetchedDeliveries = await DeliveryService.getAllDeliveries();
            // @ts-ignore
            setDeliveries(fetchedDeliveries);
        } catch (error) {
            console.error('Failed to load deliveries:', error);
        }
    };

    // Tracking Active Delivery
    useEffect(() => {
        if (currentRider) {
            // Find active delivery from fetched deliveries
            const active = deliveries.find(d => d.riderId === currentRider.id && (d.status === 'assigned' || d.status === 'in_transit'));
            setActiveDelivery(active || null);
            localStorage.setItem('currentRider', JSON.stringify(currentRider));

            // Sync location to Firebase if in transit (Mocking GPS for now)
            if (active && active.status === 'in_transit') {
                updateRiderLocation(currentRider.id, {
                    lat: 5.6037 + (Math.random() * 0.01),
                    lng: -0.1870 + (Math.random() * 0.01)
                });
            }
        } else {
            localStorage.removeItem('currentRider');
            setActiveDelivery(null);
        }
    }, [currentRider, deliveries]);

    const login = async (registrationNumber: string, _password: string): Promise<boolean> => {
        try {
            // 1. Get rider details including user info
            const riderText = await RiderService.getRiderByRegistration(registrationNumber);

            // 2. Mock password check (Since we don't expose password_hash for security, 
            // typically detailed auth should be done via proper API. 
            // For this direct DB demo, we will check against the result if we extracted hash, 
            // OR simpler: we rely on data existence + local check if we had the hash.
            // But wait, getAllRiders JOIN doesn't select password_hash.
            // Let's assume for MVP: if rider exists, we log them in. 
            // TODO: Implement proper auth service.

            if (riderText) {
                // @ts-ignore
                setCurrentRider(riderText);
                return true;
            }
        } catch (e) {
            console.error(e);
        }
        return false;
    };

    const logout = () => {
        setCurrentRider(null);
    };

    const addRider = async (riderData: any) => {
        await RiderService.createRider(riderData);
        await loadData();
    };

    const updateRider = async (id: string, updates: Partial<Rider>) => {
        await RiderService.updateRider(id, updates);
        await loadData();
        if (currentRider?.id === id) {
            // @ts-ignore
            setCurrentRider({ ...currentRider, ...updates });
        }
    };

    const deleteRider = async (id: string) => {
        await RiderService.deleteRider(id);
        await loadData();
    };

    const assignDelivery = async (deliveryId: string, riderId: string) => {
        await DeliveryService.assignRider(deliveryId, riderId);
        await loadData();
    };

    const pickupDelivery = async (deliveryId: string, verificationCode: string): Promise<boolean> => {
        const delivery = deliveries.find(d => d.id === deliveryId);
        if (delivery && delivery.verificationCode === verificationCode) {
            await DeliveryService.pickupDelivery(deliveryId);
            await loadData();
            return true;
        }
        return false;
    };

    const completeDelivery = async (deliveryId: string, customerCode: string): Promise<boolean> => {
        const delivery = deliveries.find(d => d.id === deliveryId);
        if (delivery && delivery.customerConfirmationCode === customerCode) {
            const earning = delivery.riderEarning;
            await DeliveryService.completeDelivery(deliveryId, delivery.riderId!, earning);
            await loadData();
            return true;
        }
        return false;
    };

    const loadRiderStats = async (_riderId: string) => {
        // Stats are updated in real-time via loadData() polling on the 'riders' table
        // But if we needed specific aggregations, we'd call a service here.
        await loadData();
    };

    return (
        <RiderContext.Provider
            value={{
                currentRider,
                isAuthenticated: !!currentRider,
                login,
                logout,
                riders,
                addRider,
                updateRider,
                deleteRider,
                deliveries,
                activeDelivery,
                assignDelivery,
                pickupDelivery,
                completeDelivery,
                loadRiderStats,
            }}
        >
            {children}
        </RiderContext.Provider>
    );
};

export const useRider = () => {
    const context = useContext(RiderContext);
    if (!context) {
        throw new Error('useRider must be used within a RiderProvider');
    }
    return context;
};
