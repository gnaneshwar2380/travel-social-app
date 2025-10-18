import React, { useState } from "react";
import api from "../api";

const PostCard = ({ post }) => {
  const [liked, setLiked] = useState(post.is_liked || false);
  const [saved, setSaved] = useState(post.is_saved || false);
  const [likesCount, setLikesCount] = useState(post.total_likes || 0);
  const [comments, setComments] = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  // ✅ Handle Like
  const handleLike = async () => {
    try {
      const res = await api.post(`/api/posts/${post.id}/like/`);
      setLiked(res.data.liked);
      setLikesCount(res.data.total_likes);
    } catch (err) {
      console.error("Like failed:", err);
    }
  };

  // ✅ Handle Save (updated to expect message, not saved)
  const handleSave = async () => {
    try {
      const res = await api.post(`/api/posts/${post.id}/save/`);
      // Backend returns {"message": "Post saved"} or {"message": "Post unsaved"}
      if (res.data.message === "Post saved") setSaved(true);
      else if (res.data.message === "Post unsaved") setSaved(false);
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  // ✅ Handle Comment
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const res = await api.post(`/api/posts/${post.id}/comment/`, {
        text: commentText,
      });
      setComments((prev) => [...prev, res.data]);
      setCommentText("");
    } catch (err) {
      console.error("Comment failed:", err);
    }
  };

  // ✅ Handle Share
  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/posts/${post.id}`);
    alert("Post link copied to clipboard!");
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border mb-5 transition-all duration-200 hover:shadow-md">
      {/* Cover Image */}
      {post.cover_photo && (
        <img
          src={`http://127.0.0.1:8000${post.cover_photo}`}
          alt={post.title}
          className="w-full h-56 object-cover rounded-t-lg"
        />
      )}

      {/* Post Info */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-800">{post.title}</h3>
        <p className="text-sm text-gray-500 mb-2">
          {likesCount} {likesCount === 1 ? "like" : "likes"}
        </p>

        {/* --- Action Buttons --- */}
        <div className="flex justify-between text-gray-700 text-sm border-t border-b py-2 mt-2 select-none">
          <button
            onClick={handleLike}
            className={`hover:text-black transition ${
              liked ? "font-semibold" : ""
            }`}
          >
            {liked ? "♥ Liked" : "♡ Like"}
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="hover:text-black"
          >
            💬 Comment
          </button>

          <button onClick={handleShare} className="hover:text-black">
            ↗ Share
          </button>

          <button
            onClick={handleSave}
            className={`hover:text-black transition ${
              saved ? "font-semibold" : ""
            }`}
          >
            {saved ? "🔖 Saved" : "📑 Save"}
          </button>
        </div>

        {/* --- Comments Section --- */}
        {showComments && (
          <div className="mt-3 border-t pt-2">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-sm">No comments yet.</p>
            ) : (
              <div className="space-y-1 mb-2 max-h-32 overflow-y-auto">
                {comments.map((c) => (
                  <p key={c.id || Math.random()} className="text-sm">
                    <strong>{c.username}</strong> {c.text}
                  </p>
                ))}
              </div>
            )}

            <form onSubmit={handleCommentSubmit} className="flex space-x-2 mt-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="border rounded p-1 flex-1 text-sm focus:outline-none focus:ring focus:ring-gray-200"
              />
              <button
                type="submit"
                className="text-gray-700 text-sm font-medium hover:text-black"
              >
                Post
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;
