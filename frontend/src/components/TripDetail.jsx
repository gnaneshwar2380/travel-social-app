import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

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

    const coverImageUrl = post.cover_image
        ? post.cover_image.startsWith("http")
            ? post.cover_image
            : `http://127.0.0.1:8000${post.cover_image}`
        : null;

    const authorProfilePic = post.author?.profile_pic
    ? post.author.profile_pic.startsWith("http")
        ? post.author.profile_pic
        : `http://127.0.0.1:8000${post.author.profile_pic}`
    : "/default-avatar.png";

    return (
        <div className="max-w-3xl mx-auto px-4 py-6 pb-24">
            <div className="bg-white rounded-xl shadow overflow-hidden mb-6">
                {coverImageUrl && (
                    <img
                        src={coverImageUrl}
                        alt={post.title}
                        className="w-full h-72 object-cover"
                    />
                )}
                <div className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                        <img
                            src={authorProfilePic}
                            alt={post.author?.username}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                            <p className="font-semibold">@{post.author?.username}</p>
                            <p className="text-xs text-gray-400">
                                {new Date(post.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>

                    <div className="flex items-center gap-6 mt-4 pt-4 border-t">
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-1 text-sm font-medium ${liked ? "text-red-500" : "text-gray-500"}`}
                        >
                            {liked ? "❤️" : "🤍"} Like
                        </button>
                        <button
                            onClick={handleSave}
                            className={`flex items-center gap-1 text-sm font-medium ${saved ? "text-blue-500" : "text-gray-500"}`}
                        >
                            {saved ? "🔖" : "📑"} Save
                        </button>
                        <button
                            onClick={() => navigator.share?.({ title: post.title, url: window.location.href })}
                            className="flex items-center gap-1 text-sm font-medium text-gray-500"
                        >
                            🔗 Share
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-8 mb-8">
                {days.length === 0 && (
                    <p className="text-center text-gray-400">No days added yet.</p>
                )}
                {days.map((day) => (
                    <div key={day.id} className="bg-white rounded-xl shadow overflow-hidden">
                        <div className="p-5 border-b">
                            <h2 className="text-xl font-bold text-gray-800">
                                Day {day.day_number}{day.location_name ? `: ${day.location_name}` : ""}
                            </h2>
                            {day.date && (
                                <p className="text-sm text-gray-400 mt-1">
                                    {new Date(day.date).toLocaleDateString()}
                                </p>
                            )}
                            <p className="mt-3 text-gray-700 leading-relaxed">{day.description}</p>
                        </div>

                        {day.photos?.length > 0 && (
                            <Swiper
                                modules={[Navigation, Pagination]}
                                navigation
                                pagination={{ clickable: true }}
                                spaceBetween={0}
                                slidesPerView={1}
                            >
                                {day.photos.map((photo) => (
                                    <SwiperSlide key={photo.id}>
                                        <div className="relative">
                                            <img
                                                src={`http://127.0.0.1:8000${photo.image}`}
                                                alt={photo.caption || "Day photo"}
                                                className="w-full h-80 object-cover"
                                            />
                                            {photo.caption && (
                                                <p className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-40 text-white text-sm text-center py-2">
                                                    {photo.caption}
                                                </p>
                                            )}
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        )}
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow p-5">
                <h3 className="text-lg font-bold mb-4">Comments</h3>
                <form onSubmit={handleComment} className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-grow border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-teal-500"
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
                                    <strong>@{comment.user?.username}</strong>: {comment.text}
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
