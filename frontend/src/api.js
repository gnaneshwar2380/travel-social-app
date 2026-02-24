import axios from "axios";
import { jwtDecode } from "jwt-decode";
import dayjs from "dayjs";

const baseURL = "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.request.use(async (req) => {
  const authTokens = localStorage.getItem("authTokens")
    ? JSON.parse(localStorage.getItem("authTokens"))
    : null;

  if (!authTokens) {
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

export const loginUser = (credentials) => axios.post(`${baseURL}/token/`, credentials);
export const refreshToken = (refresh) => axios.post(`${baseURL}/token/refresh/`, { refresh });
export const registerUser = (data) => axios.post(`${baseURL}/user/register/`, data);

export const getProfile = () => api.get("/profile/");
export const updateProfile = (formData) => api.patch("/profile/", formData);

export const getAllPosts = () => api.get("/posts/");
export const createPost = (data) => api.post("/posts/", data);
export const getPostDetail = (id) => api.get(`/posts/${id}/`);
export const likePost = (id) => api.post(`/posts/experience/${id}/like/`);
export const savePost = (id) => api.post(`/posts/experience/${id}/save/`);
export const commentOnPost = (id, data) => api.post(`/posts/experience/${id}/comments/`, data);

export const getSavedPosts = () => api.get("/saved/");
export const getForYouFeed = () => api.get("/posts/foryou/");
export const getFollowingFeed = () => api.get("/posts/following/");

export const search = (query) => api.get(`/search/?q=${query}`);

export const getMates = () => api.get("/follows/mates/");
export const followUser = (id) => api.post(`/follows/${id}/toggle/`);

export const getMessages = () => api.get("/messages/conversations/");
export const sendMessage = (data) => api.post("/messages/", data);

export const joinTrip = (postId) => api.post("/joinable-trips/", { post: postId });
export const approveJoinRequest = (id) => api.post(`/joinable-trips/requests/${id}/approve/`);

export const getNotifications = () => api.get("/notifications/");
export const markAllRead = () => api.post("/notifications/mark_all_read/");

export default api;
