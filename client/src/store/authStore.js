import { create } from "zustand";
import toast from "react-hot-toast";

import authService from "../services/authService.js";

const getErrorMessage = (error) => {
  return (
    error.response?.data?.message ||
    error.message ||
    "Something went wrong. Please try again."
  );
};

const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  isAuthChecking: true,

  setAccessToken: (accessToken) => {
    set({
      accessToken,
      isAuthenticated: Boolean(accessToken)
    });
  },

  clearAuth: () => {
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false
    });
  },

  /*
  |--------------------------------------------------------------------------
  | Initialize Auth On App Load
  |--------------------------------------------------------------------------
  | Browser cannot read HTTP-only refreshToken cookie.
  | So we call /auth/refresh first.
  | If refresh works, we get a new access token.
  | Then we call /auth/me to get current user.
  */
  initializeAuth: async () => {
    try {
      set({ isAuthChecking: true });

      const refreshResult = await authService.refreshToken();

      const newAccessToken = refreshResult.data?.accessToken;

      if (!newAccessToken) {
        throw new Error("No access token received");
      }

      set({
        accessToken: newAccessToken,
        isAuthenticated: true
      });

      const meResult = await authService.getMe();

      const user = meResult.data?.user;

      set({
        user,
        isAuthenticated: true,
        isAuthChecking: false
      });

      return {
        success: true,
        data: user
      };
    } catch {
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isAuthChecking: false,
        isLoading: false
      });

      return {
        success: false
      };
    }
  },

  register: async (userData) => {
    try {
      set({ isLoading: true });

      const result = await authService.register(userData);

      const user = result.data?.user;
      const accessToken = result.data?.accessToken;

      set({
        user,
        accessToken,
        isAuthenticated: true,
        isLoading: false,
        isAuthChecking: false
      });

      toast.success(result.message || "Registration successful");

      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      const message = getErrorMessage(error);

      set({ isLoading: false });

      toast.error(message);

      return {
        success: false,
        message
      };
    }
  },

  login: async (credentials) => {
    try {
      set({ isLoading: true });

      const result = await authService.login(credentials);

      const user = result.data?.user;
      const accessToken = result.data?.accessToken;

      set({
        user,
        accessToken,
        isAuthenticated: true,
        isLoading: false,
        isAuthChecking: false
      });

      toast.success(result.message || "Login successful");

      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      const message = getErrorMessage(error);

      set({ isLoading: false });

      toast.error(message);

      return {
        success: false,
        message
      };
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });

      await authService.logout();

      get().clearAuth();

      toast.success("Logged out successfully");

      return {
        success: true
      };
    } catch (error) {
      const message = getErrorMessage(error);

      get().clearAuth();

      toast.error(message);

      return {
        success: false,
        message
      };
    }
  },

  fetchMe: async () => {
    try {
      set({ isLoading: true });

      const result = await authService.getMe();

      const user = result.data?.user;

      set({
        user,
        isAuthenticated: true,
        isLoading: false
      });

      return {
        success: true,
        data: user
      };
    } catch (error) {
      const message = getErrorMessage(error);

      get().clearAuth();

      return {
        success: false,
        message
      };
    }
  }
}));

export default useAuthStore;