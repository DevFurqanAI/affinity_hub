import api from "./api.js";

const adminService = {
  getReports: async ({ page = 1, limit = 10, status = "", targetType = "" } = {}) => {
    const params = new URLSearchParams();

    params.append("page", page);
    params.append("limit", limit);

    if (status) {
      params.append("status", status);
    }

    if (targetType) {
      params.append("targetType", targetType);
    }

    const response = await api.get(`/reports?${params.toString()}`);
    return response.data;
  },

  updateReportStatus: async (reportId, status) => {
    const response = await api.patch(`/reports/${reportId}/status`, {
      status
    });

    return response.data;
  },

  deleteReport: async (reportId) => {
    const response = await api.delete(`/reports/${reportId}`);
    return response.data;
  }
};

export default adminService;