'use client';

import React, { useState, useEffect } from 'react';
import BrandCard from '@/components/BrandCard/BrandCard';
import { getAllBrands } from '@/services/brands';
import { Brand } from '@/types';
import { FiRefreshCw } from 'react-icons/fi';

const BrandsPage = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBrands = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllBrands();
      setBrands(data);
    } catch (err) {
      console.error('Error loading brands:', err);
      setError('Failed to load brands');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-white to-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-b from-white to-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-12">
          <div className="bg-white border border-red-200 rounded-xl p-8 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadBrands}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <FiRefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50">
      <div className="sticky top-16 z-10 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-6 sm:py-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Our Brands</h1>
          <p className="text-gray-600 mt-2">Discover premium brands from around the world</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-8 sm:py-12">
        {brands.length > 0 ? (
          <>
            <p className="text-gray-600 text-sm mb-6">Showing {brands.length} brands</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
              {brands.map((brand) => (
                <BrandCard key={brand._id} brand={brand} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-4xl mb-4">🏢</p>
            <p className="text-gray-600 text-lg">No brands available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandsPage;
