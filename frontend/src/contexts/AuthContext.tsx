'use client';

import React, {createContext, useContext, useEffect, useState, ReactNode} from 'react';
import {User, AuthAPI, AuthStorage} from '@/lib/auth';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({children}: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isAuthenticated = Boolean(user && token);

    // Initialize auth state from localStorage
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const storedToken = AuthStorage.getToken();
                const storedUser = AuthStorage.getUser();

                if (storedToken && storedUser) {
                    // Verify token is still valid by fetching current user
                    try {
                        const currentUser = await AuthAPI.getCurrentUser(storedToken);
                        setUser(currentUser);
                        setToken(storedToken);
                    } catch (error) {
                        // Token is invalid, clear stored auth data
                        AuthStorage.clearAuth();
                    }
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = async (email: string, password: string): Promise<{user: any, token: string, requires_2fa_setup?: boolean}> => {
        setIsLoading(true);
        try {
            const response = await AuthAPI.login(email, password);

            setUser(response.user);
            setToken(response.token);

            // Persist to localStorage
            AuthStorage.setToken(response.token);
            AuthStorage.setUser(response.user);

            return response;
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async (): Promise<void> => {
        setIsLoading(true);
        try {
            if (token) {
                await AuthAPI.logout(token);
            }
        } catch (error) {
            console.error('Error during logout:', error);
            // Continue with logout even if API call fails
        } finally {
            // Clear local state and storage
            setUser(null);
            setToken(null);
            AuthStorage.clearAuth();
            setIsLoading(false);
        }
    };

    const value = {
        user,
        token,
        isLoading,
        login,
        logout,
        isAuthenticated,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}