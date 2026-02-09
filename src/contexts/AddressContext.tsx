'use client';

import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getUserAddresses, addAddress, removeAddress } from '@/services/address';
import { Address, AddAddressData } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { isTransientError } from '@/api/api';

export interface AddressContextType {
  addresses: Address[];
  selectedAddressId: string | null;
  isLoading: boolean;
  isError: string | null;
  addAddress: (data: AddAddressData) => Promise<void>;
  removeAddress: (addressId: string) => Promise<void>;
  selectAddress: (addressId: string) => void;
  loadAddresses: () => Promise<void>;
}

export const AddressContext = createContext<AddressContextType | undefined>(undefined);

export const AddressProvider = ({ children }: { children: ReactNode }) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState<string | null>(null);
  const { token, isAuthenticated } = useAuth();

  // Unified Robust Retry Helper
  const withRetry = useCallback(async <T,>(fn: () => Promise<T>, retries = 5, delay = 1500): Promise<T> => {
    try {
      return await fn();
    } catch (err: any) {
      if (retries > 0 && isTransientError(err)) {
        console.warn(`Transient Address API error. Retrying... (${retries} left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        const nextDelay = delay * 2 + Math.random() * 500;
        return withRetry(fn, retries - 1, nextDelay);
      }
      throw err;
    }
  }, []);

  const loadAddresses = useCallback(async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      setIsError(null);
      const response = await withRetry(() => getUserAddresses(token));
      setAddresses(response.data || []);

      if (response.data && response.data.length > 0 && !selectedAddressId) {
        setSelectedAddressId(response.data[0]._id);
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setAddresses([]);
        return;
      }
      const error = err instanceof Error ? err.message : 'Failed to load addresses';
      setIsError(error);
      console.error('Final load addresses error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token, selectedAddressId, withRetry]);

  useEffect(() => {
    const initAddresses = async () => {
      if (isAuthenticated && token) {
        await loadAddresses();
      } else {
        setAddresses([]);
        setSelectedAddressId(null);
      }
    };

    initAddresses();
  }, [isAuthenticated, token, loadAddresses]);

  const addNewAddress = async (data: AddAddressData) => {
    if (!token) {
      setIsError('Please login to add addresses');
      return;
    }

    try {
      setIsError(null);
      await withRetry(() => addAddress(data, token));
      await loadAddresses();
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to add address';
      setIsError(error);
    }
  };

  const removeAddressItem = async (addressId: string) => {
    if (!token) {
      setIsError('Please login to manage addresses');
      return;
    }

    try {
      setIsError(null);
      await withRetry(() => removeAddress(addressId, token));
      setAddresses(prev => prev.filter(addr => addr._id !== addressId));
      if (selectedAddressId === addressId) {
        setSelectedAddressId(null);
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to remove address';
      setIsError(error);
    }
  };

  const value: AddressContextType = {
    addresses,
    selectedAddressId,
    isLoading,
    isError,
    addAddress: addNewAddress,
    removeAddress: removeAddressItem,
    selectAddress: setSelectedAddressId,
    loadAddresses,
  };

  return (
    <AddressContext.Provider value={value}>
      {children}
    </AddressContext.Provider>
  );
};
