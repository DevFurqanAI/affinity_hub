import { create } from "zustand";
import toast from "react-hot-toast";

import authService from "../services/authService.js";
import userService from "../services/userService.js";
import interestService from "../services/interestService.js";

const AUTH_SESSION_KEY = "affinity_hub_has_session";

const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  isAuthChecking: true,
  
  setCurrentUser: (user) => {
    set({
      user
    });
  },

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
      isAuthenticated: false
    });

    localStorage.removeItem(AUTH_SESSION_KEY);
  },

  register: async (formData) => {
    try {
      set({ isLoading: true });

      const result = await authService.register(formData);

      set({
        user: result.data?.user,
        accessToken: result.data?.accessToken,
        isAuthenticated: true
      });

      localStorage.setItem(AUTH_SESSION_KEY, "true");

      toast.success(result.message || "Registered successfully");

      return {
        success: true,
        user: result.data?.user
      };
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";

      toast.error(message);

      return {
        success: false,
        user: null
      };
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (formData) => {
    try {
      set({ isLoading: true });

      const result = await authService.login(formData);

      set({
        user: result.data?.user,
        accessToken: result.data?.accessToken,
        isAuthenticated: true
      });

      localStorage.setItem(AUTH_SESSION_KEY, "true");

      toast.success(result.message || "Login successful");

      return {
        success: true,
        user: result.data?.user
      };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";

      toast.error(message);

      return {
        success: false,
        user: null
      };
    } finally {
      set({ isLoading: false });
    }
  },

  googleAuth: async (credential) => {
    try {
      set({ isLoading: true });

      const result = await authService.googleAuth(credential);

      set({
        user: result.data?.user,
        accessToken: result.data?.accessToken,
        isAuthenticated: true
      });

      localStorage.setItem(AUTH_SESSION_KEY, "true");

      toast.success(result.message || "Google authentication successful");

      return {
        success: true,
        user: result.data?.user
      };
    } catch (error) {
      const message =
        error.response?.data?.message || "Google authentication failed";

      toast.error(message);

      return {
        success: false,
        user: null
      };
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch {
      // Logout should still clear frontend state even if server call fails.
    } finally {
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false
      });

      localStorage.removeItem(AUTH_SESSION_KEY);

      toast.success("Logged out successfully");
    }
  },

  fetchMe: async () => {
    try {
      set({ isAuthChecking: true });

      let currentAccessToken = get().accessToken;
      const hasStoredSession = localStorage.getItem(AUTH_SESSION_KEY) === "true";

      if (!currentAccessToken && !hasStoredSession) {
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false
        });

        return null;
      }

      if (!currentAccessToken && hasStoredSession) {
        const refreshResult = await authService.refreshToken();
        currentAccessToken = refreshResult.data?.accessToken;

        if (currentAccessToken) {
          set({
            accessToken: currentAccessToken,
            isAuthenticated: true
          });
        }
      }

      const result = await authService.getMe();

      set({
        user: result.data?.user,
        isAuthenticated: true
      });

      return result.data?.user;
    } catch {
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false
      });

      localStorage.removeItem(AUTH_SESSION_KEY);

      return null;
    } finally {
      set({ isAuthChecking: false });
    }
  },

  initializeAuth: async () => {
    return get().fetchMe();
  },

  verifyEmail: async (otp) => {
    try {
      set({ isLoading: true });

      const result = await authService.verifyEmail(otp);

      set({
        user: result.data?.user
      });

      toast.success(result.message || "Email verified successfully");

      return {
        success: true,
        user: result.data?.user
      };
    } catch (error) {
      const message =
        error.response?.data?.message || "Email verification failed";

      toast.error(message);

      return {
        success: false,
        user: null
      };
    } finally {
      set({ isLoading: false });
    }
  },

  resendVerificationOtp: async () => {
    try {
      set({ isLoading: true });

      const result = await authService.resendVerificationOtp();

      if (result.data?.user) {
        set({
          user: result.data.user
        });
      }

      toast.success(result.message || "Verification OTP sent");

      return true;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to resend OTP";

      toast.error(message);

      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  completeProfile: async (data) => {
    try {
      set({ isLoading: true });

      const result = await userService.completeProfile(data);

      set({
        user: result.data?.user
      });

      toast.success(result.message || "Profile completed successfully");

      return {
        success: true,
        user: result.data?.user
      };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to complete profile";

      toast.error(message);

      return {
        success: false,
        user: null
      };
    } finally {
      set({ isLoading: false });
    }
  },

  completeInterests: async (interestIds) => {
    try {
      set({ isLoading: true });

      const result = await interestService.setMyInterests(interestIds);

      set((state) => ({
        user: result.data?.user || {
          ...state.user,
          interestsSetupCompleted: true
        }
      }));

      toast.success(result.message || "Interests saved successfully");

      return true;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to save interests";

      toast.error(message);

      return false;
    } finally {
      set({ isLoading: false });
    }
  }
}));

export default useAuthStore;