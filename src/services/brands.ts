import api, { parseAxiosError } from "@/api/api";
import { Brand } from "@/types";

export const getAllBrands = async (limit: number = 100, keyword: string = ""): Promise<Brand[]> => {
  try {
    const response = await api.get("/brands", {
      params: {
        limit,
        keyword,
      },
    });
    return response.data?.data || [];
  } catch (error) {
    console.error("Fetch brands error:", parseAxiosError(error));
    return [];
  }
};

export const getBrandById = async (id: string): Promise<Brand> => {
  try {
    const response = await api.get(`/brands/${id}`);
    return response.data?.data;
  } catch (error) {
    console.error("Fetch brand error:", parseAxiosError(error));
    throw new Error(parseAxiosError(error, "Failed to fetch brand."));
  }
};