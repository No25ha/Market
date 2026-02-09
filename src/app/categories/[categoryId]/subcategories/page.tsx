'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import SubCategoryCard from '@/components/SubCategoryCard/SubCategoryCard';
import { getAllSubCategories, getSubCategoriesByCategoryId } from '@/services/subCategories';
import { getCategoryById } from '@/services/categories';
import { SubCategory } from '@/types';
import SubCategoryTabs from '@/components/SubCategoryTabs/SubCategoryTabs';
import Button from '@/components/ui/Button';
import { FiLayers } from 'react-icons/fi';
import { useCart } from '@/hooks/useCart';

const SubCategoriesContent = () => {
    const { cartItems } = useCart();
    const params = useParams();
    const searchParams = useSearchParams();
    const categoryId = params.categoryId as string;
    const activeSubId = searchParams.get('sub');

    const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
    const [categoryName, setCategoryName] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            if (!categoryId) return;

            try {
                setLoading(true);
                setError(null);

                console.log("SubCategories Page - Loading data for category:", categoryId);

                // جلب بيانات القسم والأقسام الفرعية بشكل متوازي
                const [subData, catData] = await Promise.all([
                    getSubCategoriesByCategoryId(categoryId),
                    getCategoryById(categoryId).catch(() => null)
                ]);

                setSubCategories(subData);
                if (catData) {
                    setCategoryName(catData.name);
                    console.log("Category loaded:", catData.name);
                }
            } catch (err) {
                setError('Failed to load subcategories');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [categoryId]);

    // تصفية النتائج بناءً على التبويب المختار (إن وجد)
    const displayedSubs = activeSubId
        ? subCategories.filter(s => s._id === activeSubId)
        : subCategories;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent shadow-lg"></div>
                    <p className="text-gray-500 font-medium animate-pulse">Loading Subcategories...</p>
                </div>
            </div>
        );
    }

    const baseHref = `/categories/${categoryId}/subcategories`;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {categoryId && (
                <SubCategoryTabs categoryId={categoryId} baseHref={baseHref} />
            )}

            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="mb-12 border-b-2 border-gray-100 pb-8">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                        {categoryName ? `${categoryName} Sections` : 'All Subcategories'}
                    </h1>
                    <p className="text-gray-500 mt-3 text-lg font-medium">
                        Explore {categoryName ? `specialized collections in ${categoryName}` : 'all our specialized collections'}
                    </p>
                </div>

                {error ? (
                    <div className="bg-white rounded-3xl p-12 text-center border-4 border-red-50 shadow-sm max-w-xl mx-auto">
                        <p className="text-red-500 font-bold text-lg mb-4">{error}</p>
                        <button onClick={() => window.location.reload()} className="px-8 py-3 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition shadow-lg">Retry</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {displayedSubs.length > 0 ? (
                            displayedSubs.map((subCategory) => (
                                <SubCategoryCard key={subCategory._id} subCategory={subCategory} />
                            ))
                        ) : (
                            <div className="col-span-full py-24 text-center bg-white rounded-[2.5rem] border-4 border-dashed border-gray-100 shadow-inner px-6">
                                <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-gray-200">
                                    <FiLayers size={40} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-400 italic">No subcategories found for this section.</h3>
                                <p className="text-gray-300 mt-2 font-medium mb-10">Please select another category or check back later.</p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Button
                                        href="/products"
                                        variant="outline"
                                        className="px-10 py-4 rounded-2xl font-bold border-2"
                                    >
                                        Browse Products
                                    </Button>
                                    {cartItems.length > 0 && (
                                        <Button
                                            href="/cart"
                                            variant="primary"
                                            className="px-10 py-4 rounded-2xl shadow-xl shadow-blue-100 font-black uppercase tracking-wider"
                                        >
                                            View Cart & Checkout
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const SubCategoriesPathPage = () => {
    return (
        <Suspense fallback={<div className="p-20 text-center text-gray-400">Preparing Categories...</div>}>
            <SubCategoriesContent />
        </Suspense>
    );
};

export default SubCategoriesPathPage;
