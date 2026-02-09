import api, { authHeaders, parseAxiosError } from "@/api/api";

interface AddToCartData {
  productId: string;
}

interface UpdateCartData {
  quantity: number;
}

export const getCart = async (token: string) => {
  try {
    const res = await api.get("/cart", authHeaders(token));
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404 || error.response?.status === 500) {
        return { data: { products: [], totalCartPrice: 0 } };
      }
    }
    console.error("Get cart error:", error);
    throw new Error(parseAxiosError(error, "Failed to load cart."));
  }
};

export const addToCart = async (data: AddToCartData, token: string) => {
  if (!data.productId) {
    throw new Error("Product ID is required to add to cart.");
  }

  try {
    const res = await api.post("/cart", data, authHeaders(token));
    return res.data;
  } catch (error) {
    console.error("Add to cart API error:", error);
    throw new Error(parseAxiosError(error, "Failed to add to cart."));
  }
};

export const removeFromCart = async (productId: string, token: string) => {
  try {
    const res = await api.delete(`/cart/${productId}`, authHeaders(token));
    return res.data;
  } catch (error) {
    console.error("Remove from cart error:", error);
    throw new Error(parseAxiosError(error, "Failed to remove from cart."));
  }
};

export const updateCartItem = async (productId: string, data: UpdateCartData, token: string) => {
  try {
    const res = await api.put(`/cart/${productId}`, data, authHeaders(token));
    return res.data;
  } catch (error) {
    console.error("Update cart item error:", error);
    throw new Error(parseAxiosError(error, "Failed to update item quantity."));
  }
};

export const clearCart = async (token: string) => {
  try {
    const res = await api.delete("/cart", authHeaders(token));
    return res.data;
  } catch (error) {
    console.error("Clear cart error:", error);
    throw new Error(parseAxiosError(error, "Failed to clear cart."));
  }
};

export const removeAddress = async (addressId: string, token: string) => {
  try {
    const res = await api.delete(`/addresses/${addressId}`, authHeaders(token));
    return res.data;
  } catch (error) {
    console.error("Remove address error:", error);
    throw new Error(parseAxiosError(error, "Failed to remove address."));
  }
};

export const getAddressById = async (addressId: string, token: string) => {
  try {
    const res = await api.get(`/addresses/${addressId}`, authHeaders(token));
    return res.data;
  } catch (error) {
    console.error("Get address error:", error);
    throw new Error(parseAxiosError(error, "Failed to load address."));
  }
};

export const getUserAddresses = async (token: string) => {
  try {
    const res = await api.get("/addresses", authHeaders(token));
    return res.data;
  } catch (error) {
    console.error("Get addresses error:", error);
    throw new Error(parseAxiosError(error, "Failed to load addresses."));
  }
};

import axios from "axios";
