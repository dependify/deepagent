import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    id: string;
    email: string;
    name?: string;
    role?: 'ADMIN' | 'USER';
    accountStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAdmin: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name?: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = '/api';

/**
 * Safely parse JSON response, returning null if parsing fails
 */
async function safeJson(res: Response): Promise<any> {
    try {
        const text = await res.text();
        if (!text) return null;
        return JSON.parse(text);
    } catch {
        return null;
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);

    // Check token and load user on mount
    useEffect(() => {
        const loadUser = async () => {
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const res = await fetch(`${API_URL}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.ok) {
                    const data = await safeJson(res);
                    if (data?.user) {
                        setUser(data.user);
                    }
                } else {
                    // Token invalid
                    localStorage.removeItem('token');
                    setToken(null);
                }
            } catch (error) {
                console.error('Failed to load user:', error);
                localStorage.removeItem('token');
                setToken(null);
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();
    }, [token]);

    const login = async (email: string, password: string) => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await safeJson(res);

        if (!res.ok) {
            throw new Error(data?.error || 'Login failed');
        }

        if (!data?.token) {
            throw new Error('Invalid response from server');
        }

        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
    };

    const register = async (email: string, password: string, name?: string) => {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name }),
        });

        const data = await safeJson(res);

        if (!res.ok) {
            throw new Error(data?.error || 'Registration failed');
        }

        if (!data?.token) {
            throw new Error('Invalid response from server');
        }

        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const isAdmin = user?.role === 'ADMIN';

    return (
        <AuthContext.Provider value={{ user, token, isLoading, isAdmin, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
