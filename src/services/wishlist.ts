import api, { authHeaders, parseAxiosError } from "@/api/api";
import axios from "axios";

interface AddWishlistData {
  productId: string;
}

export const addToWishlist = async (data: AddWishlistData, token: string) => {
  try {
    const response = await api.post("/wishlist", data, authHeaders(token));
    return response.data;
  } catch (error) {
    console.error("Add to wishlist error:", parseAxiosError(error));
    throw new Error(parseAxiosError(error, "Failed to add to wishlist."));
  }
};

export const removeFromWishlist = async (wishlistId: string, token: string) => {
  try {
    const response = await api.delete(`/wishlist/${wishlistId}`, authHeaders(token));
    return response.data;
  } catch (error) {
    console.error("Remove from wishlist error:", parseAxiosError(error));
    throw new Error(parseAxiosError(error, "Failed to remove from wishlist."));
  }
};

export const getWishlist = async (token: string) => {
  try {
    const response = await api.get("/wishlist", authHeaders(token));
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404 || error.response?.status === 500) {
        return { data: [] };
      }
    }
    console.error("Get wishlist error:", parseAxiosError(error));
    throw new Error(parseAxiosError(error, "Failed to load wishlist."));
  }
};
