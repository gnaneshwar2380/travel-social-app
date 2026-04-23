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
        return req; // ✅ no warning needed
      }

      const authTokens = JSON.parse(stored);

      if (authTokens?.access) {
        req.headers.Authorization = `Bearer ${authTokens.access}`;
      }
    } catch (err) {
      console.error("Token error:", err);
    }

    return req;
  },
  (error) => Promise.reject(error)
);

// ✅ RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authTokens");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ✅ LOGIN
export const loginUser = async (credentials) => {
  try {
    const res = await api.post("/token/", credentials);

    localStorage.setItem("authTokens", JSON.stringify(res.data));

    return res.data;
  } catch (err) {
    console.error("Login error:", err.response?.data);
    throw err;
  }
};

// ✅ REGISTER
export const registerUser = async (data) => {
  try {
    const res = await api.post("/user/register/", data);
    return res.data;
  } catch (err) {
    console.error("Register error:", err.response?.data);
    throw err;
  }
};

export default api;