import api, { parseAxiosError } from "@/api/api";
import { Product } from "@/types";

// Local fallback data to avoid blank UI when network fails

// Enhanced error handling
const handleApiError = (error: unknown, context: string) => {
  const message = parseAxiosError(error);
  console.warn(`API Issue in ${context}: ${message}.`);
};

export const fetchProducts = async () => {
  try {
    const response = await api.get("/api/v1/products");
    return response.data?.data || [];
  } catch (error) {
    handleApiError(error, 'fetchProducts');
    return [];
  }
};

export const getProductsByCategory = async (categoryId: string): Promise<Product[]> => {
  try {
    const response = await api.get("/api/v1/products", { params: { 'category[in]': categoryId } });
    return response.data?.data || [];
  } catch (error) {
    handleApiError(error, 'getProductsByCategory');
    return [];
  }
};

export const getProductsBySubCategory = async (subCategoryId: string): Promise<Product[]> => {
  try {
    const response = await api.get("/api/v1/products", {
      params: {
        'subcategory': subCategoryId
      }
    });
    return response.data?.data || [];
  } catch (error) {
    handleApiError(error, 'getProductsBySubCategory');
    return [];
  }
};

export const getProductsByBrand = async (brandId: string): Promise<Product[]> => {
  try {
    const response = await api.get("/api/v1/products", { params: { 'brand[in]': brandId } });
    return response.data?.data || [];
  } catch (error) {
    handleApiError(error, 'getProductsByBrand');
    return [];
  }
};

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const response = await api.get(`/api/v1/products/${id}`);
    return response.data?.data;
  } catch (error) {
    handleApiError(error, 'getProductById');
    return null;
  }
};
