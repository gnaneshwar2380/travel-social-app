const API_BASE = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace("/api", "")
    : "http://127.0.0.1:8000";

export const getMediaUrl = (path) => {
  if (!path) return "";

  // already full URL
  if (path.startsWith("http")) return path;

  const backendURL = "https://your-backend-name.onrender.com"; 

  return `${backendURL}${path}`;
};