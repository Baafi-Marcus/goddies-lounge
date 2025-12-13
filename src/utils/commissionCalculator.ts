import { locations } from '../data/locations';

/**
 * Calculate commission percentage based on delivery location
 * Commission tiers based on distance/location:
 * - Tier 1 (nearby): 0.1%
 * - Tier 2 (medium): 0.5%
 * - Tier 3 (far): 1%
 * - Tier 4 (very far): 2%
 * - Tier 5 (extremely far): 5%
 */
export const calculateCommission = (locationId: string, deliveryFee: number): number => {
    const location = locations.find(loc => loc.id === locationId);

    if (!location) {
        return deliveryFee * 0.01; // Default 1% if location not found
    }

    // Commission based on delivery fee (which correlates with distance)
    let commissionRate = 0.001; // 0.1% default

    if (deliveryFee >= 100) {
        commissionRate = 0.05; // 5% for very expensive deliveries (far locations)
    } else if (deliveryFee >= 70) {
        commissionRate = 0.02; // 2%
    } else if (deliveryFee >= 50) {
        commissionRate = 0.01; // 1%
    } else if (deliveryFee >= 30) {
        commissionRate = 0.005; // 0.5%
    } else {
        commissionRate = 0.001; // 0.1%
    }

    const commission = deliveryFee * commissionRate;
    return Math.round(commission * 100) / 100; // Round to 2 decimal places
};

/**
 * Calculate rider earnings after commission deduction
 */
export const calculateRiderEarning = (deliveryFee: number, commission: number): number => {
    return Math.round((deliveryFee - commission) * 100) / 100;
};
