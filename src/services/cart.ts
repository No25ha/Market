import api, { authHeaders, parseAxiosError, isTransientError } from "@/api/api";

interface AddToCartData {
  productId: string;
}

interface UpdateCartData {
  quantity: number;
}

interface ApplyCouponData {
  couponName: string;
}

export const getCart = async (token: string) => {
  try {
    const res = await api.get("/api/v2/cart", authHeaders(token));
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404 || error.response?.status === 500) {
        return { data: { products: [], totalCartPrice: 0 } };
      }
    }
    if (!isTransientError(error)) {
      console.error("Get cart error:", error);
    }
    throw new Error(parseAxiosError(error, "Failed to load cart."));
  }
};

export const addToCart = async (data: AddToCartData, token: string) => {
  if (!data.productId) {
    throw new Error("Product ID is required to add to cart.");
  }

  try {
    const res = await api.post("/api/v2/cart", data, authHeaders(token));
    return res.data;
  } catch (error) {
    if (!isTransientError(error)) {
      console.error("Add to cart API error:", error);
    }
    throw new Error(parseAxiosError(error, "Failed to add to cart."));
  }
};

export const removeFromCart = async (productId: string, token: string) => {
  try {
    const res = await api.delete(`/api/v2/cart/${productId}`, authHeaders(token));
    return res.data;
  } catch (error) {
    if (!isTransientError(error)) {
      console.error("Remove from cart error:", error);
    }
    throw new Error(parseAxiosError(error, "Failed to remove from cart."));
  }
};

export const updateCartItem = async (productId: string, data: UpdateCartData, token: string) => {
  try {
    const res = await api.put(`/api/v2/cart/${productId}`, data, authHeaders(token));
    return res.data;
  } catch (error) {
    if (!isTransientError(error)) {
      console.error("Update cart item error:", error);
    }
    throw new Error(parseAxiosError(error, "Failed to update item quantity."));
  }
};

export const clearCart = async (token: string) => {
  try {
    const res = await api.delete("/api/v2/cart", authHeaders(token));
    return res.data;
  } catch (error) {
    if (!isTransientError(error)) {
      console.error("Clear cart error:", error);
    }
    throw new Error(parseAxiosError(error, "Failed to clear cart."));
  }
};

export const removeAddress = async (addressId: string, token: string) => {
  try {
    const res = await api.delete(`/api/v2/addresses/${addressId}`, authHeaders(token));
    return res.data;
  } catch (error) {
    if (!isTransientError(error)) {
      console.error("Remove address error:", error);
    }
    throw new Error(parseAxiosError(error, "Failed to remove address."));
  }
};

export const getAddressById = async (addressId: string, token: string) => {
  try {
    const res = await api.get(`/api/v2/addresses/${addressId}`, authHeaders(token));
    return res.data;
  } catch (error) {
    if (!isTransientError(error)) {
      console.error("Get address error:", error);
    }
    throw new Error(parseAxiosError(error, "Failed to load address."));
  }
};

export const getUserAddresses = async (token: string) => {
  try {
    const res = await api.get("/api/v2/addresses", authHeaders(token));
    return res.data;
  } catch (error) {
    if (!isTransientError(error)) {
      console.error("Get addresses error:", error);
    }
    throw new Error(parseAxiosError(error, "Failed to load addresses."));
  }
};

export const applyCouponToCart = async (
  data: ApplyCouponData,
  token: string
) => {
  if (!data.couponName) {
    throw new Error("Coupon name is required.");
  }

  try {
    const res = await api.put(
      "/api/v2/cart/applyCoupon",
      data,
      authHeaders(token)
    );
    return res.data;
  } catch (error) {
    if (!isTransientError(error)) {
      console.error("Apply coupon error:", error);
    }
    throw new Error(parseAxiosError(error, "Failed to apply coupon."));
  }
};

import axios from "axios";
