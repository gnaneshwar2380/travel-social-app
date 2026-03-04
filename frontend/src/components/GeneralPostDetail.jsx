import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { Heart, Bookmark, ArrowLeft, Send } from "lucide-react";

export default function GeneralPostDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [liked, setLiked] = useState(false);
    const [likes, setLikes] = useState(0);
    const [saved, setSaved] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [postRes, userRes, commentsRes] = await Promise.all([
                    api.get(`/general-posts/${id}/`),
                    api.get("/profile/"),
                    api.get(`/posts/general/${id}/comments/`),
                ]);
                setPost(postRes.data);
                setCurrentUser(userRes.data);
                setLiked(postRes.data.is_liked);
                setLikes(postRes.data.total_likes);
                setSaved(postRes.data.is_saved);
                setComments(commentsRes.data);
            } catch (err) {
                console.error("Error loading post:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleLike = async () => {
        try {
            const res = await api.post(`/posts/general/${id}/like/`);
            setLiked(res.data.liked);
            setLikes(res.data.total_likes);
        } catch (err) {
            console.error("Error liking:", err);
        }
    };

    const handleSave = async () => {
        try {
            const res = await api.post(`/posts/general/${id}/save/`);
            setSaved(res.data.saved);
        } catch (err) {
            console.error("Error saving:", err);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            const res = await api.post(`/posts/general/${id}/comments/`, { text: newComment });
            setComments(prev => [res.data, ...prev]);
            setNewComment("");
        } catch (err) {
            console.error("Error commenting:", err);
        }
    };

    const getProfilePic = (pic) => {
        if (!pic) return "/default-avatar.png";
        return pic.startsWith("http") ? pic : `http://127.0.0.1:8000${pic}`;
    };

    const getImage = (img) => {
        if (!img) return null;
        return img.startsWith("http") ? img : `http://127.0.0.1:8000${img}`;
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!post) return (
        <div className="text-center py-20 text-gray-500">Post not found.</div>
    );

    const author = post.author;

    return (
        <div className="max-w-2xl mx-auto pb-24">
            <div className="sticky top-0 z-40 bg-white border-b px-4 py-3 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-1">
                    <ArrowLeft size={22} className="text-gray-700" />
                </button>
                <img
                    src={getProfilePic(author?.profile_pic)}
                    alt={author?.username}
                    className="w-8 h-8 rounded-full object-cover cursor-pointer"
                    onClick={() => navigate(`/user/${author?.username}`)}
                />
                <div className="flex-1">
                    <p
                        className="font-semibold text-sm cursor-pointer"
                        onClick={() => navigate(`/user/${author?.username}`)}
                    >
                        @{author?.username}
                    </p>
                    <p className="text-xs text-gray-400">
                        {new Date(post.created_at).toLocaleDateString()}
                    </p>
                </div>
                <button onClick={handleSave}>
                    <Bookmark
                        size={22}
                        className={saved ? "text-blue-600 fill-blue-600" : "text-gray-500"}
                    />
                </button>
            </div>

            {post.images?.length > 0 && (
                <div>
                    <img
                        src={getImage(post.images[activeImage]?.image)}
                        alt="Post"
                        className="w-full object-cover max-h-96"
                    />
                    {post.images.length > 1 && (
                        <div className="flex gap-2 px-4 py-2 overflow-x-auto">
                            {post.images.map((img, i) => (
                                <img
                                    key={img.id}
                                    src={getImage(img.image)}
                                    alt=""
                                    onClick={() => setActiveImage(i)}
                                    className={`w-16 h-16 object-cover rounded-lg cursor-pointer flex-shrink-0 ${
                                        activeImage === i ? "ring-2 ring-teal-500" : "opacity-70"
                                    }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="px-4 py-4">
                <p className="text-gray-800 text-base leading-relaxed">{post.description}</p>

                <div className="flex items-center gap-6 mt-4 pt-4 border-t">
                    <button onClick={handleLike} className="flex items-center gap-2">
                        <Heart
                            size={24}
                            className={liked ? "text-red-500 fill-red-500" : "text-gray-500"}
                        />
                        <span className="text-sm font-medium">{likes} likes</span>
                    </button>
                    <span className="text-sm text-gray-400">{comments.length} comments</span>
                </div>
            </div>

            <div className="px-4 pb-4">
                <h3 className="font-bold text-gray-800 mb-3">Comments</h3>
                <form onSubmit={handleComment} className="flex gap-2 mb-4">
                    <img
                        src={getProfilePic(currentUser?.profile_pic)}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 gap-2">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="flex-1 bg-transparent outline-none text-sm py-2"
                        />
                        <button type="submit" disabled={!newComment.trim()}>
                            <Send size={16} className={newComment.trim() ? "text-teal-500" : "text-gray-300"} />
                        </button>
                    </div>
                </form>

                <div className="space-y-4">
                    {comments.length === 0 && (
                        <p className="text-center text-gray-400 text-sm py-4">No comments yet. Be the first!</p>
                    )}
                    {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                            <img
                                src={getProfilePic(comment.user?.profile_pic)}
                                alt={comment.user?.username}
                                className="w-8 h-8 rounded-full object-cover flex-shrink-0 cursor-pointer"
                                onClick={() => navigate(`/user/${comment.user?.username}`)}
                            />
                            <div className="flex-1 bg-gray-50 rounded-2xl px-4 py-2">
                                <p className="font-semibold text-xs text-gray-700 mb-1">
                                    @{comment.user?.username}
                                </p>
                                <p className="text-sm text-gray-800">{comment.text}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {new Date(comment.created_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}