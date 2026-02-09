import api, { authHeaders, parseAxiosError } from "@/api/api";
import { SignUpData, SignInData, AuthResponse } from "@/types";

// AUTH
export const signUp = async (data: SignUpData): Promise<AuthResponse> => {
  try {
    const res = await api.post<AuthResponse>("/api/v1/auth/signup", data);
    return res.data;
  } catch (error) {
    console.error("Sign up error:", error);
    throw new Error(parseAxiosError(error, "Sign up failed. Please try again."));
  }
};

export const signIn = async (data: SignInData): Promise<AuthResponse> => {
  try {
    const res = await api.post<AuthResponse>("/api/v1/auth/signin", data);
    return res.data;
  } catch (error) {
    console.error("Sign in error:", error);
    throw new Error(parseAxiosError(error, "Sign in failed. Please try again."));
  }
};

export const forgotPassword = async (email: string) => {
  try {
    const res = await api.post("/api/v1/auth/forgotPasswords", { email });
    return res.data;
  } catch (error) {
    console.error("Forgot password error:", error);
    throw new Error(parseAxiosError(error, "Failed to request password reset."));
  }
};

export const verifyResetCode = async (resetCode: string) => {
  try {
    const res = await api.post("/api/v1/auth/verifyResetCode", { resetCode });
    return res.data;
  } catch (error) {
    console.error("Verify reset code error:", error);
    throw new Error(parseAxiosError(error, "Invalid or expired reset code."));
  }
};

export const verifyToken = async (token: string) => {
  try {
    const res = await api.get("/api/v1/auth/verifyToken", authHeaders(token));
    return res.data;
  } catch (error) {
    console.error("Verify token error:", error);
    throw new Error(parseAxiosError(error, "Token is invalid or expired."));
  }
};

// USERS
export const getAllUsers = async (limit = 10, keyword = "") => {
  try {
    const res = await api.get("/api/v1/users", { params: { limit, keyword } });
    return res.data;
  } catch (error) {
    console.error("Get users error:", error);
    throw new Error(parseAxiosError(error, "Failed to load users."));
  }
};

export const getCurrentUser = async (token: string) => {
  try {
    const res = await api.get("/api/v1/users/profile", authHeaders(token));
    return res.data;
  } catch (error) {
    console.error("Get current user error:", error);
    throw new Error(parseAxiosError(error, "Failed to get user profile."));
  }
};

export type UpdateMeData = {
  name: string;
  email: string;
  phone?: string;
};

export const updateMe = async (data: UpdateMeData, token: string) => {
  try {
    const res = await api.put("/api/v1/users/updateMe", data, authHeaders(token));
    return res.data;
  } catch (error) {
    console.error("Update profile error:", error);
    throw new Error(parseAxiosError(error, "Failed to update profile details."));
  }
};

export type ChangePasswordData = {
  currentPassword: string;
  password: string;
  rePassword: string;
};

export const changeMyPassword = async (data: ChangePasswordData, token: string) => {
  try {
    const res = await api.put("/api/v1/users/changeMyPassword", data, authHeaders(token));
    return res.data;
  } catch (error) {
    console.error("Change password error:", error);
    throw new Error(parseAxiosError(error, "Failed to change password."));
  }
};

export const logout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
  }
};
