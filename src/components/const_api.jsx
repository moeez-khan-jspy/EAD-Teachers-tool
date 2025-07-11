// API base URL
export const API_BASE_URL = 'https://eadteachers-toolbackend-production-129c.up.railway.app/api';

// API endpoints
export const API_ENDPOINTS = {
  TERMS_PLAN: `${API_BASE_URL}/terms_plan`,
  LESSON_PLAN: `${API_BASE_URL}/lesson_plan`
};

// API configurations
export const API_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
  },
};

// GET request configuration
export const FETCH_CONFIG = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
};

// POST request configuration
export const POST_CONFIG = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
};
