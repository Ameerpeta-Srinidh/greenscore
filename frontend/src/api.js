import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json"
  }
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const auth = localStorage.getItem("auth");
  if (auth) {
    try {
      const authData = JSON.parse(auth);
      if (authData.token) {
        config.headers.Authorization = `Bearer ${authData.token}`;
      }
    } catch (e) {
      // Invalid auth data, ignore
    }
  }
  return config;
});