import api, { parseAxiosError } from "@/api/api";
import { SubCategory } from "@/types";

export const getAllSubCategories = async () => {
  try {
    const response = await api.get("/api/v1/subcategories");
    return response.data?.data || [];
  } catch (error) {
    console.warn("Fetch subcategories error:", parseAxiosError(error));
    return [];
  }
};

export const getSubCategoryById = async (id: string) => {
  try {
    const response = await api.get(`/api/v1/subcategories/${id}`);
    return response.data?.data;
  } catch (error) {
    console.warn(`Fetch subcategory ${id} error:`, parseAxiosError(error));
    return null;
  }
};

export const getSubCategoriesByCategoryId = async (categoryId: any): Promise<SubCategory[]> => {
  // Extract ID if it's passed as an object
  const id = (categoryId && typeof categoryId === 'object') ? categoryId._id : categoryId;

  if (!id) {
    console.warn("getSubCategoriesByCategoryId: No valid ID provided");
    return [];
  }

  console.log(`[API Service] Fetching subcategories for category ID: ${id}`);

  try {
    // Standard query parameter filter for Route Misr API
    const response = await api.get("/api/v1/subcategories", {
      params: { 'category': id }
    });

    const results = response.data?.data || [];
    console.log(`[API Service] Found ${results.length} subcategories for ${id}`);
    return results;
  } catch (error) {
    console.error(`[API Service] Error for category ${id}:`, parseAxiosError(error));
    return [];
  }
};
