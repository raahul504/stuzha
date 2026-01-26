import apiClient from './axios';

export const progressService = {
  updateVideoProgress: async (contentId, lastPositionSeconds, completed = false) => {
    const response = await apiClient.put(`/progress/video/${contentId}`, {
      lastPositionSeconds,
      completed,
      totalWatchTime,
      totalWatchTimeSeconds,
    });
    return response.data;
  },

  submitAssessment: async (contentId, answers) => {
    const response = await apiClient.post(`/progress/assessment/${contentId}/submit`, {
      answers,
    });
    return response.data;
  },
};