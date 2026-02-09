import React from 'react';
import Link from 'next/link';
import { SubCategory } from '@/types';

interface SubCategoryCardProps {
  subCategory: SubCategory;
}

const SubCategoryCard: React.FC<SubCategoryCardProps> = ({ subCategory }) => {
  return (
    <div className="subcategory-card">
      <div className="subcategory-content">
        <h3 className="subcategory-name">{subCategory.name}</h3>
        <Link href={`/products/subcategory/${subCategory._id}`}>
          <button className="view-btn">Browse</button>
        </Link>
      </div>
    </div>
  );
};

export default SubCategoryCard;
