import axios from "axios";

const API_BASE_URL = "https://event-management-server-udqr.onrender.com";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiService = {
  // Auth endpoints
  register: async (
    name: string,
    email: string,
    password: string,
    photoURL: string
  ) => {
    const response = await api.post("/api/auth/register", {
      name,
      email,
      password,
      photoURL,
    });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post("/api/auth/login", { email, password });
    return response.data;
  },

  // Event endpoints
  getAllEvents: async () => {
    const response = await api.get("/api/events/");
    return response.data;
  },

  createEvent: async (eventData: any) => {
    const response = await api.post("/api/events/", eventData);
    return response.data;
  },

  joinEvent: async (eventId: string) => {
    const response = await api.put(`/api/events/join/${eventId}`);
    return response.data;
  },

  getMyEvents: async () => {
    const response = await api.get("/api/events/my-events");
    return response.data;
  },

  updateEvent: async (eventId: string, eventData: any) => {
    const response = await api.put(`/api/events/${eventId}`, eventData);
    return response.data;
  },

  deleteEvent: async (eventId: string) => {
    const response = await api.delete(`/api/events/${eventId}`);
    return response.data;
  },
};
