import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
});

// Attach JWT to every request if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Redirect to login on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const BASE_VIDEO_URL = `${BASE_URL}/videos`;

// Auth endpoints
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

// Video endpoints
export const videosApi = {
  getRecommended: () => api.get('/videos/recommend'),
  search: (query) => api.get('/videos/search', { params: { query } }),
  getById: (videoId) => api.get(`/videos/${videoId}`),
  getUserVideos: (username) => api.get(`/videos/user/${username}`),
  upload: (formData, onUploadProgress) =>
    api.post('/videos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    }),
  getMasterPlaylist: (videoId) => `${BASE_URL}/videos/${videoId}/master.m3u8`,
  getSegment: (videoId, resolution, fileName) =>
    `${BASE_URL}/videos/${videoId}/${resolution}/${fileName}`,
};

// User endpoints
export const usersApi = {
  getByUsername: (username) => api.get(`/users/${username}`),
};

// Analytics endpoints
export const analyticsApi = {
  getContinueWatching: () => api.get('/analytics/continuewatching'),
  updateContinueWatching: (videoId, lastPlaybackSecond) =>
    api.patch('/analytics/continuewatching', { videoId, lastPlaybackSecond }),
};

// Comments endpoints
export const commentsApi = {
  getComments: (videoId, page = 0, size = 20) =>
    api.get(`/videos/${videoId}/comments`, { params: { page, size } }),
  postComment: (videoId, text, parentId = null) =>
    api.post(`/videos/${videoId}/comments`, { text, ...(parentId ? { parentId } : {}) }),
  getReplies: (commentId, page = 0, size = 20) =>
    api.get(`/comments/${commentId}/replies`, { params: { page, size } }),
  deleteComment: (commentId) =>
    api.delete(`/comments/${commentId}`),
};

export default api;
