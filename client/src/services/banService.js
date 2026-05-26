import api from "./api.js";

const banService = {
  getMyActiveBan: async () => {
    const response = await api.get("/bans/me/active");
    return response.data;
  },

  submitAppeal: async (banId, message) => {
    const response = await api.post(`/bans/${banId}/appeal`, {
      message
    });

    return response.data;
  }
};

export default banService;