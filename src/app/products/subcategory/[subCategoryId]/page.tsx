'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard/ProductCard';
import { getProductsBySubCategory } from '@/services/products';
import { getSubCategoryById, getSubCategoriesByCategoryId } from '@/services/subCategories';
import { Product, SubCategory } from '@/types';
import { FiGrid, FiLayers, FiChevronRight, FiArrowLeft } from 'react-icons/fi';

const SubCategoryProductsPage = () => {
  const params = useParams();
  const subCategoryId = params?.subCategoryId as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [subCategory, setSubCategory] = useState<SubCategory | null>(null);
  const [siblings, setSiblings] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch current subcategory details
        const subCategoryData = await getSubCategoryById(subCategoryId);
        setSubCategory(subCategoryData);

        if (subCategoryData) {
          // Fetch products and sibling subcategories in parallel
          const [productsData, siblingsData] = await Promise.all([
            getProductsBySubCategory(subCategoryId),
            getSubCategoriesByCategoryId(subCategoryData.category)
          ]);

          setProducts(productsData);
          setSiblings(siblingsData);
        }
      } catch (err) {
        setError('Failed to load products');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (subCategoryId) {
      loadData();
    }
  }, [subCategoryId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <FiChevronRight className="w-3 h-3" />
          <Link href={`/products/category/${subCategory?.category}`} className="hover:text-primary-600 transition-colors">Category</Link>
          <FiChevronRight className="w-3 h-3" />
          <span className="text-gray-900 font-medium">{subCategory?.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Sidebar - Sibling Subcategories */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <Link
                href={`/products/category/${subCategory?.category}`}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 mb-6 transition-colors font-medium"
              >
                <FiArrowLeft /> Back to Category
              </Link>

              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiLayers className="text-primary-600" />
                Explore More
              </h2>
              <div className="space-y-1">
                {siblings.map((sub) => (
                  <Link
                    key={sub._id}
                    href={`/products/subcategory/${sub._id}`}
                    className={`flex items-center justify-between p-3 rounded-xl transition-all group ${sub._id === subCategoryId
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <span className="text-sm font-medium">{sub.name}</span>
                    <FiChevronRight className={`w-4 h-4 transition-opacity ${sub._id === subCategoryId ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <FiGrid className="text-primary-600" />
                  {subCategory?.name || 'Products'}
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  We found <span className="font-bold text-gray-900">{products.length}</span> products in this section
                </p>
              </div>
            </div>

            {error ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-red-500">
                <p className="font-medium mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition"
                >
                  Try Again
                </button>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <FiGrid className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">No Products Found</h3>
                <p className="text-gray-500">
                  We couldn't find any products in this subcategory.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubCategoryProductsPage;
