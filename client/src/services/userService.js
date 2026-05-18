import api from "./api.js";

const userService = {
  getCurrentUserProfile: async () => {
    const response = await api.get("/users/me");
    return response.data;
  },

  getUserProfile: async (username) => {
    const response = await api.get(`/users/${username}`);
    return response.data;
  },

  completeProfile: async (data) => {
    const response = await api.patch("/users/me/complete-profile", data);
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.patch("/users/me", data);
    return response.data;
  },

  updateAvatar: async (avatarFile) => {
    const formData = new FormData();

    formData.append("avatar", avatarFile);

    const response = await api.patch("/users/me/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });

    return response.data;
  }
};

export default userService;