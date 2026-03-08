import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthResponse } from '../types';

interface AuthContextData {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    signIn: (credentials: AuthResponse) => void;
    signOut: () => void;
    updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);


    const signOut = () => {
        localStorage.removeItem('@LeadApp:Token');
        localStorage.removeItem('@LeadApp:User');
        setUser(null);
    };

    useEffect(() => {
        async function loadStorageData() {
            setIsLoading(true);
            const token = localStorage.getItem('@LeadApp:Token');
            const storedUser = localStorage.getItem('@LeadApp:User');

            if (token && storedUser) {
                try {
                    // Try to fetch up-to-date user info if backend supports it
                    // const me = await authApi.getMe();
                    // setUser(me);
                    setUser(JSON.parse(storedUser));
                } catch (error) {
                    console.error('Session expired or invalid', error);
                    signOut();
                }
            }
            setIsLoading(false);
        }

        loadStorageData();
    }, []);

    const signIn = (authRes: AuthResponse) => {
        localStorage.setItem('@LeadApp:Token', authRes.token);
        localStorage.setItem('@LeadApp:User', JSON.stringify(authRes.user));
        setUser(authRes.user);
    };

  

    const updateUser = (updatedUser: User) => {
        localStorage.setItem('@LeadApp:User', JSON.stringify(updatedUser));
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, signIn, signOut, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
