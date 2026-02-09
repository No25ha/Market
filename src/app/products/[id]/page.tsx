'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getProductById } from '@/services/products';
import { Product } from '@/types';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { FiShoppingCart, FiHeart, FiStar, FiChevronRight, FiCheckCircle } from 'react-icons/fi';
import Button from '@/components/ui/Button';

export default function ProductDetailsPage() {
    const params = useParams();
    const id = params?.id as string;
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string>('');
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const [addedToCart, setAddedToCart] = useState(false);

    const { addToCart } = useCart();
    const { wishlistItems, addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

    useEffect(() => {
        const loadProduct = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await getProductById(id);
                setProduct(data);
                if (data) {
                    setSelectedImage(data.imageCover);
                }
            } catch (error) {
                console.error('Failed to load product', error);
            } finally {
                setLoading(false);
            }
        };
        loadProduct();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent shadow-lg shadow-blue-100"></div>
                    <p className="text-gray-500 font-bold animate-pulse">Loading experience...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
                <div className="w-24 h-24 bg-red-50 text-red-400 rounded-3xl flex items-center justify-center mb-6">
                    <FiShoppingBag size={48} />
                </div>
                <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter">Product Not Found</h2>
                <p className="text-gray-500 mb-8 max-w-md mx-auto font-medium">The item you're looking for might have been moved or is no longer available.</p>
                <Button href="/products" className="px-10 py-4 rounded-2xl shadow-xl shadow-blue-100">
                    Back to Collection
                </Button>
            </div>
        );
    }

    const inWishlist = isInWishlist(product._id);

    const handleWishlistClick = () => {
        if (inWishlist) {
            const wishlistItem = wishlistItems.find(item => item.productId === product._id || item._id === product._id);
            if (wishlistItem) {
                removeFromWishlist(wishlistItem._id);
            }
        } else {
            addToWishlist(product._id);
        }
    };

    const handleAddToCart = async () => {
        if (!product._id) return;
        setIsAdding(true);
        try {
            for (let i = 0; i < quantity; i++) {
                await addToCart(product._id);
            }
            setAddedToCart(true);
            setTimeout(() => setAddedToCart(false), 5000);
        } finally {
            setIsAdding(false);
        }
    };

    const images = [product.imageCover, ...(product.images || [])];
    const uniqueImages = Array.from(new Set(images));

    return (
        <div className="min-h-screen bg-[#f8fafc] py-12">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-10 overflow-x-auto whitespace-nowrap scrollbar-hide">
                    <Link href="/" className="hover:text-blue-600 transition-colors shrink-0">Home</Link>
                    <FiChevronRight size={14} className="shrink-0" />
                    <Link href="/products" className="hover:text-blue-600 transition-colors shrink-0">Products</Link>
                    <FiChevronRight size={14} className="shrink-0" />
                    <span className="text-gray-900 font-bold truncate shrink-0 max-w-[150px] sm:max-w-none">{product.title}</span>
                </nav>

                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:divide-x divide-gray-50">

                        {/* LEFT: Image Gallery */}
                        <div className="p-8 lg:p-12 space-y-8 bg-gray-50/30">
                            <div className="relative aspect-square bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-inner group">
                                <Image
                                    src={selectedImage || product.imageCover}
                                    alt={product.title}
                                    fill
                                    className="object-contain p-8 lg:p-12 transition-transform duration-700 group-hover:scale-105"
                                    priority
                                />

                                {/* Wishlist Button Overlay */}
                                <button
                                    onClick={handleWishlistClick}
                                    className={`absolute top-6 right-6 w-12 h-12 rounded-2xl shadow-xl transition-all transform hover:scale-110 flex items-center justify-center ${inWishlist
                                        ? 'bg-red-500 text-white'
                                        : 'bg-white text-gray-400 hover:text-red-500 border border-gray-100'
                                        }`}
                                >
                                    <FiHeart className={`w-6 h-6 ${inWishlist ? 'fill-current' : ''}`} />
                                </button>

                                <div className="absolute bottom-6 left-6">
                                    <span className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-gray-900 shadow-sm border border-gray-100">
                                        Premium Quality
                                    </span>
                                </div>
                            </div>

                            {/* Thumbnails */}
                            {uniqueImages.length > 1 && (
                                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-1">
                                    {uniqueImages.map((img, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImage(img)}
                                            className={`relative flex-shrink-0 w-24 h-24 rounded-2xl border-2 overflow-hidden transition-all shadow-sm ${selectedImage === img || (!selectedImage && index === 0) ? 'border-blue-600 bg-blue-50/30' : 'border-white bg-white hover:border-blue-100'
                                                }`}
                                        >
                                            <Image
                                                src={img}
                                                alt={`${product.title} view ${index + 1}`}
                                                fill
                                                className="object-cover p-2"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* RIGHT: Product Info */}
                        <div className="p-8 lg:p-16 flex flex-col">
                            <div className="mb-4">
                                {product.brand && (
                                    <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] rounded-full border border-blue-100">
                                        {product.brand.name}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 tracking-tight leading-tight">{product.title}</h1>

                            <div className="flex items-center gap-6 mb-10 p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50 w-fit">
                                <div className="flex items-center text-yellow-500 font-black text-xl">
                                    <FiStar className="fill-current w-6 h-6 mr-2" />
                                    <span>{product.ratingsAverage}</span>
                                </div>
                                <div className="w-px h-6 bg-gray-200"></div>
                                <div className="text-gray-400 font-bold uppercase text-xs tracking-widest">
                                    {product.ratingsQuantity} Trusted Reviews
                                </div>
                            </div>

                            <div className="py-8 border-y-2 border-gray-50 mb-10 flex items-center justify-between flex-wrap gap-4">
                                <div className="flex flex-col">
                                    <div className="flex items-baseline gap-4">
                                        <span className="text-5xl font-black text-gray-900 tracking-tighter">
                                            EGP {product.priceAfterDiscount ? product.priceAfterDiscount.toLocaleString() : product.price.toLocaleString()}
                                        </span>
                                        {product.priceAfterDiscount && (
                                            <span className="text-2xl text-gray-300 line-through font-bold decoration-red-400 mr-2">
                                                EGP {product.price.toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                                        <FiCheckCircle className="text-green-500" /> In Stock & Ready to Ship
                                    </p>
                                </div>

                                {product.priceAfterDiscount && (
                                    <div className="bg-red-500 text-white px-5 py-3 rounded-2xl font-black shadow-lg shadow-red-100 animate-pulse text-lg">
                                        {Math.round(((product.price - product.priceAfterDiscount) / product.price) * 100)}% DISCOUNT
                                    </div>
                                )}
                            </div>

                            <div className="mb-12 flex-grow">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Description</h3>
                                <p className="text-gray-600 leading-relaxed text-lg font-medium italic border-l-4 border-blue-600 pl-6 py-2">
                                    "{product.description}"
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="space-y-6">
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                                    {/* Qty Selector */}
                                    <div className="flex items-center bg-gray-100 rounded-2xl p-1 border border-gray-200">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-12 h-12 flex items-center justify-center text-gray-900 hover:text-blue-600 transition-colors text-2xl font-black"
                                            disabled={quantity <= 1}
                                        >
                                            -
                                        </button>
                                        <span className="w-14 text-center font-black text-xl text-gray-900">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="w-12 h-12 flex items-center justify-center text-gray-900 hover:text-blue-600 transition-colors text-2xl font-black"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <Button
                                        onClick={handleAddToCart}
                                        variant={addedToCart ? "outline" : "primary"}
                                        isLoading={isAdding}
                                        className="flex-1 py-4 px-8 rounded-2xl shadow-xl shadow-blue-100 gap-3 font-black text-lg uppercase tracking-widest"
                                    >
                                        <FiShoppingCart className="w-6 h-6" />
                                        {addedToCart ? 'Add Multiple' : 'Secure In-Cart'}
                                    </Button>
                                </div>

                                {addedToCart && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-slide-up">
                                        <Button
                                            href="/cart"
                                            variant="warning"
                                            className="py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-orange-100 bg-orange-500 text-white"
                                        >
                                            View My Cart
                                        </Button>
                                        <Button
                                            href="/checkout"
                                            variant="primary"
                                            className="py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-100"
                                        >
                                            Proceed to Buy
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="mt-12 flex items-center justify-center gap-8 py-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                                        <FiTruck className="text-blue-600" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Fast Shipping</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                                        <FiCheckCircle className="text-green-600" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Authentic Only</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                                        <FiPackage className="text-orange-600" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Secure Pack</span>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
