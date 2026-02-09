'use client';

import React, { createContext, useCallback, useEffect, useState } from 'react';
import { Order } from '@/types';
import { getUserOrders } from '@/services/orders';
import { useAuth } from '@/hooks/useAuth';

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

  const loadOrders = useCallback(async () => {
    console.log('OrderContext: loadOrders called', { isAuthenticated, hasUserId: !!user?.id, userId: user?.id, hasToken: !!token });

    // Proceed if we have a token, even if userId is missing (service will try fallback endpoint)
    if (!isAuthenticated || !token) {
      console.warn('OrderContext: Skipping load due to missing token/auth');
      setOrders([]);
      return;
    }

    const targetUserId = user?.id || '';
    if (!targetUserId) {
      console.warn('OrderContext: userId is missing, attempting fallback fetch using token only');
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('Loading orders for user:', targetUserId || 'CURRENT_USER_PROFILE');
      const response = await getUserOrders(targetUserId, token);
      console.log('Raw orders response:', response);

      // Handle both array and { data: [] } formats
      const ordersData = Array.isArray(response) ? response : (response.data || []);
      console.log('Processed orders:', ordersData);
      setOrders(ordersData);
    } catch (err: unknown) {
      console.error('Failed to load orders error:', err);
      const errorResponse = (err as any)?.response?.data?.message || 'Failed to load orders';
      setError(errorResponse);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.id, token]);

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
