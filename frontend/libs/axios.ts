import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

let isRefreshing = false;
let failedQueue: {
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}[] = [];

const processQueue = (error: AxiosError | null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    response => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        // Only skip refresh for auth endpoints that are part of the auth flow itself
        // /auth/me should NOT be skipped - it needs token refresh when access token expires
        const skipRefreshEndpoints = [
            "/auth/login",
            "/auth/register",
            "/auth/refresh",
            "/auth/logout",
            "/auth/logoutall",
        ];
        if (skipRefreshEndpoints.some(endpoint => originalRequest.url?.includes(endpoint))) {
            return Promise.reject(error);
        }

        // Don't attempt refresh if we're already on the login or register page
        if (typeof window !== "undefined" && (window.location.pathname === "/login" || window.location.pathname === "/register")) {
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then(() => api(originalRequest))
                .catch(err => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            await api.post("/auth/refresh");

            processQueue(null);

            return api(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError as AxiosError);

            // Don't redirect to login if already on auth pages
            if (typeof window !== "undefined" && window.location.pathname !== "/login" && window.location.pathname !== "/register") {
                window.location.href = "/login";
            }

            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

api.interceptors.request.use(
    config => {
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

export default api;
