'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    mockLogin: (email: string) => Promise<void>;
}

// Default mockLogin does nothing if context not provided, to avoid crashes
const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    mockLogin: async () => { }
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Mock User for fallback access
    const mockLogin = async (email: string) => {
        const mockUser = {
            uid: 'mock-admin-id',
            email,
            emailVerified: true,
            isAnonymous: false,
            metadata: {},
            providerData: [],
            refreshToken: '',
            tenantId: null,
            delete: async () => { },
            getIdToken: async () => 'mock-token',
            getIdTokenResult: async () => ({
                token: 'mock-token',
                signInProvider: 'custom',
                claims: {},
                authTime: Date.now().toString(),
                issuedAtTime: Date.now().toString(),
                expirationTime: (Date.now() + 3600000).toString(),
            }),
            reload: async () => { },
            toJSON: () => ({}),
            displayName: 'Admin User',
            phoneNumber: null,
            photoURL: null,
            providerId: 'custom'
        } as unknown as User;

        setUser(mockUser);
        localStorage.setItem('mock_auth_user', email);
    };

    useEffect(() => {
        // Check for persisted mock session
        const storedMockUser = localStorage.getItem('mock_auth_user');
        if (storedMockUser) {
            mockLogin(storedMockUser);
            setLoading(false);
            return; // Skip Firebase check if mock session exists
        }

        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, mockLogin }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!user) return null;

    return <>{children}</>;
};
