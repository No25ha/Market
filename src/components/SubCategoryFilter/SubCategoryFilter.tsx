'use client';

import React from 'react';
import { SubCategory } from '@/types';
import { FiLayers, FiCheckCircle } from 'react-icons/fi';

interface SubCategoryFilterProps {
    subCategories: SubCategory[];
    selectedSubId: string | null;
    onSelect: (sub: SubCategory | null) => void;
    title?: string;
}

const SubCategoryFilter: React.FC<SubCategoryFilterProps> = ({
    subCategories,
    selectedSubId,
    onSelect,
    title = "Filter by Subcategory"
}) => {
    return (
        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-6 md:p-8 mb-12">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl bg-primary-600 text-white flex items-center justify-center shadow-lg shadow-primary-100">
                    <FiLayers size={18} />
                </div>
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">{title}</h3>
            </div>

            <div className="flex flex-wrap gap-3">
                {/* "All" Option */}
                <button
                    onClick={() => onSelect(null)}
                    className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 flex items-center gap-2 border-2 ${selectedSubId === null
                            ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-100'
                            : 'bg-white border-gray-100 text-gray-500 hover:border-primary-200 hover:text-primary-600'
                        }`}
                >
                    {selectedSubId === null && <FiCheckCircle size={14} />}
                    All Products
                </button>

                {/* Subcategories */}
                {subCategories.map((sub) => (
                    <button
                        key={sub._id}
                        onClick={() => onSelect(sub)}
                        className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 flex items-center gap-2 border-2 ${selectedSubId === sub._id
                                ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-100 scale-105'
                                : 'bg-white border-gray-100 text-gray-500 hover:border-primary-200 hover:text-primary-600'
                            }`}
                    >
                        {selectedSubId === sub._id && <FiCheckCircle size={14} />}
                        {sub.name}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SubCategoryFilter;
