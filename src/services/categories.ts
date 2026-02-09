import api, { parseAxiosError } from "@/api/api";
import { Category } from "@/types";

export const getAllCategories = async (): Promise<Category[]> => {
  try {
    const response = await api.get("/api/v1/categories");
    return response.data?.data || [];
  } catch (error) {
    console.error("Fetch categories error:", parseAxiosError(error));
    return [];
  }
};

export const getCategoryById = async (id: string): Promise<Category> => {
  try {
    const response = await api.get(`/api/v1/categories/${id}`);
    return response.data?.data;
  } catch (error) {
    console.error("Fetch category error:", parseAxiosError(error));
    throw new Error(parseAxiosError(error, "Failed to load category details."));
  }
};