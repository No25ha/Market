import api, { authHeaders, parseAxiosError, isTransientError } from "@/api/api";
import axios from "axios";

interface ShippingAddress {
  details: string;
  phone: string;
  city: string;
}

interface CashOrderData {
  shippingAddress: ShippingAddress;
}

interface CheckoutData {
  shippingAddress: ShippingAddress;
}

export const createCheckoutSession = async (
  orderId: string,
  data: CheckoutData,
  token: string,
  returnUrl: string
) => {
  try {
    const response = await api.post(
      `/api/v1/orders/checkout-session/${orderId}`,
      data,
      {
        ...authHeaders(token),
        params: { url: returnUrl },
      }
    );
    return response.data;
  } catch (error) {
    if (!isTransientError(error)) {
      console.error("Create checkout session error:", parseAxiosError(error));
    }
    throw new Error(parseAxiosError(error, "Failed to create checkout session."));
  }
};

export const createCashOrder = async (orderId: string, data: CashOrderData, token: string) => {
  try {
    const response = await api.post(`/api/v2/orders/${orderId}`, data, authHeaders(token));
    return response.data;
  } catch (error) {
    if (!isTransientError(error)) {
      console.error("Create cash order error:", parseAxiosError(error));
    }
    throw new Error(parseAxiosError(error, "Failed to create order."));
  }
};

export const getAllOrders = async () => {
  try {
    const response = await api.get("/api/v1/orders");
    return response.data;
  } catch (error) {
    console.error("Get all orders error:", parseAxiosError(error));
    return [];
  }
};

export const getUserOrders = async (userId: string, token: string) => {
  const url = `/api/v1/orders/user/${userId}`
  console.log('Fetching orders from URL:', url, 'with userId:', userId);
  try {
    const response = await api.get(url, authHeaders(token));
    console.log('API getUserOrders response.data:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        console.warn('Orders not found (404)');
        return { data: [] };
      }
    }
    if (!isTransientError(error)) {
      console.error("Get user orders error:", parseAxiosError(error));
    }
    throw new Error(parseAxiosError(error, "Failed to load your orders."));
  }
};
