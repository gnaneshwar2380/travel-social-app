
const API_BASE = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace("/api", "")
    : "http://127.0.0.1:8000";

export const getMediaUrl = (path) => {
    if (!path) return "/default-avatar.png";
    if (path.startsWith("http")) return path;
    const base = import.meta.env.VITE_API_URL
        ? import.meta.env.VITE_API_URL.replace("/api", "")
        : "http://127.0.0.1:8000";
    return `${base}${path}`;
};

