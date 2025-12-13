import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Rider, Delivery } from '../data/riderData';
import { riderData as initialRiderData, deliveryData as initialDeliveryData } from '../data/riderData';

interface RiderContextType {
    // Rider authentication
    currentRider: Rider | null;
    isAuthenticated: boolean;
    login: (registrationNumber: string, password: string) => boolean;
    logout: () => void;

    // Rider management
    riders: Rider[];
    addRider: (rider: Omit<Rider, 'id' | 'totalDeliveries' | 'totalEarnings' | 'currentBalance' | 'createdAt' | 'lastActive'>) => void;
    updateRider: (id: string, updates: Partial<Rider>) => void;
    deleteRider: (id: string) => void;

    // Delivery management
    deliveries: Delivery[];
    activeDelivery: Delivery | null;
    assignDelivery: (deliveryId: string, riderId: string) => void;
    pickupDelivery: (deliveryId: string, verificationCode: string) => boolean;
    completeDelivery: (deliveryId: string, customerCode: string) => boolean;
    cancelDelivery: (deliveryId: string) => void;

    // Rider stats
    getRiderStats: (riderId: string) => {
        totalDeliveries: number;
        totalEarnings: number;
        currentBalance: number;
    };
}

const RiderContext = createContext<RiderContextType | undefined>(undefined);

export const RiderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [riders, setRiders] = useState<Rider[]>(() => {
        const saved = localStorage.getItem('riders');
        return saved ? JSON.parse(saved) : initialRiderData;
    });

    const [deliveries, setDeliveries] = useState<Delivery[]>(() => {
        const saved = localStorage.getItem('deliveries');
        return saved ? JSON.parse(saved) : initialDeliveryData;
    });

    const [currentRider, setCurrentRider] = useState<Rider | null>(() => {
        const saved = localStorage.getItem('currentRider');
        return saved ? JSON.parse(saved) : null;
    });

    const [activeDelivery, setActiveDelivery] = useState<Delivery | null>(null);

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem('riders', JSON.stringify(riders));
    }, [riders]);

    useEffect(() => {
        localStorage.setItem('deliveries', JSON.stringify(deliveries));
    }, [deliveries]);

    useEffect(() => {
        if (currentRider) {
            localStorage.setItem('currentRider', JSON.stringify(currentRider));
            // Update active delivery
            const active = deliveries.find(d => d.riderId === currentRider.id && d.status === 'in_transit');
            setActiveDelivery(active || null);
        } else {
            localStorage.removeItem('currentRider');
            setActiveDelivery(null);
        }
    }, [currentRider, deliveries]);

    const login = (registrationNumber: string, password: string): boolean => {
        // Simple authentication (in production, use proper backend authentication)
        const rider = riders.find(r => r.registrationNumber === registrationNumber && r.status === 'active');
        if (rider) {
            setCurrentRider(rider);
            // Update last active
            updateRider(rider.id, { lastActive: new Date().toISOString() });
            return true;
        }
        return false;
    };

    const logout = () => {
        setCurrentRider(null);
    };

    const addRider = (riderData: Omit<Rider, 'id' | 'totalDeliveries' | 'totalEarnings' | 'currentBalance' | 'createdAt' | 'lastActive'>) => {
        const newRider: Rider = {
            ...riderData,
            id: `rider-${Date.now()}`,
            totalDeliveries: 0,
            totalEarnings: 0,
            currentBalance: 0,
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
        };
        setRiders([...riders, newRider]);
    };

    const updateRider = (id: string, updates: Partial<Rider>) => {
        setRiders(riders.map(r => r.id === id ? { ...r, ...updates } : r));
        if (currentRider?.id === id) {
            setCurrentRider({ ...currentRider, ...updates });
        }
    };

    const deleteRider = (id: string) => {
        setRiders(riders.filter(r => r.id !== id));
    };

    const assignDelivery = (deliveryId: string, riderId: string) => {
        setDeliveries(deliveries.map(d =>
            d.id === deliveryId ? { ...d, riderId, status: 'assigned' as const } : d
        ));
    };

    const pickupDelivery = (deliveryId: string, verificationCode: string): boolean => {
        const delivery = deliveries.find(d => d.id === deliveryId);
        if (delivery && delivery.verificationCode === verificationCode) {
            setDeliveries(deliveries.map(d =>
                d.id === deliveryId
                    ? { ...d, status: 'in_transit' as const, pickupTime: new Date().toISOString() }
                    : d
            ));
            return true;
        }
        return false;
    };

    const completeDelivery = (deliveryId: string, customerCode: string): boolean => {
        const delivery = deliveries.find(d => d.id === deliveryId);
        if (delivery && delivery.customerConfirmationCode === customerCode) {
            setDeliveries(deliveries.map(d =>
                d.id === deliveryId
                    ? { ...d, status: 'delivered' as const, deliveryTime: new Date().toISOString() }
                    : d
            ));

            // Update rider stats
            if (delivery.riderId) {
                const rider = riders.find(r => r.id === delivery.riderId);
                if (rider) {
                    updateRider(rider.id, {
                        totalDeliveries: rider.totalDeliveries + 1,
                        totalEarnings: rider.totalEarnings + delivery.riderEarning,
                        currentBalance: rider.currentBalance + delivery.riderEarning,
                    });
                }
            }
            return true;
        }
        return false;
    };

    const cancelDelivery = (deliveryId: string) => {
        setDeliveries(deliveries.map(d =>
            d.id === deliveryId ? { ...d, status: 'cancelled' as const } : d
        ));
    };

    const getRiderStats = (riderId: string) => {
        const rider = riders.find(r => r.id === riderId);
        return {
            totalDeliveries: rider?.totalDeliveries || 0,
            totalEarnings: rider?.totalEarnings || 0,
            currentBalance: rider?.currentBalance || 0,
        };
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
                cancelDelivery,
                getRiderStats,
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
