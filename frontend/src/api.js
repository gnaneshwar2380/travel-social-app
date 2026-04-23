import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// ✅ REQUEST INTERCEPTOR
api.interceptors.request.use(
  (req) => {
    try {
      const stored = localStorage.getItem("authTokens");

      if (!stored) {
        console.warn("⚠️ No authTokens in localStorage");
        return req;
      }

      const authTokens = JSON.parse(stored);

      if (authTokens?.access) {
        req.headers.Authorization = `Bearer ${authTokens.access}`;
        console.log("✅ Authorization header added");
      } else {
        console.warn("⚠️ access token missing inside authTokens");
      }
    } catch (err) {
      console.error("❌ Error reading token:", err);
    }

    return req;
  },
  (error) => Promise.reject(error)
);

// ✅ RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("🚨 401 Unauthorized - Logging out");

      localStorage.removeItem("authTokens");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

//
// 🔥 AUTH APIs (FIXED)
//

// ✅ LOGIN
// ✅ LOGIN (FINAL CLEAN)
export const loginUser = async (credentials) => {
  try {
    const res = await api.post("/token/", credentials);

    // ✅ store tokens here ONLY
    localStorage.setItem("authTokens", JSON.stringify(res.data));

    console.log("✅ Stored in LS:", res.data);

    return res.data;
  } catch (err) {
    console.error("❌ Login error:", err.response?.data);
    throw err;
  }
};

// ✅ REGISTER (FIXED HERE)
export const registerUser = async (data) => {
  try {
    console.log("📤 Register payload:", data);

    const res = await api.post("/user/register/", data);

    console.log("✅ Register success:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ Register error:", err.response?.data);
    throw err;
  }
};

// ✅ REFRESH TOKEN
export const refreshToken = (refresh) =>
  api.post("/token/refresh/", { refresh });

//
// 🔐 PROTECTED APIs
//

export const getProfile = () => api.get("/profile/");
export const updateProfile = (formData) =>
  api.patch("/profile/", formData);

export const getAllPosts = () => api.get("/posts/");
export const createPost = (data) => api.post("/posts/", data);
export const getPostDetail = (id) => api.get(`/posts/${id}/`);

export const likePost = (id) =>
  api.post(`/posts/experience/${id}/like/`);

export const savePost = (id) =>
  api.post(`/posts/experience/${id}/save/`);

export const commentOnPost = (id, data) =>
  api.post(`/posts/experience/${id}/comments/`, data);

export const getSavedPosts = () => api.get("/saved/");
export const getForYouFeed = () => api.get("/posts/foryou/");
export const getFollowingFeed = () =>
  api.get("/posts/following/");

export const search = (query) =>
  api.get(`/search/?q=${query}`);

export const getMates = () => api.get("/follows/mates/");
export const followUser = (id) =>
  api.post(`/follows/${id}/toggle/`);

export const getMessages = () =>
  api.get("/messages/conversations/");

export const sendMessage = (data) =>
  api.post("/messages/", data);

export const joinTrip = (postId) =>
  api.post("/joinable-trips/", { post: postId });

export const approveJoinRequest = (id) =>
  api.post(`/joinable-trips/requests/${id}/approve/`);

export const getNotifications = () =>
  api.get("/notifications/");

export const markAllRead = () =>
  api.post("/notifications/mark_all_read/");

export default api;