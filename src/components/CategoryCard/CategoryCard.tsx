import Image from 'next/image';
import { Category } from '@/types';
import { FiArrowRight } from 'react-icons/fi';
import Button from '@/components/ui/Button';

interface CategoryCardProps {
  category: Category;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group border border-gray-100 h-full flex flex-col">
      {/* Category Image */}
      <div className="relative bg-gray-100 aspect-square overflow-hidden">
        <Image
          src={category.image}
          alt={category.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <Button
            href={`/products/category/${category._id}`}
            className="w-full gap-2 font-bold"
            variant="primary"
          >
            View Products
            <FiArrowRight size={16} />
          </Button>
        </div>
      </div>

      {/* Category Content */}
      <div className="p-4 flex-1 flex flex-col items-center justify-between gap-4">
        <h3 className="font-bold text-gray-900 text-center line-clamp-2">
          {category.name}
        </h3>

        <Button
          href={`/categories/${category._id}/subcategories`}
          variant="outline"
          className="w-full border-2 border-gray-300 text-gray-700 font-bold text-sm py-2 hover:bg-gray-50"
        >
          View Subcategories
        </Button>
      </div>
    </div>
  );
};

export default CategoryCard;
