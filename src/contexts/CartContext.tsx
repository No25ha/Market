'use client';

import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getCart, addToCart, removeFromCart, updateCartItem, clearCart, applyCouponToCart } from '@/services/cart';
import { CartItem } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { isTransientError } from '@/api/api';

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
  applyCoupon: (couponName: string) => Promise<void>;
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

  // Unified Robust Retry Helper
  const withRetry = useCallback(async <T,>(fn: () => Promise<T>, retries = 5, delay = 1500): Promise<T> => {
    try {
      return await fn();
    } catch (err: any) {
      if (retries > 0 && isTransientError(err)) {
        console.warn(`Transient Cart API error. Retrying... (${retries} left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        const nextDelay = delay * 2 + Math.random() * 500;
        return withRetry(fn, retries - 1, nextDelay);
      }
      throw err;
    }
  }, []);

  const loadCart = useCallback(async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      setIsError(null);
      const response = await withRetry(() => getCart(token));

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
        console.log('Cart loaded successfully');
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to load cart';
      setIsError(error);
      console.error('Final load cart error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token, withRetry]);

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

    try {
      setIsError(null);
      await withRetry(() => addToCart({ productId }, token));
      await loadCart();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to add to cart';
      setIsError(errorMsg);
      console.error('Final add to cart error:', errorMsg);
    }
  };

  const removeItemFromCart = async (productId: string) => {
    if (!token) {
      setIsError('Please login to manage cart');
      return;
    }

    try {
      setIsError(null);
      await withRetry(() => removeFromCart(productId, token));
      await loadCart();
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to remove from cart';
      setIsError(error);
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
      await withRetry(() => updateCartItem(productId, { quantity }, token));
      await loadCart();
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to update quantity';
      setIsError(error);
    }
  };

  const clearUserCart = async () => {
    if (!token) {
      setIsError('Please login to manage cart');
      return;
    }

    try {
      setIsError(null);
      await withRetry(() => clearCart(token));
      setCartItems([]);
      setTotalPrice(0);
      setTotalPriceAfterDiscount(undefined);
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to clear cart';
      setIsError(error);
    }
  };

  const applyCoupon = async (couponName: string) => {
    if (!token) {
      setIsError('Please login to apply coupon');
      return;
    }

    try {
      setIsLoading(true);
      setIsError(null);
      await withRetry(() => applyCouponToCart({ couponName }, token));
      await loadCart();
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to apply coupon';
      setIsError(error);
      throw err;
    } finally {
      setIsLoading(false);
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
    applyCoupon,
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
