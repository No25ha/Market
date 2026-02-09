'use client';
import React, { useState, useEffect } from 'react';
import CategoryCard from '@/components/CategoryCard/CategoryCard';
import { getAllCategories } from '@/services/categories';
import { Category } from '@/types';
import SubCategoryTabs from '@/components/SubCategoryTabs/SubCategoryTabs';

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const data = await getAllCategories();
        setCategories(data);
        setError(null);
      } catch (err) {
        setError('Failed to load categories');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50">
      <div className="bg-white border-b border-gray-200 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Shop by Category</h1>
          <p className="text-gray-600">Explore our carefully curated collection</p>
        </div>
      </div>


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm animate-pulse overflow-hidden">
                <div className="bg-gray-200 aspect-square rounded-t-xl" />
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          // Error State
          <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-12 text-center">
            <p className="text-lg text-red-600 font-medium">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Try Again
            </button>
          </div>
        ) : categories.length > 0 ? (

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((category) => (
              <CategoryCard key={category._id} category={category} />
            ))}
          </div>
        ) : (

          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📂</div>
            <p className="text-lg text-gray-600">No categories found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
