import React, { useState } from "react";
import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import api from "../api";

export default function PostCard({ post, onClickImageOrTitle }) {
  const [likes, setLikes] = useState(post.total_likes ?? 0);
  const [liked, setLiked] = useState(post.is_liked ?? false);
  const [saved, setSaved] = useState(post.is_saved ?? false);
  const [loadingLike, setLoadingLike] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);

  const imageUrl = post.cover_photo
    ? post.cover_photo.startsWith("http")
      ? post.cover_photo
      : `http://127.0.0.1:8000${post.cover_photo}`
    : "/default-cover.jpg";

  /*const profileImage = post.author_profile_picture
    ? `http://127.0.0.1:8000${post.author_profile_picture}`
    : "/default-avatar.png";*/

  const handleLike = async () => {
    if (loadingLike) return;
    setLoadingLike(true);

    try {
      const res = await api.post(`/api/posts/${post.id}/like/`);
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
      const res = await api.post(`/api/posts/${post.id}/save/`);
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
      navigator.share({
        title: post.title,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <img
          src={profileImage}
          alt={post.author}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold text-sm">@{post.author}</p>
          <p className="text-xs text-gray-500">
            {new Date(post.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Image */}
      <div className="cursor-pointer" onClick={onClickImageOrTitle}>
        <img
          src={imageUrl}
          alt={post.title}
          className="w-full h-72 object-cover"
        />
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        <h3
          className="font-semibold text-base cursor-pointer"
          onClick={onClickImageOrTitle}
        >
          {post.title}
        </h3>

        {post.location_summary && (
          <p className="text-sm text-gray-500 mt-1">
            {post.location_summary}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-4 text-gray-600">
          <button
            onClick={handleLike}
            className="flex items-center gap-1"
          >
            <Heart
              size={20}
              className={liked ? "text-red-500 fill-red-500" : ""}
            />
            <span className="text-sm">{likes}</span>
          </button>

          <button
            onClick={onClickImageOrTitle}
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
            <Bookmark
              size={20}
              className={saved ? "text-blue-600 fill-blue-600" : ""}
            />
          </button>
        </div>
      </div>
    </div>
  );
}


