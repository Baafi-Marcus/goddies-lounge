import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRider } from '../../context/RiderContext';
import { FaSpinner } from 'react-icons/fa';

const RiderDashboard: React.FC = () => {
    const { currentRider } = useRider();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (currentRider) {
            // Redirect to the new 3-tab delivery view which is more optimized
            navigate('/rider/deliveries', { replace: true });
        }
    }, [currentRider, navigate]);

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-500">
            <FaSpinner className="animate-spin text-3xl mb-4 text-brand-red" />
            <p className="font-medium">Redirecting to deliveries...</p>
        </div>
    );
};

export default RiderDashboard;
