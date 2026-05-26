import api from "./api.js";

const adminService = {
  getStats: async () => {
    const response = await api.get("/admin/stats");
    return response.data;
  },

  getUsers: async ({
      page = 1,
      limit = 10,
      q = "",
      status = "",
      role = ""
    } = {}) => {
      const params = new URLSearchParams();

      params.append("page", page);
      params.append("limit", limit);

      if (q.trim()) {
        params.append("q", q.trim());
      }

      if (status) {
        params.append("status", status);
      }

      if (role) {
        params.append("role", role);
      }

      const response = await api.get(`/admin/users?${params.toString()}`);
      return response.data;
    },

    suspendUser: async (userId, reason) => {
    const response = await api.patch(`/admin/users/${userId}/suspend`, {
      reason
    });

    return response.data;
  },

  restoreUserAccess: async (userId) => {
    const response = await api.patch(`/admin/users/${userId}/restore`);

    return response.data;
  },

  getBans: async ({ page = 1, limit = 10, state = "active" } = {}) => {
    const params = new URLSearchParams();

    params.append("page", page);
    params.append("limit", limit);
    params.append("state", state);

    const response = await api.get(`/admin/bans?${params.toString()}`);
    return response.data;
  },

  getReports: async ({
    page = 1,
    limit = 10,
    status = "",
    targetType = ""
  } = {}) => {
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

  takeReportAction: async (reportId, data) => {
    const response = await api.patch(`/reports/${reportId}/action`, data);
    return response.data;
  },

  deleteReport: async (reportId) => {
    const response = await api.delete(`/reports/${reportId}`);
    return response.data;
  },

  banUser: async (userId, { reason, expiresAt = null }) => {
    const body = {
      reason,
      expiresAt
    };

    const response = await api.post(`/bans/${userId}`, body);
    return response.data;
  },

  removeBan: async (banId) => {
    const response = await api.patch(`/bans/${banId}/remove`);
    return response.data;
  },

  getAppeals: async ({ page = 1, limit = 10, status = "" } = {}) => {
    const params = new URLSearchParams();

    params.append("page", page);
    params.append("limit", limit);

    if (status) {
      params.append("status", status);
    }

    const response = await api.get(`/bans/appeals?${params.toString()}`);
    return response.data;
  },

  reviewAppeal: async (appealId, { status, unbanUser = true }) => {
    const response = await api.patch(`/bans/appeals/${appealId}`, {
      status,
      unbanUser
    });

    return response.data;
  }
};

export default adminService;