import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRider } from '../../context/RiderContext';
import { FaQrcode, FaKeyboard, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { parseQRCodeData, isValidCode } from '../../utils/qrCodeGenerator';

const PickupVerification: React.FC = () => {
    const navigate = useNavigate();
    const { currentRider, deliveries, pickupDelivery } = useRider();
    const [scanMode, setScanMode] = useState<'qr' | 'manual'>('qr');
    const [manualCode, setManualCode] = useState('');
    const [deliveryId, setDeliveryId] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    React.useEffect(() => {
        if (!currentRider) {
            navigate('/rider/login');
        }
    }, [currentRider, navigate]);

    if (!currentRider) return null;

    const assignedDeliveries = deliveries.filter(
        d => d.riderId === currentRider.id && d.status === 'assigned'
    );

    const handleQRScan = async (decodedText: string) => {
        const parsed = parseQRCodeData(decodedText);
        if (parsed) {
            const success = await pickupDelivery(parsed.deliveryId, parsed.verificationCode);
            if (success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/rider/dashboard');
                }, 2000);
            } else {
                setError('Invalid QR code or delivery not found');
            }
        } else {
            setError('Invalid QR code format');
        }
    };

    const handleManualVerification = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!isValidCode(manualCode)) {
            setError('Verification code must be 6 digits');
            return;
        }

        if (!deliveryId) {
            setError('Please select a delivery');
            return;
        }

        const successResult = await pickupDelivery(deliveryId, manualCode);
        if (successResult) {
            setSuccess(true);
            setTimeout(() => {
                navigate('/rider/dashboard');
            }, 2000);
        } else {
            setError('Invalid verification code for this delivery');
        }
    };

    // Initialize QR scanner when in QR mode
    React.useEffect(() => {
        if (scanMode === 'qr') {
            const scanner = new Html5QrcodeScanner(
                'qr-reader',
                { fps: 10, qrbox: 250 },
                false
            );

            scanner.render(
                (decodedText) => {
                    handleQRScan(decodedText);
                    scanner.clear();
                },
                (error) => {
                    // Ignore scan errors
                }
            );

            return () => {
                scanner.clear().catch(() => { });
            };
        }
    }, [scanMode]);

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaCheckCircle className="text-green-600 text-4xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-brand-dark mb-2">Pickup Confirmed!</h2>
                    <p className="text-gray-600">Redirecting to dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-brand-dark text-white p-6 shadow-lg">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl font-heading font-bold">Pickup Verification</h1>
                    <p className="text-brand-yellow text-sm">Scan QR code or enter verification code</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-6">
                {/* Mode Toggle */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setScanMode('qr')}
                            className={`flex-1 py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 ${scanMode === 'qr'
                                ? 'bg-brand-yellow text-brand-dark'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            <FaQrcode /> Scan QR Code
                        </button>
                        <button
                            onClick={() => setScanMode('manual')}
                            className={`flex-1 py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 ${scanMode === 'manual'
                                ? 'bg-brand-yellow text-brand-dark'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            <FaKeyboard /> Enter Code
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
                        <FaTimesCircle className="text-red-600 text-xl" />
                        <p className="text-red-600 font-medium">{error}</p>
                    </div>
                )}

                {/* Content */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    {scanMode === 'qr' ? (
                        <div>
                            <h2 className="text-xl font-bold mb-4 text-brand-dark">Scan Delivery QR Code</h2>
                            <div id="qr-reader" className="rounded-lg overflow-hidden"></div>
                            <p className="text-sm text-gray-500 mt-4 text-center">
                                Position the QR code within the frame to scan
                            </p>
                        </div>
                    ) : (
                        <div>
                            <h2 className="text-xl font-bold mb-4 text-brand-dark">Enter Verification Code</h2>
                            <form onSubmit={handleManualVerification} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Delivery
                                    </label>
                                    <select
                                        value={deliveryId}
                                        onChange={(e) => setDeliveryId(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none"
                                        required
                                    >
                                        <option value="">-- Select a delivery --</option>
                                        {assignedDeliveries.map(delivery => (
                                            <option key={delivery.id} value={delivery.id}>
                                                {delivery.location} - {delivery.customerName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        6-Digit Verification Code
                                    </label>
                                    <input
                                        type="text"
                                        value={manualCode}
                                        onChange={(e) => setManualCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none text-center text-2xl font-bold tracking-widest"
                                        placeholder="000000"
                                        maxLength={6}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-brand-red text-white py-3 rounded-lg font-bold hover:bg-red-700 transition-colors"
                                >
                                    Confirm Pickup
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {assignedDeliveries.length === 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                        <p className="text-yellow-700 text-center">
                            You don't have any assigned deliveries to pick up
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PickupVerification;
