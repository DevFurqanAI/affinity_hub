import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

/*
|--------------------------------------------------------------------------
| Request Interceptor
|--------------------------------------------------------------------------
| This attaches the access token to every request if it exists.
| We import the store inside the function to avoid circular import issues.
*/
api.interceptors.request.use(
  async (config) => {
    const { default: useAuthStore } = await import("../store/authStore.js");

    const accessToken = useAuthStore.getState().accessToken;

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/*
|--------------------------------------------------------------------------
| Response Interceptor
|--------------------------------------------------------------------------
| If access token expires, backend returns 401.
| Then we call /auth/refresh once, save the new access token,
| and retry the original request.
*/
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const statusCode = error.response?.status;
    const isAuthRefreshRequest = originalRequest.url?.includes("/auth/refresh");
    const isAuthLogoutRequest = originalRequest.url?.includes("/auth/logout");

    if (
      statusCode === 401 &&
      !originalRequest._retry &&
      !isAuthRefreshRequest &&
      !isAuthLogoutRequest
    ) {
      originalRequest._retry = true;

      try {
        const { default: useAuthStore } = await import("../store/authStore.js");

        const refreshResponse = await api.post("/auth/refresh");

        const newAccessToken = refreshResponse.data?.data?.accessToken;

        if (!newAccessToken) {
          throw new Error("New access token was not received");
        }

        useAuthStore.getState().setAccessToken(newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        const { default: useAuthStore } = await import("../store/authStore.js");

        useAuthStore.getState().clearAuth();

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;