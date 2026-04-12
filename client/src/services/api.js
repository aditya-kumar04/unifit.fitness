import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  googleVerify: (token) => api.post('/auth/google/verify', { token }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  logout: () => api.post('/auth/logout'),
};

// Workout API calls
export const workoutAPI = {
  getDailyWorkouts: () => api.get('/workouts/daily'),
  completeExercise: (workoutId, exerciseIndex) => api.put(`/workouts/${workoutId}/exercises/${exerciseIndex}/complete`),
  getWorkoutHistory: (page = 1, limit = 10) => api.get(`/workouts/history?page=${page}&limit=${limit}`),
  createWorkout: (workoutData) => api.post('/workouts', workoutData),
  updateWorkout: (workoutId, workoutData) => api.put(`/workouts/${workoutId}`, workoutData),
};

// Chat API calls
export const chatAPI = {
  getChats: (page = 1, limit = 20) => api.get(`/chats?page=${page}&limit=${limit}`),
  getChat: (chatId) => api.get(`/chats/${chatId}`),
  sendMessage: (chatId, messageData) => api.post(`/chats/${chatId}/messages`, messageData),
  markAsRead: (chatId) => api.put(`/chats/${chatId}/read`),
  createChat: (chatData) => api.post('/chats', chatData),
};

// Progress API calls (basic)
export const basicProgressAPI = {
  getWeightHistory: () => api.get('/progress/weight'),
  logWeight: (weightData) => api.post('/progress/weight', weightData),
  uploadPhoto: (formData) => api.post('/progress/photos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getProgress: () => api.get('/progress'),
};

// User API calls
export const userAPI = {
  getStreak: () => api.get('/users/streak'),
  updateSettings: (settings) => api.put('/users/settings', settings),
  getStats: () => api.get('/users/stats'),
};

// Nutrition API calls
export const nutritionAPI = {
  getFoods: (params = {}) => api.get('/nutrition/foods', { params }),
  getDaily: (date) => api.get('/nutrition/daily', { params: { date } }),
  logMeal: (mealData) => api.post('/nutrition/meals', mealData),
  updateWater: (glasses) => api.post('/nutrition/water', { glasses }),
  getGoals: () => api.get('/nutrition/goals'),
  updateGoals: (goals) => api.put('/nutrition/goals', goals),
  getAnalytics: (period) => api.get('/nutrition/analytics', { params: { period } }),
};

// Booking API calls
export const bookingAPI = {
  getAvailability: (params) => api.get('/booking/availability', { params }),
  getMyBookings: (params) => api.get('/booking/my-bookings', { params }),
  createBooking: (bookingData) => api.post('/booking/book', bookingData),
  updateBooking: (bookingId, data) => api.put(`/booking/${bookingId}`, data),
  cancelBooking: (bookingId) => api.delete(`/booking/${bookingId}`),
  getBookingTypes: () => api.get('/booking/booking-types'),
  getMentorSchedule: (date) => api.get('/booking/mentor/schedule', { params: { date } }),
};

// Enhanced Progress API calls
export const progressAPI = {
  getWeightHistory: () => api.get('/progress/weight'),
  logWeight: (weightData) => api.post('/progress/weight', weightData),
  uploadPhoto: (formData) => api.post('/progress/photos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getPhotos: (params) => api.get('/progress/photos', { params }),
  deletePhoto: (photoId) => api.delete(`/progress/photos/${photoId}`),
  logMeasurement: (measurementData) => api.post('/progress/measurements', measurementData),
  getAnalytics: (period) => api.get('/progress/analytics', { params: { period } }),
  getGoals: () => api.get('/progress/goals'),
  setGoals: (goals) => api.post('/progress/goals', goals),
};

// Mentor API calls
export const mentorAPI = {
  getClients: (params) => api.get('/mentor/clients', { params }),
  getClientDetails: (clientId) => api.get(`/mentor/clients/${clientId}`),
  addClientNote: (clientId, note) => api.post(`/mentor/clients/${clientId}/notes`, note),
  getAnalytics: (period) => api.get('/mentor/analytics', { params: { period } }),
  createWorkoutPlan: (clientId, plan) => api.post(`/mentor/clients/${clientId}/workout-plan`, plan),
  getSchedule: (date) => api.get('/mentor/schedule', { params: { date } }),
};

export default api;
