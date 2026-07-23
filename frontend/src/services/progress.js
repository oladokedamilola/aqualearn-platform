import api from './api';

export const progressService = {
  // Enroll in a course
  enroll: async (courseId) => {
    const response = await api.post(`/courses/${courseId}/enroll/`);
    return response.data;
  },

  // Get course progress
  getCourseProgress: async (courseId) => {
    const response = await api.get(`/progress/course/${courseId}/`);
    return response.data;
  },

  // Update watch progress
  updateWatchProgress: async (lessonId, percentage) => {
    console.log(`📤 Updating watch progress for lesson ${lessonId}: ${percentage}%`);
    const response = await api.post(`/progress/watch/${lessonId}/`, { percentage });
    console.log(`📥 Watch progress response:`, response.data);
    return response.data;
  },

  // Submit quiz
  submitQuiz: async (lessonId, answers) => {
    const response = await api.post(`/progress/quiz/${lessonId}/`, { answers });
    return response.data;
  },

  // Get lesson status (next/prev)
  getLessonStatus: async (lessonId) => {
    const response = await api.get(`/progress/lesson/${lessonId}/status/`);
    return response.data;
  },

  // Get dashboard stats
  getDashboardStats: async () => {
    const response = await api.get('/progress/dashboard/');
    return response.data;
  },
};


// Reset progress for a lesson
resetProgress: async (lessonId) => {
  console.log(`📤 Resetting progress for lesson ${lessonId}`);
  const response = await api.post(`/progress/reset/${lessonId}/`);
  console.log(`📥 Reset progress response:`, response.data);
  return response.data;
}