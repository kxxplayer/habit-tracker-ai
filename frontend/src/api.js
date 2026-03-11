import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000'; // FastAPI default port

export const api = axios.create({
  baseURL: API_URL,
});

// Since we don't have login, let's hardcode user ID 1 for now (or auto-create one if missing)
export const getOrCreateUser = async () => {
  try {
    // Try to get users
    const res = await api.get('/users/');
    const users = res.data;
    if (users.length > 0) {
      return users[0];
    }
    // Create one if it doesn't exist
    const createRes = await api.post('/users/', {
      name: "Habitify User",
      email: "user@habitify.ai"
    });
    return createRes.data;
  } catch (error) {
    console.error("Error fetching/creating user", error);
    return null;
  }
};

export const fetchHabits = async (userId) => {
  const res = await api.get(`/users/${userId}/habits/`);
  return res.data;
};

export const createHabit = async (userId, habitData) => {
  const res = await api.post(`/users/${userId}/habits/`, habitData);
  return res.data;
};

export const logHabitComplete = async (userId, habitId) => {
  const res = await api.post(`/users/${userId}/habits/${habitId}/log`, { notes: "" });
  return res.data;
};
