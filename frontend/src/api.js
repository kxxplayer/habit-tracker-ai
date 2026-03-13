import axios from 'axios';
import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || 'https://habit-tracker-ai-13ly.onrender.com';

// Axios instance that automatically attaches the Supabase JWT token
export const api = axios.create({ baseURL: API_URL });

// Optional explicit token setter (helps avoid race conditions on page reload)
export const setApiToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

api.interceptors.request.use(async (config) => {
  // If we already set it explicitly via setApiToken, use that
  if (config.headers.Authorization) return config;

  // Fallback: query Supabase directly
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// Get current user (auto-created on backend from JWT)
export const getMe = async () => {
  const res = await api.get('/me');
  return res.data;
};

export const fetchHabits = async () => {
  const res = await api.get('/habits/');
  return res.data;
};

export const createHabit = async (habitData) => {
  const res = await api.post('/habits/', habitData);
  return res.data;
};

export const logHabitComplete = async (habitId) => {
  const res = await api.post(`/habits/${habitId}/log`, {});
  return res.data;
};
