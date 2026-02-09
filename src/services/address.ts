import api, { authHeaders, parseAxiosError } from "@/api/api";

interface AddAddressData {
  name: string;
  details: string;
  phone: string;
  city: string;
}

export const addAddress = async (data: AddAddressData, token: string) => {
  try {
    const response = await api.post("/api/v1/addresses", data, authHeaders(token));
    return response.data;
  } catch (error) {
    console.error("Add address error:", parseAxiosError(error));
    throw new Error(parseAxiosError(error, "Failed to add address."));
  }
};

export const removeAddress = async (addressId: string, token: string) => {
  try {
    const response = await api.delete(`/api/v1/addresses/${addressId}`, authHeaders(token));
    return response.data;
  } catch (error) {
    console.error("Remove address error:", parseAxiosError(error));
    throw new Error(parseAxiosError(error, "Failed to remove address."));
  }
};

export const getAddressById = async (addressId: string, token: string) => {
  try {
    const response = await api.get(`/api/v1/addresses/${addressId}`, authHeaders(token));
    return response.data;
  } catch (error) {
    console.error("Get address error:", parseAxiosError(error));
    throw new Error(parseAxiosError(error, "Failed to load address."));
  }
};

export const getUserAddresses = async (token: string) => {
  try {
    const response = await api.get("/api/v1/addresses", authHeaders(token));
    return response.data;
  } catch (error) {
    console.error("Get addresses error:", parseAxiosError(error));
    throw new Error(parseAxiosError(error, "Failed to load addresses."));
  }
};
