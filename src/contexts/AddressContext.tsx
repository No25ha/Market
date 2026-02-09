'use client';

import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getUserAddresses, addAddress, removeAddress } from '@/services/address';
import { Address, AddAddressData } from '@/types';
import { useAuth } from '@/hooks/useAuth';

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

  const loadAddresses = useCallback(async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      setIsError(null);
      const response = await getUserAddresses(token);
      setAddresses(response.data || []);
      // Auto-select first address if available
      if (response.data && response.data.length > 0 && !selectedAddressId) {
        setSelectedAddressId(response.data[0]._id);
      }
    } catch (err: any) {
      if (err.response?.status === 404 || err.response?.status === 500) {
        setAddresses([]);
        return;
      }
      const error = err instanceof Error ? err.message : 'Failed to load addresses';
      setIsError(error);
      console.error('Load addresses error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token, selectedAddressId]);

  // Load addresses on mount and when auth changes
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
      await addAddress(data, token);
      // Reload addresses to get the new one
      await loadAddresses();
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to add address';
      setIsError(error);
      console.error('Add address error:', error);
    }
  };

  const removeAddressItem = async (addressId: string) => {
    if (!token) {
      setIsError('Please login to manage addresses');
      return;
    }

    try {
      setIsError(null);
      await removeAddress(addressId, token);
      // Remove from local state
      setAddresses(addresses.filter(addr => addr._id !== addressId));
      // If removed address was selected, select first available
      if (selectedAddressId === addressId) {
        const remaining = addresses.filter(addr => addr._id !== addressId);
        setSelectedAddressId(remaining.length > 0 ? remaining[0]._id : null);
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to remove address';
      setIsError(error);
      console.error('Remove address error:', error);
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
