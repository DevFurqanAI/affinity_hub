import api from "./api.js";

const authService = {
  register: async (data) => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  login: async (data) => {
    const response = await api.post("/auth/login", data);
    return response.data;
  },

  googleAuth: async (credential) => {
    const response = await api.post("/auth/google", {
      credential
    });

    return response.data;
  },

  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  refreshToken: async () => {
    const response = await api.post("/auth/refresh");
    return response.data;
  },

  verifyEmail: async (otp) => {
    const response = await api.post("/auth/verify-email", {
      otp
    });

    return response.data;
  },

  resendVerificationOtp: async () => {
    const response = await api.post("/auth/resend-verification-otp", {});
    return response.data;
  }
};

export default authService;