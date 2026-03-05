// src/utilitys/api.js
import axios from "axios";
import { getAuth } from "firebase/auth";

const api = axios.create({
  baseURL: "https://programing-hero-assignment-11-serve.vercel.app", // Change to your production URL later (e.g. https://your-backend.com)
  timeout: 10000,
});

// Automatically attach Firebase ID token to every request
api.interceptors.request.use(async (config) => {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  if (currentUser) {
  console.log(`[API DEBUG] Current user UID: ${currentUser.uid}`);
  console.log(`[API DEBUG] Current user email: ${currentUser.email}`);
  try {
    const token = await currentUser.getIdToken();
    console.log(`[API DEBUG] Token first 50 chars: ${token.substring(0, 50)}...`);
    config.headers.Authorization = `Bearer ${token}`;
  } catch (err) {
    console.error("[API DEBUG] getIdToken failed:", err.code, err.message);
  }
}

  if (currentUser) {
    try {
      const token = await currentUser.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`[API] Token attached for: ${config.url}`);
    } catch (err) {
      console.error("[API] Failed to get token:", err.message);
    }
  } else {
    console.warn("[API] No logged-in user - no token sent");
  }

  return config;
}, (error) => {
  console.error("[API] Request interceptor error:", error);
  return Promise.reject(error);
});

// Optional: Handle 401 globally (e.g. logout or redirect)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("[API] 401 Unauthorized - token invalid/expired");
      // Optional: trigger logout here
      // getAuth().signOut().then(() => window.location.href = "/login");
    }
    return Promise.reject(error);
  }
);

export default api;