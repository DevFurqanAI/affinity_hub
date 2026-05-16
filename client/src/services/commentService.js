import api from "./api.js";

const commentService = {
  createComment: async (postId, content) => {
    const response = await api.post(`/comments/${postId}`, { content });
    return response.data;
  },

  getComments: async (postId, page = 1, limit = 10) => {
    const response = await api.get(
      `/comments/${postId}?page=${page}&limit=${limit}`
    );

    return response.data;
  },

  updateComment: async (commentId, content) => {
    const response = await api.patch(`/comments/${commentId}`, { content });
    return response.data;
  },

  deleteComment: async (commentId) => {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  }
};

export default commentService;