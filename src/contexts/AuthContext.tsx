'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { logout as logoutService, verifyToken, getCurrentUser } from '@/services/auth';
import api from '@/api/api';
import { AxiosResponse, AxiosError } from 'axios';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: AuthUser) => void;
  updateUser: (newUser: Partial<AuthUser>) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check token and user on app load
  useEffect(() => {
    const checkAuth = async () => {
      console.log('AuthContext: Initializing Session Discovery...');
      try {
        const storedToken = localStorage.getItem('userToken');

        if (!storedToken || storedToken === 'undefined' || storedToken === 'null') {
          console.log('AuthContext: No valid token found in storage');
          setIsLoading(false);
          return;
        }

        console.log('AuthContext: Found token, verifying session via verifyToken...');

        try {
          const verifyResponse = await verifyToken(storedToken);
          console.log('AuthContext: Verification Response:', verifyResponse);

          // The API usually returns user data or decoded payload here
          const decoded = verifyResponse.decoded || verifyResponse.user || verifyResponse;
          const safeId = decoded.id || decoded._id || localStorage.getItem('userId');
          const safeName = decoded.name || localStorage.getItem('userName') || 'User';
          const safeEmail = decoded.email || localStorage.getItem('userEmail') || '';

          console.log('AuthContext: Resolved Session Data:', { safeId, safeName });

          if (safeId && safeId !== 'undefined' && safeId !== 'null') {
            const finalUser: AuthUser = {
              id: safeId,
              name: safeName,
              email: safeEmail,
              phone: decoded.phone || localStorage.getItem('userPhone') || '',
            };

            setToken(storedToken);
            setUser(finalUser);

            // Re-sync localStorage
            localStorage.setItem('userId', finalUser.id);
            localStorage.setItem('userName', finalUser.name);
            localStorage.setItem('userEmail', finalUser.email);
            if (finalUser.phone) localStorage.setItem('userPhone', finalUser.phone);
            console.log('AuthContext: Session successfully re-hydrated');
          } else {
            console.warn('AuthContext: Session valid but ID missing, using cached local data');
            const cachedId = localStorage.getItem('userId');
            if (cachedId && cachedId !== 'undefined' && cachedId !== 'null') {
              setToken(storedToken);
              setUser({
                id: cachedId,
                name: localStorage.getItem('userName') || 'User',
                email: localStorage.getItem('userEmail') || '',
                phone: localStorage.getItem('userPhone') || '',
              });
            }
          }
        } catch (err: any) {
          console.error('AuthContext: Session verification failed:', err);

          // Only logout on clear auth errors
          const status = err.response?.status;
          const msg = err.message?.toLowerCase() || '';
          if (status === 401 || msg.includes('expired') || msg.includes('invalid')) {
            console.warn('AuthContext: Authentication invalid, clearing session');
            logoutService();
            setToken(null);
            setUser(null);
          } else {
            console.log('AuthContext: Non-auth error (e.g. 400), keeping local session if data exists');
            const cachedId = localStorage.getItem('userId');
            if (cachedId && cachedId !== 'undefined' && cachedId !== 'null') {
              setToken(storedToken);
              setUser({
                id: cachedId,
                name: localStorage.getItem('userName') || 'User',
                email: localStorage.getItem('userEmail') || '',
                phone: localStorage.getItem('userPhone') || '',
              });
            }
          }
        }
      } catch (globalErr) {
        console.error('AuthContext: Critical error in checkAuth:', globalErr);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Global interceptor for authentication failures
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError<any>) => {
        if (error.response?.status === 401) {
          const msg = error.response.data?.message?.toLowerCase() || '';
          if (msg.includes('login again') || msg.includes('invalid') || msg.includes('expired')) {
            console.warn('AuthContext: Global Auth Failure detected, logging out...', msg);
            logout();
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  const login = (newToken: string, newUser: AuthUser) => {
    console.log('AuthContext: login called with raw user:', newUser);

    if (!newToken) {
      console.error('AuthContext: Login failed - No token provided');
      return;
    }

    // Robust ID extraction if passed object is not standard
    const safeId = newUser.id || (newUser as any)._id || (newUser as any).user?.id || (newUser as any).user?._id;
    console.log('AuthContext: Resolved ID for login:', safeId);

    const validatedUser: AuthUser = {
      id: safeId || '',
      name: newUser.name || '',
      email: newUser.email || '',
      phone: newUser.phone || (newUser as any).user?.phone || '',
    };

    setToken(newToken);
    setUser(validatedUser);

    localStorage.setItem('userToken', newToken);
    localStorage.setItem('userName', validatedUser.name);
    localStorage.setItem('userEmail', validatedUser.email);
    localStorage.setItem('userId', validatedUser.id);
    if (validatedUser.phone) localStorage.setItem('userPhone', validatedUser.phone);

    console.log('AuthContext: Login successful, state updated');
  };

  const updateUser = (updatedFields: Partial<AuthUser>) => {
    if (!user) return;

    const updatedUser = { ...user, ...updatedFields };
    setUser(updatedUser);

    if (updatedFields.name) localStorage.setItem('userName', updatedFields.name);
    if (updatedFields.email) localStorage.setItem('userEmail', updatedFields.email);
    if (updatedFields.phone) localStorage.setItem('userPhone', updatedFields.phone);

    console.log('AuthContext: User state updated:', updatedFields);
  };

  const logout = () => {
    logoutService();
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    updateUser,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
