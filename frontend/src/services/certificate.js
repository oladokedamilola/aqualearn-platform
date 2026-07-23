import api from './api';

export const certificateService = {
  // Get all certificates with pagination
  getCertificates: async (page = 1, pageSize = 3) => {
    console.log(`📤 API call: GET /certificates/?page=${page}&page_size=${pageSize}`);
    try {
      const response = await api.get('/certificates/', {
        params: { page, page_size: pageSize }
      });
      console.log('📥 API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ API error:', error);
      console.error('❌ Error response:', error.response);
      throw error;
    }
  },

  // Get certificate details
  getCertificate: async (id) => {
    const response = await api.get(`/certificates/${id}/`);
    return response.data;
  },

  // Check eligibility
  checkEligibility: async (courseId) => {
    const response = await api.get(`/certificates/eligibility/${courseId}/`);
    return response.data;
  },

  // Issue certificate
  issueCertificate: async (courseId) => {
    const response = await api.post(`/certificates/issue/${courseId}/`);
    return response.data;
  },

  // Check missing certificates
  checkMissingCertificates: async () => {
    console.log('📤 API call: GET /certificates/missing/');
    const response = await api.get('/certificates/missing/');
    console.log('📥 API response:', response.data);
    return response.data;
  },

  // Download certificate
  downloadCertificate: async (id) => {
    const response = await api.get(`/certificates/download/${id}/`, {
      responseType: 'blob',
    });
    return response;
  },

  // Get shareable link
  getShareLink: async (id) => {
    const response = await api.get(`/certificates/share/${id}/`);
    return response.data;
  },

  // Verify certificate
  verifyCertificate: async (certificateId, verificationCode) => {
    const response = await api.post('/certificates/verify/', {
      certificate_id: certificateId,
      verification_code: verificationCode,
    });
    return response.data;
  },
};