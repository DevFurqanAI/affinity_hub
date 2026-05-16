import api from "./api.js";

const followService = {
  followUser: async (userId) => {
    const response = await api.post(`/follows/${userId}/follow`);
    return response.data;
  },

  unfollowUser: async (userId) => {
    const response = await api.delete(`/follows/${userId}/unfollow`);
    return response.data;
  },

  getSuggestions: async () => {
    const response = await api.get("/follows/suggestions");
    return response.data;
  },

  getFollowers: async (userId) => {
    const response = await api.get(`/follows/${userId}/followers`);
    return response.data;
  },

  getFollowing: async (userId) => {
    const response = await api.get(`/follows/${userId}/following`);
    return response.data;
  }
};

export default followService;