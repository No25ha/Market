'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useOrder } from '@/hooks/useOrder';
import { useAuth } from '@/hooks/useAuth';
import { FiShoppingBag, FiPackage, FiCalendar, FiClock, FiTruck, FiChevronRight, FiCheckCircle, FiInfo } from 'react-icons/fi';
import Button from '@/components/ui/Button';

export default function OrdersPage() {
  const { orders, isLoading, error, refreshOrders } = useOrder();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-[2rem] shadow-xl p-10 text-center border border-gray-100">
          <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
            <FiShoppingBag size={48} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter">Your Journey Awaits</h2>
          <p className="text-gray-500 mb-10 font-medium">Sign in to unlock your exclusive order history and track your latest premium purchases.</p>
          <Button href="/signin" className="w-full py-4 rounded-2xl shadow-xl shadow-blue-100 font-black uppercase tracking-widest">
            Sign In Now
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-600 border-t-transparent shadow-xl"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FiPackage className="text-blue-600 animate-pulse" size={24} />
            </div>
          </div>
          <p className="text-gray-500 font-black text-lg tracking-tight animate-pulse">Retrieving your collection...</p>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full text-center">
          <div className="w-32 h-32 bg-white text-gray-200 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-sm border border-gray-100">
            <FiPackage size={64} />
          </div>
          <h2 className="text-5xl font-black text-gray-900 mb-6 tracking-tighter">No Orders Yet</h2>
          <p className="text-gray-500 mb-12 text-xl font-medium max-w-lg mx-auto">Your collection is waiting to be started. Explore our premium selection and place your first order today.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="/products" className="px-12 py-5 rounded-2xl shadow-2xl shadow-blue-100 font-black uppercase tracking-widest text-lg">
              Start Shopping
            </Button>
            <Button href="/" variant="outline" className="px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-lg border-2">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'delivered') return 'bg-green-50 text-green-600 border-green-100';
    if (s === 'shipped' || s === 'processing') return 'bg-blue-50 text-blue-600 border-blue-100';
    if (s === 'cancelled') return 'bg-red-50 text-red-600 border-red-100';
    return 'bg-amber-50 text-amber-600 border-amber-100';
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1100px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] rounded-full border border-blue-100 mb-4">
              Your Dashboard
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter">My Orders</h1>
            <p className="text-gray-500 mt-4 text-lg font-medium">Manage and track your premium purchase history</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 shrink-0">
            <Button
              onClick={() => refreshOrders()}
              variant="outline"
              className="rounded-2xl border-2 px-6 py-3 font-bold uppercase tracking-widest text-xs"
              isLoading={isLoading}
            >
              Refresh List
            </Button>
            <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                <FiPackage size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Orders</p>
                <p className="text-2xl font-black text-gray-900">{orders.length}</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-10 bg-red-50 border border-red-100 p-6 rounded-3xl flex items-center gap-4 text-red-600 animate-slide-up">
            <FiInfo size={24} className="shrink-0" />
            <div>
              <p className="font-black uppercase text-xs tracking-widest mb-1">System Message</p>
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-10">
          {orders.map((order) => (
            <div key={order._id} className="group bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-blue-50 transition-all duration-500 hover:-translate-y-1">
              {/* Order Header */}
              <div className="p-8 md:p-10 bg-gray-50/50 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-wrap items-center gap-6 md:gap-10">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order ID</p>
                    <p className="text-lg font-black text-gray-900">#{order._id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date Placed</p>
                    <div className="flex items-center gap-2 text-gray-700 font-bold">
                      <FiCalendar size={18} className="text-blue-600" />
                      {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Amount</p>
                    <p className="text-xl font-black text-blue-600 tracking-tighter">EGP {order.totalOrderPrice.toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <span className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full border text-sm font-black uppercase tracking-widest shadow-sm ${getStatusColor(order.orderStatus)}`}>
                    <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                    {order.orderStatus || 'Processing'}
                  </span>
                </div>
              </div>

              {/* Order Content */}
              <div className="p-8 md:p-10">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-8">Shipment Items</h4>
                <div className="grid gap-8">
                  {order.cartItems.map((item, index) => {
                    const product = item.product || {};
                    const title = product.title || 'Product';
                    const imageCover = product.imageCover || 'https://via.placeholder.com/150';
                    const quantity = item.count || (item as any).quantity || 0;

                    return (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 bg-gray-50/30 rounded-3xl border border-gray-50 group-hover:bg-white group-hover:border-blue-50 transition-all duration-500">
                        <div className="flex items-center gap-6">
                          <div className="relative w-24 h-24 bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm shrink-0 flex items-center justify-center p-4">
                            <Image
                              src={imageCover}
                              alt={title}
                              fill
                              className="object-contain p-2"
                            />
                          </div>
                          <div className="space-y-2">
                            <h5 className="font-bold text-gray-900 text-lg line-clamp-1">{title}</h5>
                            <div className="flex items-center gap-4">
                              <span className="text-xs font-black text-gray-400 uppercase tracking-widest bg-white px-2 py-1 rounded-lg border border-gray-100">Qty: {quantity}</span>
                              <span className="text-sm font-bold text-gray-700">EGP {item.price.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:block text-right">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 sm:hidden">Total</p>
                          <p className="text-xl font-black text-gray-900">EGP {(item.price * quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Order Bottom Section */}
                <div className="mt-12 pt-10 border-t-2 border-dashed border-gray-100 grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Shipping Address */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600">
                        <FiTruck size={20} />
                      </div>
                      <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs">Shipping Logistics</h4>
                    </div>
                    <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 space-y-3">
                      <p className="text-gray-900 font-bold">{order.shippingAddress?.details || 'Details not available'}</p>
                      <div className="flex items-center gap-2 text-gray-500 font-medium text-sm">
                        <span className="bg-white px-3 py-1 rounded-lg border border-gray-100 text-xs font-black uppercase">{order.shippingAddress?.city || 'N/A'}</span>
                        <span>•</span>
                        <span>{order.shippingAddress?.phone || 'No phone'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Totals & Meta */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600">
                        <FiInfo size={20} />
                      </div>
                      <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs">Financial Summary</h4>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center px-2">
                        <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Payment Method</span>
                        <span className="text-gray-900 font-black uppercase text-xs bg-white px-3 py-1 rounded-lg border border-gray-100 shadow-sm italic underline decoration-blue-500 decoration-2">
                          {order.paymentMethodType === 'card' ? 'Online Payment' : 'Cash On Delivery'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center px-2">
                        <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Status</span>
                        <span className="text-green-600 font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
                          {order.isPaid ? <><FiCheckCircle /> Paid</> : <><FiClock /> Pending Payment</>}
                        </span>
                      </div>
                      <div className="bg-blue-600 h-px w-full my-6 opacity-10"></div>
                      <div className="flex justify-between items-end p-6 bg-blue-600 rounded-3xl text-white shadow-xl shadow-blue-100">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Total Verified Amount</p>
                          <h3 className="text-3xl font-black tracking-tighter">EGP {order.totalOrderPrice.toLocaleString()}</h3>
                        </div>
                        <FiChevronRight size={32} className="opacity-50" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-up {
                    animation: slide-up 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards;
                }
            `}</style>
    </div>
  );
}
