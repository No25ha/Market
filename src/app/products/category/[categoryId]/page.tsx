'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard/ProductCard';
import { getProductsByCategory, getProductsBySubCategory } from '@/services/products';
import { getCategoryById } from '@/services/categories';
import { getSubCategoriesByCategoryId } from '@/services/subCategories';
import { Product, Category, SubCategory } from '@/types';
import { FiLayers, FiGrid, FiChevronRight, FiChevronDown, FiArrowRight, FiCheckCircle, FiX } from 'react-icons/fi';
import SubCategoryFilter from '@/components/SubCategoryFilter/SubCategoryFilter';

const CategoryProductsPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryId = params.categoryId as string;
  const productsSectionRef = useRef<HTMLDivElement>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [selectedSub, setSelectedSub] = useState<SubCategory | null>(null);

  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // جلب البيانات بشكل متوازي (Category & Subcategories)
        const [categoryData, subCategoriesData] = await Promise.all([
          getCategoryById(categoryId),
          getSubCategoriesByCategoryId(categoryId)
        ]);

        setCategory(categoryData);
        setSubCategories(subCategoriesData);

        // التحقق من وجود اختيار مسبق في الرابط
        const subId = searchParams.get('sub');
        if (subId) {
          const found = subCategoriesData.find(s => s._id === subId);
          if (found) {
            handleSubSelect(found, false); // select without scrolling during initial load
            return;
          }
        }

        // تحمبل كل المنتجات افتراضياً إذا لم يتم اختيار قسم فرعي
        const productsData = await getProductsByCategory(categoryId);
        setProducts(productsData);

      } catch (err) {
        setError('Failed to load category information');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      loadData();
    }
  }, [categoryId]);

  const handleSubSelect = async (sub: SubCategory, shouldScroll = true) => {
    try {
      setProductsLoading(true);
      setSelectedSub(sub);

      // تحديث الرابط دون إعادة تحميل الصفحة (Deep Linking)
      const url = new URL(window.location.href);
      url.searchParams.set('sub', sub._id);
      window.history.pushState({}, '', url);

      const productsData = await getProductsBySubCategory(sub._id);
      setProducts(productsData);

      if (shouldScroll) {
        setTimeout(() => {
          productsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    } catch (err) {
      console.error('Error fetching subcategory products:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  const clearFilter = async () => {
    try {
      setProductsLoading(true);
      setSelectedSub(null);
      const url = new URL(window.location.href);
      url.searchParams.delete('sub');
      window.history.pushState({}, '', url);

      const productsData = await getProductsByCategory(categoryId);
      setProducts(productsData);
    } catch (err) {
      console.error(err);
    } finally {
      setProductsLoading(false);
    }
  };

  const scrollToProducts = () => {
    productsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-primary-100 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-500 font-medium animate-pulse">Loading {category?.name || 'Category'}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-[#131921] text-white pt-12 pb-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6 font-medium">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <FiChevronRight className="w-3 h-3" />
            <span className="text-white font-medium">{category?.name}</span>
          </nav>

          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
            Explore <span className="text-primary-500">{category?.name}</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
            Choose a subcategory below to refine your selection, or continue to browse our full collection.
          </p>
        </div>

        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary-600/10 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-12 bg-gray-50 rounded-t-[3rem]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 mb-16 relative z-20">

        {/* Step 1: Subcategory Selection */}
        {subCategories.length > 0 && (
          <SubCategoryFilter
            subCategories={subCategories}
            selectedSubId={selectedSub?._id || null}
            onSelect={(sub) => sub ? handleSubSelect(sub) : clearFilter()}
            title={`Refine ${category?.name}`}
          />
        )}

        {/* Step 2: Main Content / Product Display */}
        <div ref={productsSectionRef} className="pt-8 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b-4 border-gray-100 pb-8">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-secondary-500 text-white text-base font-bold shadow-lg shadow-secondary-200">2</span>
                {selectedSub ? `Discovery in "${selectedSub.name}"` : `Browse All ${category?.name}`}
              </h2>
              <p className="text-gray-400 text-sm font-medium ml-13">Discover high-quality products selected for you</p>
            </div>
            <div className="bg-white px-6 py-3 rounded-2xl border-2 border-primary-50 shadow-sm text-primary-600 font-black text-sm">
              {products.length} Items Found
            </div>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="bg-white rounded-[2.5rem] h-[400px] border border-gray-100 shadow-sm animate-pulse"></div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-12 rounded-[2.5rem] text-center border-4 border-red-100 shadow-inner max-w-2xl mx-auto">
              <p className="font-black text-xl mb-3">Oops! We hit a snag.</p>
              <p className="text-sm opacity-80 mb-8 leading-relaxed font-medium">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-10 py-3 bg-red-600 text-white rounded-2xl font-black hover:bg-red-700 transition shadow-xl"
              >
                Refresh Content
              </button>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 p-24 text-center">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-200">
                <FiGrid size={48} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">Empty Collection</h3>
              <p className="text-gray-400 font-medium max-w-xs mx-auto text-lg leading-relaxed">
                We're currently restocking this specific section. Try another subcategory above!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryProductsPage;
