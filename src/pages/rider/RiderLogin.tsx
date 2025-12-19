import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRider } from '../../context/RiderContext';
import { FaMotorcycle, FaUser, FaLock, FaEnvelope, FaPhone, FaCamera, FaTimes } from 'react-icons/fa';

const RiderLogin: React.FC = () => {
    const navigate = useNavigate();
    const { login, addRider } = useRider();
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState('');

    // Camera State
    const [showCamera, setShowCamera] = useState(false);
    const [activeField, setActiveField] = useState<'ghanaCardImage' | 'selfieImage' | null>(null);
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const streamRef = React.useRef<MediaStream | null>(null);

    const startCamera = async (field: 'ghanaCardImage' | 'selfieImage') => {
        try {
            setActiveField(field);
            setShowCamera(true);
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: field === 'selfieImage' ? 'user' : 'environment' }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError("Could not access camera. Please check permissions.");
            setShowCamera(false);
            setActiveField(null);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setShowCamera(false);
        setActiveField(null);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current && activeField) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (context) {
                // Set canvas dimensions to match video
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                // Draw video frame to canvas
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                // Convert to data URL
                const imageUrl = canvas.toDataURL('image/jpeg');
                setRegisterData(prev => ({ ...prev, [activeField]: imageUrl }));
                stopCamera();
            }
        }
    };

    // Cleanup camera on unmount
    React.useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    // Login form
    const [loginData, setLoginData] = useState({
        registrationNumber: '',
        password: '',
    });

    // Registration form
    const [registerData, setRegisterData] = useState({
        name: '',
        email: '',
        phone: '',
        vehicleType: 'motorcycle' as 'motorcycle' | 'bicycle' | 'car',
        vehicleNumber: '',
        password: '',
        confirmPassword: '',
        momoNumber: '',
        ghanaCardNumber: '',
        ghanaCardImage: '',
        selfieImage: ''
    });

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'ghanaCardImage' | 'selfieImage') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setRegisterData(prev => ({ ...prev, [field]: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const success = await login(loginData.registrationNumber, loginData.password);
        if (success) {
            navigate('/rider/dashboard');
        } else {
            setError('Invalid registration number or password');
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (registerData.password !== registerData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (registerData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (!registerData.ghanaCardImage || !registerData.selfieImage) {
            setError('Please upload both detailed Ghana Card image and a live selfie');
            return;
        }

        // Generate registration number
        const registrationNumber = `RDR${Date.now().toString().slice(-6)}`;

        await addRider({
            registrationNumber,
            name: registerData.name,
            email: registerData.email,
            phone: registerData.phone,
            vehicleType: registerData.vehicleType,
            vehicleNumber: registerData.vehicleNumber,
            password: registerData.password,
            status: 'inactive',
            momoNumber: registerData.momoNumber,
            ghanaCardNumber: registerData.ghanaCardNumber,
            ghanaCardImage: registerData.ghanaCardImage,
            selfieImage: registerData.selfieImage
        });

        alert(`Registration successful! Your registration number is: ${registrationNumber}\nPlease wait for admin verification and approval.`);
        setIsRegistering(false);
        setRegisterData({
            name: '',
            email: '',
            phone: '',
            vehicleType: 'motorcycle',
            vehicleNumber: '',
            password: '',
            confirmPassword: '',
            momoNumber: '',
            ghanaCardNumber: '',
            ghanaCardImage: '',
            selfieImage: ''
        });
    };

    // Wizard State
    const [currentStep, setCurrentStep] = useState(1);
    const steps = [
        { id: 1, title: 'Personal' },
        { id: 2, title: 'Vehicle' },
        { id: 3, title: 'Verification' }
    ];

    const handleNext = () => {
        // Simple validation before proceeding
        if (currentStep === 1) {
            if (!registerData.name || !registerData.email || !registerData.phone || !registerData.password) {
                setError("Please fill in all personal details.");
                return;
            }
            if (registerData.password !== registerData.confirmPassword) {
                setError("Passwords do not match.");
                return;
            }
        }
        if (currentStep === 2) {
            if (!registerData.vehicleNumber) {
                setError("Please enter valid vehicle details.");
                return;
            }
        }
        setError("");
        setCurrentStep(prev => prev + 1);
    };

    const handleBack = () => {
        setError("");
        setCurrentStep(prev => prev - 1);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-brand-dark via-gray-900 to-brand-red flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
                        <FaMotorcycle className="text-brand-yellow text-3xl" />
                        <h1 className="text-2xl font-heading font-bold text-white">Goddies Riders</h1>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => { setIsRegistering(false); setError(''); }}
                            className={`flex-1 py-4 font-bold transition-colors ${!isRegistering
                                ? 'bg-brand-yellow text-brand-dark'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => { setIsRegistering(true); setError(''); }}
                            className={`flex-1 py-4 font-bold transition-colors ${isRegistering
                                ? 'bg-brand-yellow text-brand-dark'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            Register
                        </button>
                    </div>

                    <div className="p-8">
                        {error && (
                            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
                                <span className="font-bold">!</span> {error}
                            </div>
                        )}

                        {!isRegistering ? (
                            // Login Form
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Registration Number
                                    </label>
                                    <div className="relative">
                                        <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={loginData.registrationNumber}
                                            onChange={(e) => setLoginData({ ...loginData, registrationNumber: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none"
                                            placeholder="RDR001"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="password"
                                            value={loginData.password}
                                            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none"
                                            placeholder="••••••"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-brand-red text-white py-3 rounded-lg font-bold hover:bg-red-700 transition-colors"
                                >
                                    Login
                                </button>
                            </form>
                        ) : (
                            // Registration Wizard
                            <div className="space-y-6">
                                {/* Stepper */}
                                <div className="flex justify-between items-center mb-6 relative">
                                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10"></div>
                                    {steps.map((step) => (
                                        <div key={step.id} className="flex flex-col items-center bg-white px-2">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-1 transition-colors ${currentStep >= step.id ? 'bg-brand-dark text-brand-yellow' : 'bg-gray-200 text-gray-500'}`}>
                                                {step.id}
                                            </div>
                                            <span className={`text-xs font-semibold ${currentStep >= step.id ? 'text-brand-dark' : 'text-gray-400'}`}>
                                                {step.title}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <form onSubmit={handleRegister}>
                                    {/* Step 1: Personal Details */}
                                    {currentStep === 1 && (
                                        <div className="space-y-4 animate-fadeIn">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                                <div className="relative">
                                                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        value={registerData.name}
                                                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                                    <div className="relative">
                                                        <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                        <input
                                                            type="email"
                                                            value={registerData.email}
                                                            onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                                    <div className="relative">
                                                        <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                        <input
                                                            type="tel"
                                                            value={registerData.phone}
                                                            onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                                    <input
                                                        type="password"
                                                        value={registerData.password}
                                                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                                    <input
                                                        type="password"
                                                        value={registerData.confirmPassword}
                                                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 2: Vehicle Details */}
                                    {currentStep === 2 && (
                                        <div className="space-y-4 animate-fadeIn">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                                                <select
                                                    value={registerData.vehicleType}
                                                    onChange={(e) => setRegisterData({ ...registerData, vehicleType: e.target.value as any })}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none"
                                                >
                                                    <option value="motorcycle">🏍️ Motorcycle</option>
                                                    <option value="bicycle">🚴 Bicycle</option>
                                                    <option value="car">🚗 Car</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle/Plate Number</label>
                                                <input
                                                    type="text"
                                                    value={registerData.vehicleNumber}
                                                    onChange={(e) => setRegisterData({ ...registerData, vehicleNumber: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none"
                                                    placeholder="e.g. GR-1234-20"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 3: Verification */}
                                    {currentStep === 3 && (
                                        <div className="space-y-4 animate-fadeIn">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">MoMo Number</label>
                                                    <input
                                                        type="tel"
                                                        value={registerData.momoNumber}
                                                        onChange={(e) => setRegisterData({ ...registerData, momoNumber: e.target.value })}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none"
                                                        placeholder="024..."
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ghana Card No.</label>
                                                    <input
                                                        type="text"
                                                        value={registerData.ghanaCardNumber}
                                                        onChange={(e) => setRegisterData({ ...registerData, ghanaCardNumber: e.target.value })}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none"
                                                        placeholder="GHA-..."
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            {/* Ghana Card Capture */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Ghana Card (Photo)</label>
                                                {!registerData.ghanaCardImage ? (
                                                    activeField === 'ghanaCardImage' && showCamera ? (
                                                        <div className="relative rounded-lg overflow-hidden bg-black aspect-[3/4] md:aspect-video">
                                                            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                                                            <canvas ref={canvasRef} className="hidden" />
                                                            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                                                                <button type="button" onClick={capturePhoto} className="bg-white rounded-full w-12 h-12 flex items-center justify-center border-4 border-gray-200 shadow-lg"><div className="w-10 h-10 rounded-full bg-brand-red"></div></button>
                                                                <button type="button" onClick={stopCamera} className="bg-red-600/80 text-white rounded-full px-4 py-2 text-sm font-bold backdrop-blur-sm">Cancel</button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button type="button" onClick={() => startCamera('ghanaCardImage')} className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-brand-yellow hover:bg-yellow-50 transition-colors">
                                                            <FaCamera className="text-xl mb-1" />
                                                            <span className="text-sm font-semibold">Capture Ghana Card</span>
                                                        </button>
                                                    )
                                                ) : (
                                                    <div className="relative rounded-lg overflow-hidden border border-gray-200 group">
                                                        <img src={registerData.ghanaCardImage} alt="Ghana Card" className="w-full h-32 object-cover" />
                                                        <button type="button" onClick={() => setRegisterData(prev => ({ ...prev, ghanaCardImage: '' }))} className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full shadow hover:bg-red-700"><FaTimes /></button>
                                                        <div className="absolute bottom-0 left-0 right-0 bg-green-600 text-white text-[10px] font-bold text-center py-0.5">Captured ✓</div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Selfie Capture */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Live Selfie</label>
                                                {!registerData.selfieImage ? (
                                                    activeField === 'selfieImage' && showCamera ? (
                                                        <div className="relative rounded-lg overflow-hidden bg-black aspect-[3/4] md:aspect-video">
                                                            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                                                            <canvas ref={canvasRef} className="hidden" />
                                                            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                                                                <button type="button" onClick={capturePhoto} className="bg-white rounded-full w-12 h-12 flex items-center justify-center border-4 border-gray-200 shadow-lg"><div className="w-10 h-10 rounded-full bg-brand-red"></div></button>
                                                                <button type="button" onClick={stopCamera} className="bg-red-600/80 text-white rounded-full px-4 py-2 text-sm font-bold backdrop-blur-sm">Cancel</button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button type="button" onClick={() => startCamera('selfieImage')} className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-brand-yellow hover:bg-yellow-50 transition-colors">
                                                            <FaCamera className="text-xl mb-1" />
                                                            <span className="text-sm font-semibold">Take Selfie</span>
                                                        </button>
                                                    )
                                                ) : (
                                                    <div className="relative rounded-lg overflow-hidden border border-gray-200 group">
                                                        <img src={registerData.selfieImage} alt="Selfie" className="w-full h-32 object-cover" />
                                                        <button type="button" onClick={() => setRegisterData(prev => ({ ...prev, selfieImage: '' }))} className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full shadow hover:bg-red-700"><FaTimes /></button>
                                                        <div className="absolute bottom-0 left-0 right-0 bg-green-600 text-white text-[10px] font-bold text-center py-0.5">Captured ✓</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Navigation Buttons */}
                                    <div className="flex gap-3 mt-8">
                                        {currentStep > 1 && (
                                            <button
                                                type="button"
                                                onClick={handleBack}
                                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                                            >
                                                Back
                                            </button>
                                        )}

                                        {currentStep < 3 ? (
                                            <button
                                                type="button"
                                                onClick={handleNext}
                                                className="flex-1 px-4 py-3 bg-brand-yellow text-brand-dark rounded-lg font-bold hover:bg-yellow-400 transition-colors"
                                            >
                                                Next
                                            </button>
                                        ) : (
                                            <button
                                                type="submit"
                                                className="flex-1 px-4 py-3 bg-brand-red text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
                                            >
                                                Complete Registration
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 text-center mt-4">
                                        Verification is required correctly.
                                    </p>
                                </form>
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-center mt-6">
                    <Link to="/" className="text-white/80 hover:text-white text-sm">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RiderLogin;
