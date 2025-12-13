/**
 * Generate a unique 6-digit verification code for rider pickup
 */
export const generateVerificationCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generate a unique 6-digit customer confirmation code for delivery
 */
export const generateCustomerConfirmationCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generate QR code data string for delivery
 * Format: DELIVERY-{deliveryId}-{verificationCode}
 */
export const generateQRCodeData = (deliveryId: string, verificationCode: string): string => {
    return `DELIVERY-${deliveryId}-${verificationCode}`;
};

/**
 * Parse QR code data to extract delivery ID and verification code
 */
export const parseQRCodeData = (qrData: string): { deliveryId: string; verificationCode: string } | null => {
    const parts = qrData.split('-');
    if (parts.length === 3 && parts[0] === 'DELIVERY') {
        return {
            deliveryId: parts[1],
            verificationCode: parts[2],
        };
    }
    return null;
};

/**
 * Verify if a code matches the expected format (6 digits)
 */
export const isValidCode = (code: string): boolean => {
    return /^\d{6}$/.test(code);
};
