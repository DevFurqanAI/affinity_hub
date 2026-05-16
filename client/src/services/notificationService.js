import api from "./api.js";

const notificationService = {
  getNotifications: async (page = 1, limit = 20) => {
    const response = await api.get(
      `/notifications?page=${page}&limit=${limit}`
    );

    return response.data;
  },

  markAsRead: async (notificationId) => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.patch("/notifications/read-all");
    return response.data;
  },

  deleteNotification: async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  }
};

export default notificationService;