import api, { authHeaders, parseAxiosError } from "@/api/api";
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
      `/orders/checkout-session/${orderId}`,
      data,
      {
        ...authHeaders(token),
        params: { url: returnUrl },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Create checkout session error:", parseAxiosError(error));
    throw new Error(parseAxiosError(error, "Failed to create checkout session."));
  }
};

export const createCashOrder = async (orderId: string, data: CashOrderData, token: string) => {
  try {
    const response = await api.post(`/orders/${orderId}`, data, authHeaders(token));
    return response.data;
  } catch (error) {
    console.error("Create cash order error:", parseAxiosError(error));
    throw new Error(parseAxiosError(error, "Failed to create order."));
  }
};

export const getAllOrders = async () => {
  try {
    const response = await api.get("/orders");
    return response.data;
  } catch (error) {
    console.error("Get all orders error:", parseAxiosError(error));
    return [];
  }
};

export const getUserOrders = async (userId: string, token: string) => {
  // If userId is missing or invalid, try hits /orders directly as a fallback
  const url = (userId && userId !== 'undefined' && userId !== 'null')
    ? `/orders/user/${userId}`
    : `/orders`;

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
    console.error("Get user orders error:", parseAxiosError(error));
    throw new Error(parseAxiosError(error, "Failed to load your orders."));
  }
};
