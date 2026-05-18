import api from "./api.js";

const interestService = {
  getInterests: async () => {
    const response = await api.get("/interests");
    return response.data;
  },

  setMyInterests: async (interestIds) => {
    const response = await api.post("/interests/user", {
      interestIds
    });

    return response.data;
  },

  getMyInterests: async () => {
    const response = await api.get("/interests/user/me");
    return response.data;
  }
};

export default interestService;