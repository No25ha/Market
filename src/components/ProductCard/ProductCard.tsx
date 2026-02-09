'use client';

import { Product } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { FiHeart } from 'react-icons/fi';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';
import Button from '@/components/ui/Button';
import { useState } from 'react';


interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { wishlistItems, addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [addingToCart, setAddingToCart] = useState(false);

  const inWishlist = isInWishlist(product._id);


  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inWishlist) {
      // Find the wishlist item ID to remove
      const wishlistItem = wishlistItems.find(item => item.productId === product._id || item._id === product._id);
      if (wishlistItem) {
        removeFromWishlist(wishlistItem._id);
      }
    } else {
      addToWishlist(product._id);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!product?._id) {
      console.error("Missing product ID in ProductCard");
      return;
    }
    setAddingToCart(true);
    await addToCart(product._id);
    setAddingToCart(false);
  };


  // Helper to render stars
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<FaStar key={i} className="text-[#f97316]" />);
      } else if (i === Math.ceil(rating) && !Number.isInteger(rating)) {
        stars.push(<FaStarHalfAlt key={i} className="text-[#f97316]" />);
      } else {
        stars.push(<FaStar key={i} className="text-gray-300" />);
      }
    }
    return stars;
  };

  return (
    <Link href={`/products/${product._id}`} className="group flex flex-col bg-white border border-gray-200 rounded-md overflow-hidden hover:shadow-lg transition-shadow bg-white h-full">
      <div className="relative aspect-square w-full bg-gray-50 p-4 flex items-center justify-center">
        <Image
          src={product.imageCover}
          alt={product.title}
          fill
          className="object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white text-gray-600 hover:text-red-500 transition-colors shadow-sm"
        >
          <FiHeart className={`w-5 h-5 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
        </button>

        {/* Best Seller or Discount Badge */}
        {product.priceAfterDiscount && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wide rounded-sm">
            {(100 - (product.priceAfterDiscount / product.price * 100)).toFixed(0)}% OFF
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[40px] group-hover:text-[#f97316] transition-colors">
          {product.title}
        </h3>

        <div className="flex items-center gap-1 text-xs">
          <div className="flex text-[#f97316]">{renderStars(product.ratingsAverage ?? 4)}</div>
          <span className="text-[#007185] hover:underline cursor-pointer ml-1">{product.ratingsQuantity ?? 120}</span>
        </div>

        <div className="mt-auto">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900">
              EGP <span className="text-xl">{product.priceAfterDiscount || product.price}</span>
            </span>
            {product.priceAfterDiscount && (
              <span className="text-xs text-gray-500 line-through">EGP {product.price}</span>
            )}
          </div>

          <div className="text-[10px] text-gray-500 mt-1">
            Get it by <span className="font-bold text-gray-800">Tomorrow, Feb 8</span>
          </div>

          <Button
            onClick={handleAddToCart}
            variant="warning"
            isLoading={addingToCart}
            className="mt-3 w-full rounded-full text-sm"
          >
            Add to Cart
          </Button>

        </div>
      </div>
    </Link>
  );
}
