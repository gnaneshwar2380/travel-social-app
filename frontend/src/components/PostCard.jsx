import React, { useState } from "react";
import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function PostCard({ post }) {
  const [likes, setLikes] = useState(post.total_likes ?? 0);
  const [liked, setLiked] = useState(post.is_liked ?? false);
  const [saved, setSaved] = useState(post.is_saved ?? false);
  const [loadingLike, setLoadingLike] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const navigate = useNavigate();

  const imageUrl = post.cover_image
    ? post.cover_image.startsWith("http")
      ? post.cover_image
      : `http://127.0.0.1:8000${post.cover_image}`
    : "/default-cover.jpg";

  const profileImage = post.author?.profile_pic
    ? `http://127.0.0.1:8000${post.author.profile_pic}`
    : "/default-avatar.png";

  const handleLike = async () => {
    if (loadingLike) return;
    setLoadingLike(true);
    try {
      const res = await api.post(`/posts/experience/${post.id}/like/`);
      setLiked(res.data.liked);
      setLikes(res.data.total_likes);
    } catch (err) {
      console.error("Error liking post:", err);
    } finally {
      setLoadingLike(false);
    }
  };

  const handleSave = async () => {
    if (loadingSave) return;
    setLoadingSave(true);
    try {
      const res = await api.post(`/posts/experience/${post.id}/save/`);
      setSaved(res.data.saved);
    } catch (err) {
      console.error("Error saving post:", err);
    } finally {
      setLoadingSave(false);
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/trip/${post.id}`;
    if (navigator.share) {
      navigator.share({ title: post.title, url: shareUrl });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <img
          src={profileImage}
          alt={post.author?.username}
          className="w-10 h-10 rounded-full object-cover cursor-pointer"
          onClick={() => navigate(`/user/${post.author?.username}`)}
        />
        <div>
          <p
            className="font-semibold text-sm cursor-pointer"
            onClick={() => navigate(`/user/${post.author?.username}`)}
          >
            @{post.author?.username}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(post.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="cursor-pointer" onClick={() => navigate(`/trip/${post.id}`)}>
        <img src={imageUrl} alt={post.title} className="w-full h-72 object-cover" />
      </div>

      <div className="px-4 py-3">
        <h3
          className="font-semibold text-base cursor-pointer"
          onClick={() => navigate(`/trip/${post.id}`)}
        >
          {post.title}
        </h3>

        <div className="flex items-center justify-between mt-4 text-gray-600">
          <button onClick={handleLike} className="flex items-center gap-1">
            <Heart size={20} className={liked ? "text-red-500 fill-red-500" : ""} />
            <span className="text-sm">{likes}</span>
          </button>

          <button
            onClick={() => navigate(`/trip/${post.id}`)}
            className="flex items-center gap-1"
          >
            <MessageCircle size={20} />
            <span className="text-sm">Comments</span>
          </button>

          <button onClick={handleShare} className="flex items-center gap-1">
            <Share2 size={20} />
            <span className="text-sm">Share</span>
          </button>

          <button onClick={handleSave}>
            <Bookmark size={20} className={saved ? "text-blue-600 fill-blue-600" : ""} />
          </button>
        </div>
      </div>
    </div>
  );
}

