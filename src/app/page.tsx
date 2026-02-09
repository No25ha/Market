'use client';

import { useEffect, useState } from 'react';
import { fetchProducts } from '@/services/products';
import { Product } from '@/types';
import ProductCard from '@/components/ProductCard/ProductCard';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (error) {
        console.error('Failed to load products', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <main className="bg-gray-100 min-h-screen pb-12">
      {/* Hero Banner */}
      <div className="relative w-full h-[200px] md:h-[300px] lg:h-[400px] bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="absolute inset-0 flex items-center justify-center text-white z-10">
          <div className="text-center px-4">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Welcome to Market.</h1>
            <p className="text-lg md:text-xl mb-6 text-gray-200">The best deals on electronics, fashion, and more.</p>
            <Link href="/products" className="bg-[#f97316] hover:bg-[#ea580c] text-white font-bold py-2 px-6 rounded-md transition-colors">
              Shop Now
            </Link>
          </div>
        </div>
        {/* Abstract background pattern or image could go here */}
      </div>

      {/* Main Content Container - Overlapping the banner slightly like Amazon/Noon */}
      <div className="max-w-[1440px] mx-auto px-4 -mt-16 relative z-20">

        {/* Deal of the Day / Categories Row (Optional placeholders for now) */}

        {/* Products Grid */}
        <div className="bg-transparent">
          <h2 className="text-xl font-bold mb-4 text-gray-800 bg-white p-4 rounded-t-md shadow-sm border-b border-gray-200 inline-block">Recommended For You</h2>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-md shadow-sm h-80 animate-pulse">
                  <div className="bg-gray-200 h-48 w-full mb-4 rounded"></div>
                  <div className="bg-gray-200 h-4 w-3/4 mb-2 rounded"></div>
                  <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
