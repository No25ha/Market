'use client';

import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getWishlist, addToWishlist, removeFromWishlist } from '@/services/wishlist';
import { WishlistItem } from '@/types';
import { useAuth } from '@/hooks/useAuth';

export interface WishlistContextType {
  wishlistItems: WishlistItem[];
  isLoading: boolean;
  isError: string | null;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (itemId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  loadWishlist: () => Promise<void>;
}

export const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState<string | null>(null);
  const { token, isAuthenticated } = useAuth();

  const loadWishlist = useCallback(async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      setIsError(null);
      const response = await getWishlist(token);
      setWishlistItems(response.data || []);
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to load wishlist';
      setIsError(error);
      console.error('Load wishlist error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Load wishlist on mount and when auth changes
  useEffect(() => {
    const initWishlist = async () => {
      if (isAuthenticated && token) {
        await loadWishlist();
      } else {
        setWishlistItems([]);
      }
    };

    initWishlist();
  }, [isAuthenticated, token, loadWishlist]);

  const addItemToWishlist = async (productId: string) => {
    if (!token) {
      setIsError('Please login to add items to wishlist');
      return;
    }

    try {
      setIsError(null);
      await addToWishlist({ productId }, token);
      // Reload wishlist to get updated items
      await loadWishlist();
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to add to wishlist';
      setIsError(error);
      console.error('Add to wishlist error:', error);
    }
  };

  const removeItemFromWishlist = async (itemId: string) => {
    if (!token) {
      setIsError('Please login to remove items from wishlist');
      return;
    }

    try {
      setIsError(null);
      await removeFromWishlist(itemId, token);
      // Remove from local state
      setWishlistItems(wishlistItems.filter(item => item._id !== itemId));
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to remove from wishlist';
      setIsError(error);
      console.error('Remove from wishlist error:', error);
    }
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlistItems.some(item => item.productId === productId || item._id === productId);
  };

  const value: WishlistContextType = {
    wishlistItems,
    isLoading,
    isError,
    addToWishlist: addItemToWishlist,
    removeFromWishlist: removeItemFromWishlist,
    isInWishlist,
    loadWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
