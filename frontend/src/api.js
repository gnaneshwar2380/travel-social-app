import axios from "axios";
import { jwtDecode } from "jwt-decode";
import dayjs from "dayjs";

// ✅ Base URL (no double /api)
const baseURL = "http://127.0.0.1:8000";

let authTokens = localStorage.getItem("authTokens")
  ? JSON.parse(localStorage.getItem("authTokens"))
  : null;

const api = axios.create({
  baseURL,
  headers: { Authorization: `Bearer ${authTokens?.access}` },
});

// =====================================================
// 🔒 JWT TOKEN HANDLER
// =====================================================
api.interceptors.request.use(async (req) => {
  authTokens = localStorage.getItem("authTokens")
    ? JSON.parse(localStorage.getItem("authTokens"))
    : null;

  if (!authTokens) {
    req.headers.Authorization = `Bearer null`;
    return req;
  }

  const user = jwtDecode(authTokens.access);
  const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 1;

  if (!isExpired) {
    req.headers.Authorization = `Bearer ${authTokens.access}`;
    return req;
  }

  // Refresh token when expired
  const response = await axios.post(`${baseURL}/token/refresh/`, {
    refresh: authTokens.refresh,
  });

  localStorage.setItem("authTokens", JSON.stringify(response.data));
  req.headers.Authorization = `Bearer ${response.data.access}`;
  return req;
});

// =====================================================
// 🌍 API ENDPOINT FUNCTIONS
// =====================================================

// --- Profile ---
export const getProfile = () => api.get("/profile/");

// --- Mates (Mutual Followers) ---
export const getMates = () => api.get("/follows/mates/");

// --- Posts ---
export const getAllPosts = () => api.get("/posts/");
export const getJoinableTrips = () => api.get("/posts/joinable/");
export const createPost = (data) => api.post("/posts/", data);

// --- Join Requests ---
export const joinTrip = (postId) => api.post("/join-requests/", { post: postId });
export const approveJoinRequest = (id) => api.post(`/join-requests/${id}/approve/`);

// --- Notifications ---
export const getNotifications = () => api.get("/notifications/");
export const markAllRead = () => api.post("/notifications/mark_all_read/");

// --- Messages ---
export const getMessages = () => api.get("/messages/");
export const sendMessage = (data) => api.post("/messages/", data);
export const getTripChat = (postId) => api.get(`/messages/trip_chat/?post_id=${postId}`);

// --- Auth Helpers ---
export const loginUser = (credentials) => axios.post(`${baseURL}/token/`, credentials);
export const refreshToken = (refresh) => axios.post(`${baseURL}/token/refresh/`, { refresh });

// =====================================================
export default api;
