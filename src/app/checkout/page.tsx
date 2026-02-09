'use client';

import React, { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { useAddress } from '@/hooks/useAddress';
import { useAuth } from '@/hooks/useAuth';
import { useOrder } from '@/hooks/useOrder';
import { createCashOrder, createCheckoutSession } from '@/services/orders';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { FiMapPin, FiPhone, FiCreditCard, FiPackage, FiCheckCircle, FiChevronRight, FiPlus, FiTrash2, FiShoppingBag, FiTruck, FiDollarSign } from 'react-icons/fi';

const CheckoutPage = () => {
  const { cartItems, totalPrice, totalPriceAfterDiscount, clearCart, cartId } = useCart();
  const { addresses, selectedAddressId, selectAddress, addAddress, removeAddress } = useAddress();
  const { isAuthenticated, user, token: authToken } = useAuth();
  const { refreshOrders } = useOrder();
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [formData, setFormData] = useState({
    name: '',
    details: '',
    phone: '',
    city: '',
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[2rem] shadow-xl p-12 text-center max-w-lg border border-gray-100">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <FiCheckCircle size={40} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Please Sign In</h2>
          <p className="text-gray-500 mb-8 text-lg font-medium leading-relaxed">You need to be logged in to access checkout and secure your orders.</p>
          <Button href="/signin" className="w-full py-4 text-lg font-bold rounded-2xl shadow-xl shadow-blue-100">
            Sign In Now
          </Button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[2rem] shadow-xl p-12 text-center max-w-lg border border-gray-100">
          <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <FiShoppingBag size={40} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Your Cart is Empty</h2>
          <p className="text-gray-500 mb-8 text-lg font-medium leading-relaxed">Add items to your cart before proceeding to checkout.</p>
          <Button href="/products" className="w-full py-4 text-lg font-bold rounded-2xl shadow-xl shadow-orange-100" variant="warning">
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.details || !formData.phone || !formData.city) {
      alert('Please fill all fields');
      return;
    }
    await addAddress(formData);
    setFormData({ name: '', details: '', phone: '', city: '' });
    setShowAddAddressForm(false);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddressId) {
      alert('Please select a delivery address');
      return;
    }

    try {
      setIsPlacingOrder(true);
      const selectedAddress = addresses.find(addr => addr._id === selectedAddressId);

      if (!selectedAddress) {
        alert('Please select a delivery address');
        return;
      }

      if (!authToken) {
        alert('Your session has expired. Please sign in again.');
        return;
      }

      const orderId = cartId || localStorage.getItem('cartId');

      if (!orderId || orderId === 'undefined') {
        alert('Your cart has expired or is invalid. Please add items again.');
        return;
      }

      const orderData = {
        shippingAddress: {
          details: selectedAddress.details,
          phone: selectedAddress.phone,
          city: selectedAddress.city,
        },
      };

      if (paymentMethod === 'card') {
        const returnUrl = window.location.origin;
        const response = await createCheckoutSession(orderId, orderData, authToken, returnUrl);

        if (response.status === 'success' && response.session?.url) {
          window.location.href = response.session.url;
          return;
        } else {
          throw new Error('Failed to create payment session');
        }
      } else {
        await createCashOrder(orderId, orderData, authToken);
        await refreshOrders();
        setOrderPlaced(true);

        setTimeout(() => {
          clearCart();
        }, 2000);
      }
    } catch (error) {
      alert('Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-12 text-center max-w-2xl border border-gray-100 animate-fade-in">
          <div className="w-24 h-24 bg-green-50 text-green-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner animate-bounce">
            <FiCheckCircle size={48} />
          </div>
          <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter">Order Placed Successfully!</h2>
          <p className="text-gray-500 text-xl font-medium mb-2">Thank you for your purchase, {user?.name}</p>
          <div className="bg-green-50/50 rounded-2xl py-4 px-8 inline-block mb-10 border border-green-100">
            <p className="text-green-700 font-black text-2xl uppercase tracking-widest">
              Total: EGP {(totalPriceAfterDiscount || totalPrice).toFixed(2)}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button href="/orders" variant="outline" className="py-4 text-lg font-bold rounded-2xl border-2">
              View My Orders
            </Button>
            <Button href="/products" variant="primary" className="py-4 text-lg font-bold rounded-2xl shadow-xl shadow-blue-100">
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const finalTotal = totalPriceAfterDiscount || totalPrice;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 pt-8">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-8 ml-1">
          <Link href="/cart" className="hover:text-blue-600 transition-colors">Cart</Link>
          <FiChevronRight size={14} />
          <span className="text-gray-900 font-bold">Checkout</span>
        </nav>

        <h1 className="text-4xl font-black text-gray-900 mb-10 tracking-tight flex items-center gap-4 px-1">
          Secure Checkout
          <span className="text-sm font-bold bg-blue-100 text-blue-600 px-3 py-1 rounded-full uppercase tracking-widest">Secure SSL</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* LEFT: Shipping & Address */}
          <div className="lg:col-span-8 flex flex-col gap-8">

            {/* Delivery Section */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 lg:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-bl-[4rem] -mr-8 -mt-8 -z-0"></div>

              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                    <FiMapPin size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Shipping Address</h2>
                    <p className="text-gray-400 font-medium">Where should we deliver your order?</p>
                  </div>
                </div>

                {addresses.length > 0 && (
                  <button
                    onClick={() => setShowAddAddressForm(!showAddAddressForm)}
                    className={`font-bold flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${showAddAddressForm ? 'text-red-500 bg-red-50' : 'text-blue-600 bg-blue-50 hover:bg-blue-100'}`}
                  >
                    {showAddAddressForm ? 'Cancel' : <><FiPlus /> New Address</>}
                  </button>
                )}
              </div>

              {/* Add Address Form */}
              {showAddAddressForm || addresses.length === 0 ? (
                <form onSubmit={handleAddAddress} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 p-6 lg:p-8 rounded-3xl border border-gray-100 mb-8 animate-slide-down">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Address Label</label>
                    <input
                      type="text"
                      placeholder="e.g. Home, Work, Parents..."
                      className="w-full h-14 px-6 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-900 shadow-sm"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Full Address Details</label>
                    <textarea
                      placeholder="Street address, building number, apartment..."
                      className="w-full h-32 p-6 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-900 shadow-sm"
                      value={formData.details}
                      onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">City</label>
                    <input
                      type="text"
                      placeholder="Cairo, Giza, Alexandria..."
                      className="w-full h-14 px-6 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-900 shadow-sm"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+20 XXX XXX XXXX"
                      className="w-full h-14 px-6 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-900 shadow-sm"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2 pt-2">
                    <Button type="submit" className="w-full py-4 rounded-2xl shadow-xl shadow-blue-100 font-black tracking-widest uppercase">
                      Save and Use This Address
                    </Button>
                  </div>
                </form>
              ) : null}

              {/* Address Cards */}
              {!showAddAddressForm && addresses.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr._id}
                      onClick={() => selectAddress(addr._id)}
                      className={`relative border-2 rounded-3xl p-6 cursor-pointer transition-all ${selectedAddressId === addr._id ? 'border-blue-600 bg-blue-50/30' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                    >
                      {selectedAddressId === addr._id && (
                        <div className="absolute top-4 right-4 text-blue-600">
                          <FiCheckCircle size={24} />
                        </div>
                      )}
                      <h4 className="font-black text-gray-900 text-lg mb-2 flex items-center gap-2">
                        {addr.name}
                      </h4>
                      <p className="text-gray-500 font-medium mb-4 line-clamp-2 text-sm leading-relaxed">{addr.details}</p>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-400 flex items-center gap-2 uppercase tracking-wider">
                          <FiTruck className="inline" /> {addr.city}
                        </p>
                        <p className="text-xs font-bold text-gray-400 flex items-center gap-2 uppercase tracking-wider">
                          <FiPhone className="inline" /> {addr.phone}
                        </p>
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); removeAddress(addr._id); }}
                        className="absolute bottom-6 right-6 text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Section */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 lg:p-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-gray-200">
                  <FiCreditCard size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Payment Method</h2>
                  <p className="text-gray-400 font-medium">Choose how you want to pay</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cash on Delivery */}
                <div
                  onClick={() => setPaymentMethod('cash')}
                  className={`relative border-2 rounded-3xl p-6 cursor-pointer transition-all ${paymentMethod === 'cash' ? 'border-blue-600 bg-blue-50/30' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-colors ${paymentMethod === 'cash' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      <FiDollarSign size={20} />
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900">Cash on Delivery</h4>
                      <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Pay at doorstep</p>
                    </div>
                  </div>
                  {paymentMethod === 'cash' && <FiCheckCircle size={24} className="absolute top-6 right-6 text-blue-600" />}
                </div>

                {/* Online Payment */}
                <div
                  onClick={() => setPaymentMethod('card')}
                  className={`relative border-2 rounded-3xl p-6 cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-blue-600 bg-blue-50/30' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-colors ${paymentMethod === 'card' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      <FiCreditCard size={20} />
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900">Online Payment</h4>
                      <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Secure Card Payment</p>
                    </div>
                  </div>
                  {paymentMethod === 'card' && <FiCheckCircle size={24} className="absolute top-6 right-6 text-blue-600" />}
                </div>
              </div>

              <p className="mt-8 text-sm text-gray-400 italic px-2">
                <FiPackage className="inline mr-2" />
                {paymentMethod === 'cash'
                  ? "Pay securely with cash once your package arrives at your doorstep."
                  : "You will be redirected to a secure payment gateway to complete your transaction."}
              </p>
            </div>

          </div>

          {/* RIGHT: Order Recap */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 flex flex-col gap-6">
            <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gray-900 px-8 py-6 flex items-center justify-between">
                <h2 className="text-white font-black text-xl tracking-tight uppercase">Order Summary</h2>
                <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest">
                  {cartItems.length} ITEMS
                </span>
              </div>

              <div className="p-8">
                {/* Mini Cart Scroll */}
                <div className="max-h-[320px] overflow-y-auto mb-8 pr-2 scrollbar-hide space-y-4">
                  {cartItems.map((item) => (
                    <div key={item._id} className="flex gap-4 items-center">
                      <div className="shrink-0 w-16 h-16 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 p-2">
                        <img src={item.product.imageCover} alt={item.product.title} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate leading-tight mb-1">{item.product.title}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">Qty: {item.count}</span>
                          <span className="text-sm font-black text-gray-900">EGP {item.price.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <hr className="border-gray-100 mb-6" />

                <div className="space-y-3 mb-8">
                  <div className="flex justify-between items-center group">
                    <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest group-hover:text-gray-600 transition-colors">Subtotal</span>
                    <span className="font-black text-gray-900">EGP {totalPrice.toLocaleString()}</span>
                  </div>

                  {totalPriceAfterDiscount && totalPriceAfterDiscount !== totalPrice && (
                    <div className="flex justify-between items-center group">
                      <span className="text-red-400 font-bold uppercase text-[10px] tracking-widest group-hover:text-red-500">Discount Applied</span>
                      <span className="font-black text-red-500">-EGP {(totalPrice - totalPriceAfterDiscount).toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center group">
                    <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest group-hover:text-gray-600">Shipping</span>
                    <span className="font-black text-green-500 uppercase text-xs">FREE</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900 font-black text-xl uppercase tracking-tighter">Total</span>
                    <div className="text-right">
                      <div className="text-3xl font-black text-blue-600 leading-none">EGP {finalTotal.toLocaleString()}</div>
                      <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest leading-none">Inc. VAT</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handlePlaceOrder}>
                  <Button
                    type="submit"
                    className="w-full h-16 rounded-2xl shadow-2xl shadow-blue-200 font-black text-lg uppercase tracking-widest"
                    isLoading={isPlacingOrder}
                    disabled={cartItems.length === 0 || (!selectedAddressId && addresses.length === 0)}
                    onClick={() => {
                      console.log("Attempting to place order...", { cartId, storageCartId: localStorage.getItem('cartId'), selectedAddressId });
                    }}
                  >
                    {!selectedAddressId && addresses.length > 0 ? 'Select an Address' : 'Place Order Now'}
                  </Button>

                  <Link href="/cart" className="flex items-center justify-center gap-2 mt-4 text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest">
                    Back to Shopping Cart
                  </Link>
                </form>
              </div>
            </div>

            {/* Nudge */}
            <div className="bg-blue-600 rounded-2xl p-6 text-white text-center shadow-lg shadow-blue-200 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-20 h-20 bg-white/10 rounded-br-[3rem] -z-0"></div>
              <h4 className="font-black uppercase tracking-widest text-xs mb-1 relative z-10">Safe & Reliable</h4>
              <p className="text-[10px] font-bold text-blue-100 opacity-80 uppercase leading-relaxed relative z-10">Enjoy peace of mind with our 14-day easy return policy.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
