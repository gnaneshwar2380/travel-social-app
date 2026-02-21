import axios from "axios";
import { jwtDecode } from "jwt-decode";
import dayjs from "dayjs";

// ✅ Base API URL
const baseURL = "http://127.0.0.1:8000/api";

// ✅ Load stored auth tokens
let authTokens = localStorage.getItem("authTokens")
  ? JSON.parse(localStorage.getItem("authTokens"))
  : null;

// ✅ Create axios instance
const api = axios.create({
  baseURL,
  headers: { Authorization: `Bearer ${authTokens?.access}` },
  withCredentials: true,
});

// ✅ Auto-refresh expired tokens
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

  try {
    const response = await axios.post(`${baseURL}/token/refresh/`, {
      refresh: authTokens.refresh,
    });
    localStorage.setItem("authTokens", JSON.stringify(response.data));
    req.headers.Authorization = `Bearer ${response.data.access}`;
  } catch (error) {
    console.error("Token refresh failed:", error);
    localStorage.removeItem("authTokens");
  }

  return req;
});

// ======================================================
// 🔹 AUTH
// ======================================================
export const loginUser = (credentials) => axios.post(`${baseURL}/token/`, credentials);
export const refreshToken = (refresh) => axios.post(`${baseURL}/token/refresh/`, { refresh });
export const registerUser = (data) => axios.post(`${baseURL}/user/register/`, data);


// ======================================================
// 🔹 PROFILE
// ======================================================
export const getProfile = () => api.get("/profile/");
export const updateProfile = (formData) => api.put("/profile/update/", formData);

// ======================================================
// 🔹 POSTS & FEED
// ======================================================
export const getAllPosts = () => api.get("/posts/");
export const createPost = (data) => api.post("/posts/", data);
export const getPostDetail = (id) => api.get(`/posts/${id}/`);
export const likePost = (id) => api.post(`/posts/${id}/like/`);
export const savePost = (id) => api.post(`/posts/${id}/save/`);
export const commentOnPost = (id, data) => api.post(`/posts/${id}/comment/`, data);

// 🔸 Saved Posts
export const getSavedPosts = () => api.get("/posts/saved/");

// 🔸 For You & Following Feed
export const getForYouFeed = () => api.get("/posts/foryou/");
export const getFollowingFeed = () => api.get("/posts/following/");

// ======================================================
// 🔹 SEARCH
// ======================================================
export const search = (query) => api.get(`/search/?q=${query}`);

// ======================================================
// 🔹 FOLLOWS / MATES
// ======================================================
export const getMates = () => api.get("/follows/mates/");
export const followUser = (id) => api.post(`/follows/${id}/toggle/`);

// ======================================================
// 🔹 MESSAGES
// ======================================================
export const getMessages = () => api.get("/messages/");
export const sendMessage = (data) => api.post("/messages/", data);
export const getTripChat = (postId) => api.get(`/messages/trip_chat/?post_id=${postId}`);

// ======================================================
// 🔹 TRIP JOIN REQUESTS
// ======================================================
export const joinTrip = (postId) => api.post("/trip-join-requests/", { post: postId });
export const approveJoinRequest = (id) => api.post(`/trip-join-requests/${id}/approve/`);

// ======================================================
// 🔹 NOTIFICATIONS
// ======================================================
export const getNotifications = () => api.get("/notifications/");
export const markAllRead = () => api.post("/notifications/mark_all_read/");

// ======================================================
export default api;

