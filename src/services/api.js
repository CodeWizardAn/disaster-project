import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// User endpoints
export const userService = {
  register: (userData) => apiClient.post('/users/register', userData),
  getProfile: (userId) => apiClient.get(`/users/${userId}`),
  updateProfile: (userId, updates) => apiClient.put(`/users/${userId}`, updates),
  updateDeviceToken: (userId, deviceToken) =>
    apiClient.post(`/users/${userId}/device-token`, { deviceToken }),
  testNotification: (userId, title, body) =>
    apiClient.post(`/users/${userId}/test-notification`, { title, body })
};

// Disaster endpoints
export const disasterService = {
  markUnsafe: (disasterData) => apiClient.post('/disaster/mark-unsafe', disasterData),
  markSafe: (userId) => apiClient.post('/disaster/mark-safe', { userId }),
  getNearbyRequests: (lat, lng, radius = 5) =>
    apiClient.get(`/disaster/nearby/${lat}/${lng}?radius=${radius}`),
  getOpenRequests: () => apiClient.get('/disaster/all/open'),
  updateRequest: (requestId, updates) => apiClient.put(`/disaster/${requestId}`, updates),
  getRequestDetails: (requestId) => apiClient.get(`/disaster/${requestId}/details`)
};

// Volunteer endpoints
export const volunteerService = {
  register: (volunteerData) => apiClient.post('/volunteers/register', volunteerData),
  updateLocation: (volunteerId, latitude, longitude) =>
    apiClient.post(`/volunteers/${volunteerId}/location`, { latitude, longitude }),
  getAssignments: (volunteerId) => apiClient.get(`/volunteers/${volunteerId}/assignments`),
  acceptAssignment: (volunteerId, assignmentId) =>
    apiClient.post(`/volunteers/${volunteerId}/accept/${assignmentId}`),
  completeAssignment: (volunteerId, assignmentId, data) =>
    apiClient.post(`/volunteers/${volunteerId}/complete/${assignmentId}`, data),
  updateAvailability: (volunteerId, available) =>
    apiClient.put(`/volunteers/${volunteerId}/availability`, { available }),
  getNearbyVolunteers: (lat, lng, radius = 10) =>
    apiClient.get(`/volunteers/nearby/${lat}/${lng}?radius=${radius}`)
};

// AI endpoints
export const aiService = {
  aggregateRequests: () => apiClient.post('/ai/aggregate'),
  analyzeRequest: (requestId) => apiClient.post(`/ai/analyze/${requestId}`),
  generateStrategy: (requestIds, availableVolunteerIds) =>
    apiClient.post('/ai/strategy', { requestIds, availableVolunteerIds }),
  matchVolunteer: (requestId, volunteerId) =>
    apiClient.post('/ai/match', { requestId, volunteerId }),
  optimizeRoute: (origin, destinationIds) =>
    apiClient.post('/ai/route-optimize', { origin, destinationIds }),
  getDashboard: () => apiClient.get('/ai/dashboard')
};

export default apiClient;
