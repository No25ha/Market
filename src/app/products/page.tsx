'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ProductCard from '@/components/ProductCard/ProductCard';
import { fetchProducts, getProductsBySubCategory } from '@/services/products';
import { getAllSubCategories } from '@/services/subCategories';
import { Product, SubCategory } from '@/types';
import { FiAlertCircle, FiRefreshCw, FiGrid, FiTarget } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import SubCategoryFilter from '@/components/SubCategoryFilter/SubCategoryFilter';

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [selectedSub, setSelectedSub] = useState<SubCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [productsData, subCatsData] = await Promise.all([
        fetchProducts(),
        getAllSubCategories()
      ]);
      setProducts(productsData);
      setSubCategories(subCatsData);
    } catch (err) {
      setError('Failed to load products and categories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubSelect = async (sub: SubCategory | null) => {
    try {
      setProductsLoading(true);
      setSelectedSub(sub);

      let productsData;
      if (sub) {
        productsData = await getProductsBySubCategory(sub._id);
      } else {
        productsData = await fetchProducts();
      }
      setProducts(productsData);
    } catch (err) {
      console.error('Error filtering products:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
          <p className="text-gray-500 mt-2">Discover our complete collection of {products?.length || 0} amazing products</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Filter Section */}
        {!error && subCategories.length > 0 && (
          <SubCategoryFilter
            subCategories={subCategories}
            selectedSubId={selectedSub?._id || null}
            onSelect={handleSubSelect}
            title="Explore by Style"
          />
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
                <div className="bg-gray-200 h-64 w-full"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/4 mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <FiAlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-gray-900">Something Went Wrong</h2>
            <p className="text-gray-500 mt-2 mb-6">{error}</p>
            <Button
              onClick={loadInitialData}
              className="flex items-center gap-2"
              isLoading={loading}
            >
              <FiRefreshCw /> Try Again
            </Button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="space-y-1">
                <p className="font-black text-gray-900 uppercase tracking-widest text-xs">
                  {selectedSub ? `Displaying ${selectedSub.name}` : 'All Collections'}
                </p>
                <p className="font-medium text-gray-400 text-sm">Showing {products.length} products</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => selectedSub ? handleSubSelect(selectedSub) : loadInitialData()}
                className="flex items-center gap-2 text-blue-600 font-bold"
                isLoading={productsLoading}
              >
                <FiRefreshCw /> {productsLoading ? 'Syncing...' : 'Refresh Items'}
              </Button>
            </div>

            {productsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 opacity-60 pointer-events-none">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse h-[400px]"></div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-gray-100 text-center">
                <FiTarget className="w-16 h-16 text-gray-200 mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">No Matching Products</h2>
                <p className="text-gray-500">Try choosing a different category above</p>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() => handleSubSelect(null)}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
