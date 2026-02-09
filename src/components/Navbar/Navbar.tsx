'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useRouter } from 'next/navigation';
import {
  FiSearch,
  FiShoppingCart,
  FiMenu,
  FiMapPin,
  FiChevronDown,
} from 'react-icons/fi';
import Button from '@/components/ui/Button';


import { Category } from '@/types';
import { getAllCategories } from '@/services/categories';

export default function Navbar() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { cartItems } = useCart();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories', error);
      }
    };
    fetchCategories();
  }, []);

  // (اختياري) اقفل المنيو لو ضغطت برا
  useEffect(() => {
    const close = () => setShowUserMenu(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    router.push('/');
  };

  return (
    <div className="flex flex-col w-full z-50 bg-white">
      {/* Top Bar */}
      <div className="bg-[#232f3e] text-white text-xs py-2 px-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 cursor-pointer hover:text-gray-300">
            <FiMapPin />
            Deliver to{' '}
            <span className="font-bold">
              {user?.name ? user.name.split(' ')[0] : 'Cairo'}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/help" className="hover:text-gray-300">
            Help
          </Link>
          <Link href="/sell" className="hover:text-gray-300">
            Sell
          </Link>
          {!isAuthenticated && (
            <Link href="/signin" className="hover:text-gray-300">
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Main Header */}
      <nav className="bg-[#131921] text-white py-3 px-4 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-white mr-4"
          >
            Market<span className="text-[#f97316]">.</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="flex-1 max-w-3xl hidden md:flex h-10 rounded-md overflow-hidden bg-white">
            <div className="bg-gray-100 text-gray-700 px-3 flex items-center border-r border-gray-300 cursor-pointer hover:bg-gray-200">
              <span className="text-xs font-semibold">All</span>
              <FiChevronDown className="ml-1 w-3 h-3" />
            </div>

            <input
              type="text"
              placeholder="Search..."
              className="flex-1 px-3 text-black outline-none border-none placeholder-gray-500"
            />

            <button className="bg-[#f97316] hover:bg-[#ea580c] px-5 flex items-center justify-center transition-colors">
              <FiSearch className="text-white w-5 h-5" />
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-6">
            {/* Language */}
            <div className="hidden lg:flex items-center gap-1 font-bold cursor-pointer">
              <span>EN</span>
            </div>

            {/* Account & Lists */}
            <div
              className="relative cursor-pointer"
              onClick={(e) => {
                e.stopPropagation(); // علشان close بتاع window ما يقفلهاش فورًا
                setShowUserMenu((v) => !v);
              }}
            >
              <div className="text-xs leading-none text-gray-300">
                Hello, {user?.name ? user.name.split(' ')[0] : 'Sign in'}
              </div>
              <div className="text-sm font-bold flex items-center gap-1">
                Account & Lists <FiChevronDown />
              </div>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div
                  className="absolute top-10 right-0 w-56 bg-white text-black rounded-md shadow-lg p-2 z-50 border border-gray-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  {isAuthenticated ? (
                    <>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 hover:bg-gray-100 text-sm rounded"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Your Account
                      </Link>

                      <Link
                        href="/profile"
                        className="block px-4 py-2 hover:bg-gray-100 text-sm rounded font-bold text-gray-900 border-b border-gray-50 mb-1"
                        onClick={() => setShowUserMenu(false)}
                      >
                        My Profile
                      </Link>

                      <Link
                        href="/orders"
                        className="block px-4 py-2 hover:bg-gray-100 text-sm rounded"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Your Orders
                      </Link>

                      <Button
                        onClick={handleLogout}
                        variant="ghost"
                        className="w-full justify-start px-4 py-2 text-sm text-red-600 rounded"
                      >
                        Sign Out
                      </Button>

                    </>
                  ) : (
                    <div className="text-center p-2">
                      <Button
                        href="/signin"
                        variant="warning"
                        className="w-full py-2 rounded text-sm mb-2"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Sign in
                      </Button>

                      <div className="text-xs">
                        New customer?{' '}
                        <Link
                          href="/signup"
                          className="text-blue-600"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Start here.
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Returns & Orders */}
            <Link href="/orders" className="hidden lg:block cursor-pointer">
              <div className="text-xs leading-none text-gray-300">Returns</div>
              <div className="text-sm font-bold">& Orders</div>
            </Link>

            {/* Cart */}
            <Link href="/cart" className="flex items-end cursor-pointer relative">
              <div className="relative">
                <FiShoppingCart className="w-8 h-8" />
                <span className="absolute -top-1 -right-1 bg-[#f97316] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {cartItems.length}
                </span>
              </div>
              <span className="font-bold text-sm mb-1 hidden md:inline">
                Cart
              </span>
            </Link>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mt-3 flex h-10 rounded-md overflow-hidden bg-white mx-auto">
          <input
            type="text"
            placeholder="Search..."
            className="flex-1 px-3 outline-none text-black"
          />
          <button className="bg-[#f97316] px-4">
            <FiSearch className="text-white" />
          </button>
        </div>
      </nav>

      {/* Categories Bar */}
      <div className="bg-[#232f3e] text-white py-2 px-4 shadow-sm">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium">
          <Link
            href="/products"
            className="flex items-center gap-1 hover:text-[#f97316] transition-colors font-bold"
          >
            <FiMenu className="w-5 h-5" /> All
          </Link>

          {categories.slice(0, 20).map((cat) => (
            <Link
              key={cat._id}
              href={`/products/category/${cat._id}`}
              className="hover:text-[#f97316] transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
