'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard/ProductCard';
import { getProductsByBrand } from '@/services/products';
import { getBrandById } from '@/services/brands';
import { Product, Brand } from '@/types';

const BrandProductsPage = () => {
  const params = useParams();
  const brandId = params.brandId as string;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // جلب بيانات العلامة التجارية
        const brandData = await getBrandById(brandId);
        setBrand(brandData);
        
        // جلب منتجات العلامة التجارية
        const productsData = await getProductsByBrand(brandId);
        setProducts(productsData);
        setError(null);
      } catch (err) {
        setError('Failed to load products');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (brandId) {
      loadData();
    }
  }, [brandId]);

  if (loading) {
    return (
      <div className="brand-products-container">
        <div className="loading">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="brand-products-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="brand-products-container">
      <div className="brand-products-header">
        <h1>{brand?.name || 'Products'}</h1>
        <p>Showing {products.length} products</p>
      </div>

      <div className="products-grid">
        {products.length > 0 ? (
          products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))
        ) : (
          <div className="no-products">No products found from this brand</div>
        )}
      </div>
    </div>
  );
};

export default BrandProductsPage;
