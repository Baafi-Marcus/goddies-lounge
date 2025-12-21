
import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { type User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { UserService } from '../services/neon';

interface AuthContextType {
    currentUser: User | null; // Firebase User
    userProfile: any | null;  // Neon User Profile
    loading: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            setLoading(true);

            if (user) {
                // Session Timeout Check (1 hour)
                const savedTime = localStorage.getItem('userLoginTime');
                const now = Date.now();
                const oneHour = 1 * 60 * 60 * 1000;

                if (savedTime && (now - parseInt(savedTime, 10) > oneHour)) {
                    await signOut(auth);
                    localStorage.removeItem('userLoginTime');
                    setLoading(false);
                    return;
                }

                if (!savedTime) {
                    localStorage.setItem('userLoginTime', now.toString());
                }

                try {
                    // Check if user exists in Neon
                    let profile = await UserService.getUserByFirebaseUid(user.uid);

                    if (!profile) {
                        // Create new profile in Neon if first time login
                        // Try to get info from Firebase provider data
                        const email = user.email;
                        const phone = user.phoneNumber;
                        const DisplayName = user.displayName;

                        profile = await UserService.createUser({
                            firebaseUid: user.uid,
                            email,
                            phone,
                            fullName: DisplayName,
                            role: 'customer' // Default role
                        });
                    }

                    setUserProfile(profile);
                } catch (error) {
                    console.error("Error syncing user profile:", error);
                }
            } else {
                localStorage.removeItem('userLoginTime');
                setUserProfile(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const logout = async () => {
        await signOut(auth);
        localStorage.removeItem('userLoginTime');
    };

    return (
        <AuthContext.Provider value={{ currentUser, userProfile, loading, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
