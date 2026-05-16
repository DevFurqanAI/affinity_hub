import api from "./api.js";

const searchService = {
  searchUsers: async (query, page = 1, limit = 10) => {
    const response = await api.get(
      `/search/users?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );

    return response.data;
  },

  searchPosts: async (query, page = 1, limit = 10) => {
    const response = await api.get(
      `/search/posts?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );

    return response.data;
  }
};

export default searchService;