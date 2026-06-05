import api from "./api.js";

const likeService = {
  likePost: async (postId) => {
    const response = await api.post(`/likes/${postId}`);
    return response.data;
  },

  unlikePost: async (postId) => {
    const response = await api.delete(`/likes/${postId}`);
    return response.data;
  },

  getLikeStatus: async (postId) => {
    const response = await api.get(`/likes/${postId}/status`);
    return response.data;
  },

  getPostLikedUsers: async (postId, page = 1, limit = 20) => {
    const response = await api.get(
      `/likes/${postId}/users?page=${page}&limit=${limit}`
    );

    return response.data;
  }
};

export default likeService;