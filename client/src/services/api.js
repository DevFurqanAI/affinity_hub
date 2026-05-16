import axios from "axios";

import useAuthStore from "../store/authStore.js";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true
});

api.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

const isAuthPublicRoute = (url = "") => {
  return (
    url.includes("/auth/login") ||
    url.includes("/auth/register") ||
    url.includes("/auth/refresh")
  );
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const statusCode = error.response?.status;
    const requestUrl = originalRequest.url || "";

    /*
    |--------------------------------------------------------------------------
    | Important Auth Fix
    |--------------------------------------------------------------------------
    | Do not auto-refresh when login/register fails.
    | Example: wrong password should show login error, not call /auth/refresh.
    */
    if (statusCode === 401 && isAuthPublicRoute(requestUrl)) {
      return Promise.reject(error);
    }

    if (statusCode === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await api.post("/auth/refresh");
        const newAccessToken = refreshResponse.data?.data?.accessToken;

        if (!newAccessToken) {
          throw new Error("No access token received from refresh route");
        }

        useAuthStore.getState().setAccessToken(newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;