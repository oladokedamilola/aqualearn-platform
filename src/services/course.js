import api from './api';

export const courseService = {
  // Get all courses with filters
  getCourses: async (params = {}) => {
    const response = await api.get('/courses/', { params });
    console.log('📚 API Response:', response.data); // Debug log
    
    // Check if response is paginated (has results array) or direct array
    if (response.data && typeof response.data === 'object') {
      // If it has a 'results' property, it's paginated
      if (response.data.results && Array.isArray(response.data.results)) {
        console.log('📚 Paginated response, found', response.data.results.length, 'courses');
        return response.data.results;
      }
      // If it's a direct array
      if (Array.isArray(response.data)) {
        console.log('📚 Direct array response, found', response.data.length, 'courses');
        return response.data;
      }
    }
    
    // If neither, return empty array
    console.warn('📚 Unexpected response format:', response.data);
    return [];
  },

  // Get single course with lessons
  getCourse: async (id) => {
    const response = await api.get(`/courses/${id}/`);
    return response.data;
  },

  // Get lesson details with quiz
  getLesson: async (id) => {
    const response = await api.get(`/courses/lessons/${id}/`);
    return response.data;
  },

  // Admin: Create course
  createCourse: async (data) => {
    const response = await api.post('/courses/admin/create/', data);
    return response.data;
  },

  // Admin: Update course
  updateCourse: async (id, data) => {
    const response = await api.patch(`/courses/admin/${id}/update/`, data);
    return response.data;
  },

  // Admin: Delete course
  deleteCourse: async (id) => {
    const response = await api.delete(`/courses/admin/${id}/delete/`);
    return response.data;
  },
};