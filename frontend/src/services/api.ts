import axios from 'axios';

const API_BASE = '/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('travel_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for handling 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Optional auto-logout on token expiration
      // localStorage.removeItem('travel_token');
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authApi = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  sendOtp: (email: string, purpose?: string) => api.post('/auth/send-otp', { email, purpose }),
  verifyOtp: (email: string, otp: string) => api.post('/auth/verify-otp', { email, otp }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  updatePreferences: (data: any) => api.put('/auth/preferences', data),
  changePassword: (data: any) => api.post('/auth/change-password', data),
};

// Destination Endpoints
export const destinationApi = {
  getAll: (params?: any) => api.get('/destinations', { params }),
  getFeatured: () => api.get('/destinations/featured'),
  getById: (id: string) => api.get(`/destinations/${id}`),
  getBySlug: (slug: string) => api.get(`/destinations/slug/${slug}`),
};

// Recommendations Endpoint
export const recommendationApi = {
  getRecommendations: (data: {
    budget: number;
    durationDays: number;
    travelType: string;
    interests: string[];
  }) => api.post('/recommendations', data),
};

// Itinerary Endpoints
export const itineraryApi = {
  generate: (data: {
    destinationId: string;
    durationDays: number;
    travelType: string;
    userBudget: number;
  }) => api.post('/itineraries/generate', data),
  saveTrip: (data: any) => api.post('/itineraries/save', data),
  getMyTrips: () => api.get('/itineraries/my-trips'),
  getTripById: (id: string) => api.get(`/itineraries/${id}`),
  deleteTrip: (id: string) => api.delete(`/itineraries/${id}`),
  updateTripStatus: (id: string, status: string) => api.patch(`/itineraries/${id}/status`, { status }),
};

// Hotels and Restaurants
export const hotelApi = {
  getAll: (params?: any) => api.get('/hotels', { params }),
  getById: (id: string) => api.get(`/hotels/${id}`),
};

export const restaurantApi = {
  getAll: (params?: any) => api.get('/restaurants', { params }),
  getById: (id: string) => api.get(`/restaurants/${id}`),
};

// Reviews
export const reviewApi = {
  addReview: (data: { destinationId: string; rating: number; comment: string }) =>
    api.post('/reviews', data),
  getByDestination: (destinationId: string) => api.get(`/reviews/destination/${destinationId}`),
};

// Wishlist
export const wishlistApi = {
  toggle: (destinationId: string) => api.post('/wishlist/toggle', { destinationId }),
  getWishlist: () => api.get('/wishlist'),
};

// Admin Endpoints
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  createDestination: (data: any) => api.post('/admin/destinations', data),
  updateDestination: (id: string, data: any) => api.put(`/admin/destinations/${id}`, data),
  deleteDestination: (id: string) => api.delete(`/admin/destinations/${id}`),
  addPlace: (data: any) => api.post('/admin/places', data),
  addHotel: (data: any) => api.post('/admin/hotels', data),
  addRestaurant: (data: any) => api.post('/admin/restaurants', data),
  deleteReview: (id: string) => api.delete(`/admin/reviews/${id}`),
};

// Live Explore (any place in India)
export const exploreApi = {
  search: (q: string) => api.get('/explore/search', { params: { q } }),
  nearby: (lat: number, lon: number, name: string, radius = 10) =>
    api.get('/explore/nearby', { params: { lat, lon, name, radius } }),
};
