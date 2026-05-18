import api from "./api.js";

const reportService = {
  createReport: async ({ targetId, targetType, reason }) => {
    const response = await api.post("/reports", {
      targetId,
      targetType,
      reason
    });

    return response.data;
  }
};

export default reportService;