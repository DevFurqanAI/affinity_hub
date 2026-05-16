import api from "./api.js";

const postService = {
  createPost: async (formData) => {
    const response = await api.post("/posts", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });

    return response.data;
  },

  getFeed: async (page = 1, limit = 10) => {
    const response = await api.get(`/posts/feed?page=${page}&limit=${limit}`);
    return response.data;
  },

  getExplore: async (page = 1, limit = 10) => {
    const response = await api.get(`/posts/explore?page=${page}&limit=${limit}`);
    return response.data;
  },

  getUserPosts: async (username, page = 1, limit = 10) => {
    const response = await api.get(
      `/posts/user/${username}?page=${page}&limit=${limit}`
    );

    return response.data;
  },

  getPostById: async (postId) => {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  },

  updatePost: async (postId, data) => {
    const response = await api.patch(`/posts/${postId}`, data);
    return response.data;
  },

  deletePost: async (postId) => {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
  }
};

export default postService;