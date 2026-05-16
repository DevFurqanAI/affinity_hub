import api from "./api.js";

const storyService = {
  createStory: async (formData) => {
    const response = await api.post("/stories", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });

    return response.data;
  },

  getStoryFeed: async () => {
    const response = await api.get("/stories/feed");
    return response.data;
  },

  viewStory: async (storyId) => {
    const response = await api.post(`/stories/${storyId}/view`);
    return response.data;
  },

  deleteStory: async (storyId) => {
    const response = await api.delete(`/stories/${storyId}`);
    return response.data;
  },

  getStoryViews: async (storyId) => {
    const response = await api.get(`/stories/${storyId}/views`);
    return response.data;
  }
};

export default storyService;