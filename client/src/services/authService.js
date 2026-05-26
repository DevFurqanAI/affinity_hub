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
  },

  forgotPassword: async (email) => {
    const response = await api.post("/auth/forgot-password", {
      email
    });

    return response.data;
  },

  verifyPasswordResetOtp: async ({ email, otp }) => {
    const response = await api.post("/auth/verify-reset-otp", {
      email,
      otp
    });

    return response.data;
  },

  resetPassword: async ({ email, resetToken, newPassword }) => {
    const response = await api.post("/auth/reset-password", {
      email,
      resetToken,
      newPassword
    });

    return response.data;
  },

  getSecuritySettings: async () => {
    const response = await api.get("/auth/security-settings");
    return response.data;
  },

  linkGoogleAccount: async (credential) => {
    const response = await api.post("/auth/link/google", {
      credential
    });

    return response.data;
  },

  unlinkGoogleAccount: async () => {
    const response = await api.delete("/auth/link/google");
    return response.data;
  },

  changePassword: async ({
    currentPassword = "",
    newPassword,
    googleCredential = ""
  }) => {
    const response = await api.patch("/auth/password", {
      currentPassword,
      newPassword,
      googleCredential
    });

    return response.data;
  }
};

export default authService;