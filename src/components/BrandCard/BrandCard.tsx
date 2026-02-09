import Image from 'next/image';
import Link from 'next/link';
import { Brand } from '@/types';

interface BrandCardProps {
  brand: Brand;
}

const BrandCard: React.FC<BrandCardProps> = ({ brand }) => {
  return (
    <Link href={`/products/brand/${brand._id}`}>
      <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group border border-gray-100 cursor-pointer">
        {/* Brand Image */}
        <div className="relative bg-gray-100 aspect-square overflow-hidden flex items-center justify-center p-4">
          <div className="relative w-full h-full">
            <Image
              src={brand.image}
              alt={brand.name}
              fill
              className="object-contain group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Brand Content */}
        <div className="p-4 bg-gradient-to-r from-gray-50 to-white text-center">
          <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition">
            {brand.name}
          </h3>
          <p className="text-xs text-gray-500 mt-1">Shop Products</p>
        </div>
      </div>
    </Link>
  );
};

export default BrandCard;
