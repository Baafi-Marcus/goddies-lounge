import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    signInWithPopup,
    googleProvider,
    signInWithPhoneNumber,
    RecaptchaVerifier,
    auth,
    updateProfile,
    signInWithEmailAndPassword,
    linkWithCredential,
    EmailAuthProvider
} from '../../services/firebase';
import { FaEnvelope, FaLock, FaGoogle, FaUser, FaPhone } from 'react-icons/fa';
import logo from '../../assets/logo.jpg';
import { UserService } from '../../services/neon';

// Add window type definition
declare global {
    interface Window {
        recaptchaVerifier: any;
        confirmationResult: any;
    }
}

const Login: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/user/menu';

    // State
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Login State
    const [loginIdentifier, setLoginIdentifier] = useState(''); // Username or Email
    const [loginPassword, setLoginPassword] = useState('');

    // Register State
    const [regStep, setRegStep] = useState<1 | 2 | 3>(1); // 1: Phone, 2: OTP, 3: Username/Pass
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [verificationId, setVerificationId] = useState<any>(null);
    const [regUsername, setRegUsername] = useState('');
    const [regPassword, setRegPassword] = useState('');

    const formatUsernameToEmail = (username: string) => {
        // If it looks like an email, leave it. If not, append domain.
        if (username.includes('@')) return username;
        return `${username.toLowerCase().replace(/\s+/g, '')} @goodies.app`;
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            await signInWithPopup(auth, googleProvider);
            navigate(from, { replace: true });
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Google Sign-In failed');
            setLoading(false);
        }
    };

    // --- Login Flow ---
    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const email = formatUsernameToEmail(loginIdentifier);

        try {
            await signInWithEmailAndPassword(auth, email, loginPassword);
            navigate(from, { replace: true });
        } catch (err: any) {
            console.error(err);
            setLoading(false);
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('Invalid username or password.');
            } else {
                setError('Login failed. Please try again.');
            }
        }
    };

    // --- Register Flow ---
    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
            });
        }
    };

    const handlePhoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setupRecaptcha();

        let formattedPhone = phoneNumber;
        // Basic Ghana formatting
        if (phoneNumber.startsWith('0')) {
            formattedPhone = '+233' + phoneNumber.substring(1);
        } else if (!phoneNumber.startsWith('+')) {
            formattedPhone = '+' + phoneNumber;
        }

        try {
            const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
            window.confirmationResult = confirmationResult;
            setVerificationId(confirmationResult);
            setRegStep(2);
            setLoading(false);
        } catch (err: any) {
            console.error(err);
            setLoading(false);
            let msg = 'Failed to send code.';
            if (err.code === 'auth/operation-not-allowed') {
                msg = 'Phone Auth not enabled in Console.';
            } else if (err.message.includes('region')) {
                msg = 'Region not allowed. Use Test Number (+233 54 000 0000).';
            }
            setError(msg);
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        if (!verificationId) return;

        try {
            // This logs the user in as a Phone User
            await verificationId.confirm(otp);
            // User is now authenticated with Phone
            setRegStep(3); // Move to set Username/Password
            setLoading(false);
        } catch (err: any) {
            console.error(err);
            setLoading(false);
            setError('Invalid Code');
        }
    };

    const handleFinalizeRegistration = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const user = auth.currentUser;
        if (!user) {
            setError('Session expired. Please restart.');
            setRegStep(1);
            setLoading(false);
            return;
        }

        const email = formatUsernameToEmail(regUsername);
        const credential = EmailAuthProvider.credential(email, regPassword);

        try {
            // Link Email/Password credential to the existing Phone User
            await linkWithCredential(user, credential);

            // Update Firebase Profile
            await updateProfile(user, {
                displayName: regUsername
            });

            // Sync with Neon (Explicit update to ensure username is saved as full_name)
            // Note: AuthContext might have already created a user on auth state change, 
            // but we update it here with the proper name.
            let existingUser = await UserService.getUserByFirebaseUid(user.uid);
            if (existingUser) {
                await UserService.updateUser(existingUser.id, { full_name: regUsername, email: email });
            } else {
                // Should be handled by AuthContext, but redundancy is safe
            }

            navigate(from, { replace: true });
        } catch (err: any) {
            console.error(err);
            setLoading(false);
            if (err.code === 'auth/credential-already-in-use') {
                setError('Username already taken.');
            } else if (err.code === 'auth/email-already-in-use') {
                setError('Username already taken.');
            } else {
                setError('Failed to create account. Try a different username.');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative bg-gray-900 font-sans pt-20">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1543007630-9710e4a00a20?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
                    alt="Lounge Background"
                    className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 m-4 flex flex-col">

                {/* Header Section */}
                <div className="p-8 text-center border-b border-white/10">
                    <img src={logo} alt="Goodies Lounge" className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-white/20 shadow-lg object-cover" />
                    <h1 className="text-2xl font-bold text-white mb-1">Goodies Lounge</h1>
                    <p className="text-gray-300 text-xs uppercase tracking-widest">Premium Experience</p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10">
                    <button
                        className={`flex - 1 py - 4 text - sm font - bold uppercase tracking - wider transition - colors ${activeTab === 'login' ? 'bg-brand-yellow text-brand-dark' : 'text-gray-400 hover:text-white bg-black/20'} `}
                        onClick={() => setActiveTab('login')}
                    >
                        Login
                    </button>
                    <button
                        className={`flex - 1 py - 4 text - sm font - bold uppercase tracking - wider transition - colors ${activeTab === 'register' ? 'bg-brand-yellow text-brand-dark' : 'text-gray-400 hover:text-white bg-black/20'} `}
                        onClick={() => setActiveTab('register')}
                    >
                        Register
                    </button>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 text-red-200 rounded-xl text-sm text-center backdrop-blur-sm">
                            {error}
                        </div>
                    )}

                    {/* --- LOGIN FORM --- */}
                    {activeTab === 'login' && (
                        <div className="space-y-6">
                            <form onSubmit={handleLoginSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Username</label>
                                    <div className="relative">
                                        <FaUser className="absolute left-4 top-4 text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="Enter your username"
                                            value={loginIdentifier}
                                            onChange={e => setLoginIdentifier(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none text-white placeholder-gray-500 backdrop-blur-sm transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Password</label>
                                    <div className="relative">
                                        <FaLock className="absolute left-4 top-4 text-gray-500" />
                                        <input
                                            type="password"
                                            placeholder="Enter your password"
                                            value={loginPassword}
                                            onChange={e => setLoginPassword(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none text-white placeholder-gray-500 backdrop-blur-sm transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-brand-red text-white py-4 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-70"
                                >
                                    {loading ? 'Signing In...' : 'Sign In'}
                                </button>
                            </form>

                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/20"></div>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-transparent px-4 text-sm text-gray-400">or</span>
                                </div>
                            </div>

                            <button
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                className="w-full py-4 px-6 flex items-center justify-center gap-3 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-70"
                            >
                                <FaGoogle className="text-red-500 text-xl" />
                                Sign in with Google
                            </button>
                        </div>
                    )}

                    {/* --- REGISTER FORM --- */}
                    {activeTab === 'register' && (
                        <div className="space-y-6">
                            {/* Step 1: Phone */}
                            {regStep === 1 && (
                                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Phone Number</label>
                                        <div className="relative">
                                            <FaPhone className="absolute left-4 top-4 text-gray-500" />
                                            <input
                                                type="tel"
                                                placeholder="e.g. 054 123 4567"
                                                value={phoneNumber}
                                                onChange={e => setPhoneNumber(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none text-white placeholder-gray-500 backdrop-blur-sm transition-all"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div id="recaptcha-container"></div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-brand-yellow text-brand-dark py-4 rounded-xl font-bold hover:bg-yellow-400 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-70"
                                    >
                                        {loading ? 'Sending Code...' : 'Get Verification Code'}
                                    </button>
                                </form>
                            )}

                            {/* Step 2: OTP */}
                            {regStep === 2 && (
                                <form onSubmit={handleOtpSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Verification Code</label>
                                        <input
                                            type="text"
                                            placeholder="123456"
                                            value={otp}
                                            onChange={e => setOtp(e.target.value)}
                                            className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none text-white text-center text-2xl placeholder-gray-600 letter-spacing-widest backdrop-blur-sm transition-all"
                                            required
                                            autoFocus
                                        />
                                        <p className="text-center text-gray-400 text-xs mt-2">Sent to {phoneNumber}</p>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-brand-yellow text-brand-dark py-4 rounded-xl font-bold hover:bg-yellow-400 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-70"
                                    >
                                        {loading ? 'Verifying...' : 'Verify Phone'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setRegStep(1); setOtp(''); }}
                                        className="w-full text-gray-400 text-sm hover:text-white transition-colors"
                                    >
                                        Change Number
                                    </button>
                                </form>
                            )}

                            {/* Step 3: Username/Pass */}
                            {regStep === 3 && (
                                <form onSubmit={handleFinalizeRegistration} className="space-y-4">
                                    <div className="text-center mb-4">
                                        <h3 className="text-white font-bold text-lg">One last step!</h3>
                                        <p className="text-gray-400 text-sm">Create your login credentials.</p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Choose a Username</label>
                                        <div className="relative">
                                            <FaUser className="absolute left-4 top-4 text-gray-500" />
                                            <input
                                                type="text"
                                                placeholder="Username"
                                                value={regUsername}
                                                onChange={e => setRegUsername(e.target.value.replace(/\s/g, ''))}
                                                className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none text-white placeholder-gray-500 backdrop-blur-sm transition-all"
                                                required
                                                minLength={3}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Create Password</label>
                                        <div className="relative">
                                            <FaLock className="absolute left-4 top-4 text-gray-500" />
                                            <input
                                                type="password"
                                                placeholder="Strong password"
                                                value={regPassword}
                                                onChange={e => setRegPassword(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-yellow focus:border-transparent outline-none text-white placeholder-gray-500 backdrop-blur-sm transition-all"
                                                required
                                                minLength={6}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-brand-red text-white py-4 rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-70"
                                    >
                                        {loading ? 'Creating Account...' : 'Complete Registration'}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default Login;

