import api from "./api.js";

const blockService = {
  blockUser: async (userId) => {
    const response = await api.post(`/blocks/${userId}`);
    return response.data;
  },

  unblockUser: async (userId) => {
    const response = await api.delete(`/blocks/${userId}`);
    return response.data;
  },

  getBlockedUsers: async () => {
    const response = await api.get("/blocks");
    return response.data;
  }
};

export default blockService;