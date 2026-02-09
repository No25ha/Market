import axios, { AxiosError } from "axios";

const api = axios.create({
    baseURL: "https://ecommerce.routemisr.com/api/v1",
    headers: { "Content-Type": "application/json" },
});

export type ApiErrorResponse = { message?: string };

export const authHeaders = (token: string) => ({
    headers: { token },
});

export const parseAxiosError = (error: unknown, fallback = "Something went wrong.") => {
    if (axios.isAxiosError(error)) {
        const err = error as AxiosError<any>;

        // If the server returns a string (like "Pool was force destroyed")
        if (typeof err.response?.data === 'string') {
            return `${err.response.data}. Please try again.`;
        }

        const data = err.response?.data;
        let message = data?.message;

        // Handle nested validation errors (Common in RouteMisr API)
        if (data?.errors) {
            if (typeof data.errors === 'object' && data.errors.msg) {
                message = data.errors.msg;
            } else if (Array.isArray(data.errors) && data.errors[0]?.msg) {
                message = data.errors[0].msg;
            }
        }

        // Handle specific status codes if no specific message is provided
        if (err.response?.status === 401) return message || "Incorrect email or password. Please try again.";
        if (err.response?.status === 409) return message || "This email is already registered. Please sign in or use a different email.";

        return message || err.message || fallback;
    }

    if (error instanceof Error) return error.message;
    return fallback;
};

export default api;
