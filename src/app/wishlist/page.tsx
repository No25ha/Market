'use client';

import React from 'react';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard/ProductCard';
import { FiHeart } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import { useState } from 'react';


const WishlistPage = () => {
  const { wishlistItems, isLoading, removeFromWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const [removingIds, setRemovingIds] = useState<Record<string, boolean>>({});


  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <FiHeart className="text-6xl text-gray-300 mb-4 mx-auto" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Please Sign In</h2>
          <p className="text-gray-600 mb-8">You need to be logged in to view your wishlist</p>
          <Button href="/signin" className="px-8 py-3">
            Sign In Now
          </Button>

        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <FiHeart className="text-6xl text-gray-300 mb-4 mx-auto" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Wishlist is Empty</h2>
          <p className="text-gray-600 mb-8">Start adding your favorite products to your wishlist</p>
          <Button href="/products" className="px-8 py-3">
            Browse Products
          </Button>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 flex items-center gap-3 mb-2">
            <FiHeart size={32} className="text-red-500" />
            My Wishlist
          </h1>
          <p className="text-gray-600">{wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} saved</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 lg:gap-6">
          {wishlistItems.map((item) => (
            <div key={item._id} className="relative group">
              <ProductCard product={{ ...item, quantity: item.quantity ?? 0 }} />
              <Button
                variant="danger"
                size="icon"
                className="absolute -top-2 -right-2 w-8 h-8 shadow-lg opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100"
                onClick={async () => {
                  setRemovingIds(prev => ({ ...prev, [item._id]: true }));
                  await removeFromWishlist(item._id);
                  setRemovingIds(prev => ({ ...prev, [item._id]: false }));
                }}
                isLoading={removingIds[item._id]}
                title="Remove from wishlist"
              >
                ✕
              </Button>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
