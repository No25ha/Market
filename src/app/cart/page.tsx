'use client';

import React, { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag } from 'react-icons/fi';
import Button from '@/components/ui/Button';


const CartPage = () => {
  const { cartItems, totalPrice, totalPriceAfterDiscount, isLoading: isCartLoading, removeFromCart, updateQuantity, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [loadingItems, setLoadingItems] = useState<Record<string, boolean>>({});


  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <div className="text-center">
          <FiShoppingBag className="text-6xl text-neutral-300 mb-4 mx-auto" />
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">Please Sign In</h2>
          <p className="text-neutral-600 mb-8">You need to be logged in to view your cart</p>
          <Button
            href="/signin"
            className="px-8 py-3"
          >
            Sign In Now
          </Button>


        </div>
      </div>
    );
  }

  if (isCartLoading && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin">
          <FiShoppingBag className="text-4xl text-primary-600" />
        </div>
      </div>
    );
  }

  if (cartItems.length === 0 && !showClearConfirm) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <div className="text-center">
          <FiShoppingBag className="text-6xl text-neutral-300 mb-4 mx-auto" />
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">Your Cart is Empty</h2>
          <p className="text-neutral-600 mb-8">Start adding your favorite products to your cart</p>
          <Link href="/products" className="inline-block px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const discount = totalPriceAfterDiscount ? totalPrice - totalPriceAfterDiscount : 0;
  const finalTotal = totalPriceAfterDiscount || totalPrice;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-neutral-900 flex items-center gap-3">
            <FiShoppingBag />
            Shopping Cart
          </h1>
          <p className="text-neutral-600 mt-2">You have {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cartItems.filter(item => item.product).map((item) => (
                <div key={item._id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex gap-6">
                  {/* Product Image */}
                  <div className="shrink-0 w-24 h-24 bg-neutral-100 rounded-lg overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.product.imageCover}
                      alt={item.product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-neutral-900 mb-1 line-clamp-2">
                      {item.product.title}
                    </h3>
                    <p className="text-sm text-neutral-600 line-clamp-1 mb-3">
                      {item.product.description?.substring(0, 60) || ''}...
                    </p>
                    <p className="font-bold text-primary-600">
                      EGP {item.product.priceAfterDiscount || item.product.price}
                    </p>
                  </div>

                  {/* Quantity & Actions */}
                  <div className="flex flex-col items-end gap-3">
                    {/* Quantity Control */}
                    <div className="flex items-center gap-2 bg-neutral-100 rounded-lg px-2 py-1">
                      <button
                        onClick={() => updateQuantity(item.product._id, item.count - 1)}
                        className="p-1 hover:bg-neutral-200 rounded transition"
                        disabled={item.count <= 1}
                        title="Decrease quantity"
                      >
                        <FiMinus size={16} />
                      </button>
                      <input
                        type="number"
                        value={item.count}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 1;
                          if (value > 0) updateQuantity(item.product._id, value);
                        }}
                        className="w-12 text-center bg-transparent focus:outline-none font-semibold"
                        min="1"
                        title="Product quantity"
                      />
                      <button
                        onClick={() => updateQuantity(item.product._id, item.count + 1)}
                        className="p-1 hover:bg-neutral-200 rounded transition"
                        title="Increase quantity"
                      >
                        <FiPlus size={16} />
                      </button>
                    </div>

                    {/* Total & Remove */}
                    <div className="text-right">
                      <p className="text-sm text-neutral-600 mb-2">
                        Subtotal: <span className="font-bold text-neutral-900">EGP {(item.price * item.count).toFixed(2)}</span>
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:bg-red-50"
                        onClick={async () => {
                          setLoadingItems(prev => ({ ...prev, [item.product._id]: true }));
                          await removeFromCart(item.product._id);
                          setLoadingItems(prev => ({ ...prev, [item.product._id]: false }));
                        }}
                        isLoading={loadingItems[item.product._id]}
                        title="Remove from cart"
                      >
                        <FiTrash2 size={20} />
                      </Button>

                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Clear Cart Button */}
            <Button
              variant="outline"
              className="mt-6 w-full border-red-500 text-red-600 hover:bg-red-50 font-semibold"
              onClick={() => setShowClearConfirm(true)}
            >
              Clear Entire Cart
            </Button>

          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-8 sticky top-28">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Order Summary</h2>

              {/* Summary Details */}
              <div className="space-y-4 mb-6 pb-6 border-b border-neutral-200">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">EGP {totalPrice.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-accent-600 font-semibold">
                    <span>Discount</span>
                    <span>-EGP {discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-neutral-600">
                  <span>Shipping</span>
                  <span className="font-semibold text-accent-600">FREE</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center mb-6 text-2xl">
                <span className="font-bold text-neutral-900">Total</span>
                <span className="font-bold text-primary-600">EGP {finalTotal.toFixed(2)}</span>
              </div>

              {/* Buttons */}
              <div className="space-y-3">
                <Button
                  href="/checkout"
                  variant="primary"
                  className="w-full py-4 text-lg font-black uppercase tracking-wide"
                >
                  Proceed to Checkout
                </Button>
                <Button
                  href="/products"
                  variant="outline"
                  className="w-full py-4 border-2 border-neutral-300 text-neutral-700 font-bold rounded-lg hover:bg-neutral-50 transition"
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Cart Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-sm w-full animate-slide-up">
            <h3 className="text-2xl font-bold text-neutral-900 mb-2">Clear Cart?</h3>
            <p className="text-neutral-600 mb-6">Are you sure you want to remove all items from your cart? This action cannot be undone.</p>
            <div className="flex gap-4">
              <button
                className="flex-1 px-4 py-2 border-2 border-neutral-300 text-neutral-700 font-semibold rounded-lg hover:bg-neutral-50 transition"
                onClick={() => setShowClearConfirm(false)}
              >
                Cancel
              </button>
              <Button
                variant="danger"
                className="flex-1"
                isLoading={isClearing}
                onClick={async () => {
                  setIsClearing(true);
                  await clearCart();
                  setIsClearing(false);
                  setShowClearConfirm(false);
                }}
              >
                Clear Cart
              </Button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
