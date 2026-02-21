import React from "react";
import api from "../api";
import { Heart, MapPin } from "lucide-react";

export default function ExperiencePostCard({ post }) {
  const handleLike = async () => {
    try {
      await api.post(`/experience-posts/${post.id}/like/`);
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-2xl p-4 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <img
          src="/default-avatar.png"
          alt="author"
          className="w-8 h-8 rounded-full"
        />
        <span className="font-semibold">@{post.author_username}</span>
      </div>

      <p className="text-gray-800 mb-2">{post.content}</p>

      {post.image && (
        <img
          src={`http://127.0.0.1:8000${post.image}`}
          alt="experience"
          className="rounded-xl mb-2"
        />
      )}

      {post.location && (
        <div className="text-gray-500 text-sm flex items-center gap-1 mb-2">
          <MapPin size={14} />
          {post.location}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button onClick={handleLike} className="flex items-center gap-1 text-red-500">
          <Heart size={18} /> {post.total_likes}
        </button>
      </div>
    </div>
  );
}
