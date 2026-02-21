import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

export default function TripDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [days, setDays] = useState([]);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const fetchTripData = async () => {
      try {
        const resPost = await api.get(`/posts/${id}/`);
        setPost(resPost.data);
        setLiked(resPost.data.is_liked);
        setSaved(resPost.data.is_saved);

        const resDays = await api.get(`/posts/${id}/days/`);
        setDays(resDays.data);

        const resComments = await api.get(`/posts/experience/${id}/comments/`);
        setComments(resComments.data);
      } catch (error) {
        console.error("Error fetching trip details:", error);
      }
    };
    fetchTripData();
  }, [id]);

  const handleLike = async () => {
    try {
      const res = await api.post(`/posts/experience/${id}/like/`);
      setLiked(res.data.liked);
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const handleSave = async () => {
    try {
      const res = await api.post(`/posts/experience/${id}/save/`);
      setSaved(res.data.saved);
    } catch (err) {
      console.error("Error saving post:", err);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await api.post(`/posts/experience/${id}/comments/`, { text: newComment });
      setComments((prev) => [res.data, ...prev]);
      setNewComment("");
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  if (!post) return <div className="text-center py-10">Loading trip...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-20">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {post.cover_image && (
          <img
            src={`http://127.0.0.1:8000${post.cover_image}`}
            alt={post.title}
            className="w-full h-72 object-cover"
          />
        )}
        <div className="p-5">
          <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>
          <p className="text-gray-500 mt-1">
            {new Date(post.created_at).toLocaleDateString()}
          </p>

          <div className="flex items-center space-x-4 mt-4">
            <button onClick={handleLike} className="text-xl">
              {liked ? "❤️ Liked" : "🤍 Like"}
            </button>
            <button onClick={handleSave} className="text-xl">
              {saved ? "🔖 Saved" : "📑 Save"}
            </button>
            <button
              onClick={() => navigator.share({ title: post.title, url: window.location.href })}
              className="text-xl"
            >
              🔗 Share
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-10">
        {days.map((day) => (
          <div key={day.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-5 border-b">
              <h2 className="text-2xl font-semibold text-gray-800">
                Day {day.day_number}{day.location_name ? `: ${day.location_name}` : ""}
              </h2>
              {day.date && (
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(day.date).toLocaleDateString()}
                </p>
              )}
              <p className="mt-3 text-gray-700 leading-relaxed">{day.description}</p>
            </div>

            {day.photos?.length > 0 && (
              <div className="bg-gray-50">
                <Swiper spaceBetween={8} slidesPerView={1}>
                  {day.photos.map((photo) => (
                    <SwiperSlide key={photo.id}>
                      <img
                        src={`http://127.0.0.1:8000${photo.image}`}
                        alt={photo.caption || "Day photo"}
                        className="w-full h-96 object-cover"
                      />
                      {photo.caption && (
                        <p className="text-center text-sm text-gray-600 py-2">{photo.caption}</p>
                      )}
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-10 bg-white p-5 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Comments</h3>
        <form onSubmit={handleComment} className="flex space-x-2 mb-4">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-grow border border-gray-300 rounded-lg px-3 py-2"
          />
          <button
            type="submit"
            className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600"
          >
            Post
          </button>
        </form>

        {comments.length > 0 ? (
          <ul className="space-y-3">
            {comments.map((comment) => (
              <li key={comment.id} className="border-b pb-2">
                <p className="text-gray-800">
                  <strong>{comment.user?.username}</strong>: {comment.text}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(comment.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No comments yet.</p>
        )}
      </div>
    </div>
  );
}
