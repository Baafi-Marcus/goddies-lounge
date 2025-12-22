import { v4 as uuidv4 } from 'uuid';

export interface Rider {
    id: string;
    registrationNumber: string;
    name: string;
    phone: string;
    email: string;
    vehicleType: 'motorcycle' | 'bicycle' | 'car';
    vehicleNumber: string;
    status: 'active' | 'inactive' | 'suspended';
    totalDeliveries: number;
    totalEarnings: number;
    currentBalance: number;
    createdAt: string;
    lastActive: string;
    paymentPreference?: 'momo' | 'cash';
    momoNumber?: string;
}

export interface Delivery {
    id: string;
    orderId: string;
    riderId: string | null;
    customerName: string;
    customerPhone: string;
    pickupTime: string | null;
    deliveryTime: string | null;
    status: 'pending' | 'offered' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
    location: string;
    locationId: string;
    deliveryAddress: string;
    deliveryFee: number;
    commission: number;
    riderEarning: number;
    qrCode: string;
    verificationCode: string;
    customerConfirmationCode: string;
    orderTotal: number;
    orderItems: string;
    cashSettledByRider?: boolean;
    earningPaidByAdmin?: boolean;
    orderPaymentMethod?: string;
    riderPaymentPreference?: string;
}

// Sample rider data
export const riderData: Rider[] = [
    {
        id: uuidv4(),
        registrationNumber: 'RDR001',
        name: 'Kwame Mensah',
        phone: '0244123456',
        email: 'kwame@example.com',
        vehicleType: 'motorcycle',
        vehicleNumber: 'GR-1234-20',
        status: 'active',
        totalDeliveries: 45,
        totalEarnings: 450.00,
        currentBalance: 450.00,
        createdAt: new Date('2024-01-15').toISOString(),
        lastActive: new Date().toISOString(),
    },
    {
        id: uuidv4(),
        registrationNumber: 'RDR002',
        name: 'Ama Osei',
        phone: '0201234567',
        email: 'ama@example.com',
        vehicleType: 'motorcycle',
        vehicleNumber: 'GR-5678-21',
        status: 'active',
        totalDeliveries: 32,
        totalEarnings: 320.00,
        currentBalance: 320.00,
        createdAt: new Date('2024-02-01').toISOString(),
        lastActive: new Date().toISOString(),
    },
];

// Sample delivery data
export const deliveryData: Delivery[] = [];
