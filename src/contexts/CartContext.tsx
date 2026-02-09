'use client';

import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getCart, addToCart, removeFromCart, updateCartItem, clearCart } from '@/services/cart';
import { CartItem } from '@/types';
import { useAuth } from '@/hooks/useAuth';

export interface CartContextType {
  cartItems: CartItem[];
  totalPrice: number;
  totalPriceAfterDiscount?: number;
  isLoading: boolean;
  isError: string | null;
  addToCart: (productId: string) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isInCart: (productId: string) => boolean;
  getCartItemQuantity: (productId: string) => number;
  loadCart: () => Promise<void>;
  cartId: string | null;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<string | null>(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalPriceAfterDiscount, setTotalPriceAfterDiscount] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState<string | null>(null);
  const { token, isAuthenticated } = useAuth();

  const loadCart = useCallback(async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      setIsError(null);
      const response = await getCart(token);

      if (response) {
        const id = response.data?._id || response.data?.id || response.cartId || response._id;
        setCartId(id || null);
        setCartItems(response.data?.products || []);
        setTotalPrice(response.data?.totalCartPrice || 0);
        setTotalPriceAfterDiscount(response.data?.totalPriceAfterDiscount);

        // Save to localStorage as a fallback
        if (id) {
          localStorage.setItem('cartId', id);
        }
        console.log('Cart loaded with ID:', id);
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to load cart';
      setIsError(error);
      console.error('Load cart error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Load cart on mount and when auth changes
  useEffect(() => {
    const initCart = async () => {
      if (isAuthenticated && token) {
        await loadCart();
      } else {
        setCartItems([]);
        setTotalPrice(0);
        setTotalPriceAfterDiscount(undefined);
      }
    };

    initCart();
  }, [isAuthenticated, token, loadCart]);

  const addItemToCart = async (productId: string) => {
    if (!token) {
      setIsError('Please login to add items to cart');
      return;
    }

    const MAX_RETRIES = 2;
    let attempt = 0;

    const performAdd = async (): Promise<void> => {
      try {
        setIsError(null);
        await addToCart({ productId }, token);
        await loadCart();
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to add to cart';

        // Simple retry for "Pool was force destroyed" or 500 errors
        if (attempt < MAX_RETRIES && (errorMsg.includes('Pool') || errorMsg.includes('500'))) {
          attempt++;
          console.warn(`Retry attempt ${attempt} for product ${productId}`);
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          return performAdd();
        }

        setIsError(errorMsg);
        console.error('Add to cart error after retries:', errorMsg);
        throw err; // Re-throw to allow component to handle loading state
      }
    };

    try {
      await performAdd();
    } catch (err) {
      // Error already handled in performAdd
    }
  };

  const removeItemFromCart = async (productId: string) => {
    if (!token) {
      setIsError('Please login to manage cart');
      return;
    }

    try {
      setIsError(null);
      await removeFromCart(productId, token);
      // Remove from local state optimistically
      setCartItems(cartItems.filter(item => item.product?._id !== productId));
      // Reload to ensure consistency
      await loadCart();
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to remove from cart';
      setIsError(error);
      console.error('Remove from cart error:', error);
    }
  };

  const updateItemQuantity = async (productId: string, quantity: number) => {
    if (!token) {
      setIsError('Please login to manage cart');
      return;
    }

    if (quantity < 1) {
      await removeItemFromCart(productId);
      return;
    }

    try {
      setIsError(null);
      await updateCartItem(productId, { quantity }, token);
      // Reload cart to get updated prices
      await loadCart();
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to update quantity';
      setIsError(error);
      console.error('Update quantity error:', error);
    }
  };

  const clearUserCart = async () => {
    if (!token) {
      setIsError('Please login to manage cart');
      return;
    }

    try {
      setIsError(null);
      await clearCart(token);
      setCartItems([]);
      setTotalPrice(0);
      setTotalPriceAfterDiscount(undefined);
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to clear cart';
      setIsError(error);
      console.error('Clear cart error:', error);
    }
  };

  const isInCart = (productId: string): boolean => {
    return cartItems.some(item => item.product?._id === productId);
  };

  const getCartItemQuantity = (productId: string): number => {
    const item = cartItems.find(item => item.product?._id === productId);
    return item?.count || 0;
  };

  const value: CartContextType = {
    cartItems,
    totalPrice,
    totalPriceAfterDiscount,
    isLoading,
    isError,
    addToCart: addItemToCart,
    removeFromCart: removeItemFromCart,
    updateQuantity: updateItemQuantity,
    clearCart: clearUserCart,
    isInCart,
    getCartItemQuantity,
    loadCart,
    cartId,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
