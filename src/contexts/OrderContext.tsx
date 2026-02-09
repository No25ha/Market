'use client';

import React, { createContext, useCallback, useEffect, useState } from 'react';
import { Order } from '@/types';
import { getUserOrders } from '@/services/orders';
import { useAuth } from '@/hooks/useAuth';
import { isTransientError } from '@/api/api';

interface OrderContextType {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  loadOrders: () => Promise<void>;
  refreshOrders: () => Promise<void>;
}

export const OrderContext = createContext<OrderContextType | undefined>(undefined);

interface OrderProviderProps {
  children: React.ReactNode;
}

export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated, token } = useAuth();

  // Unified Robust Retry Helper
  const withRetry = useCallback(async <T,>(fn: () => Promise<T>, retries = 5, delay = 1500): Promise<T> => {
    try {
      return await fn();
    } catch (err: any) {
      if (retries > 0 && isTransientError(err)) {
        console.warn(`Transient Order API error. Retrying... (${retries} left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        const nextDelay = delay * 2 + Math.random() * 500;
        return withRetry(fn, retries - 1, nextDelay);
      }
      throw err;
    }
  }, []);

  const loadOrders = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setOrders([]);
      return;
    }

    const targetUserId = user?.id || '';

    try {
      setIsLoading(true);
      setError(null);
      console.log('Loading orders for user:', targetUserId || 'CURRENT_USER_PROFILE');

      const response = await withRetry(() => getUserOrders(targetUserId, token));
      const ordersData = Array.isArray(response) ? response : (response.data || []);
      setOrders(ordersData);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load orders';
      console.error('Final load orders error:', errorMsg);
      setError(errorMsg);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.id, token, withRetry]);

  const refreshOrders = useCallback(async () => {
    await loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    } else {
      setOrders([]);
      setError(null);
    }
  }, [isAuthenticated, user?.id, loadOrders]);

  const value: OrderContextType = {
    orders,
    isLoading,
    error,
    loadOrders,
    refreshOrders,
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};
