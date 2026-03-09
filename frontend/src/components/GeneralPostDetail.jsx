import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { Heart, Bookmark, ArrowLeft, Send, MoreVertical, Trash2 } from "lucide-react";

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
    const [showMenu, setShowMenu] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editDescription, setEditDescription] = useState("");
    const [saving, setSaving] = useState(false);

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
                setEditDescription(postRes.data.description);
                setComments(commentsRes.data);
            } catch (err) {
                console.error("Error loading post:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const isOwner = currentUser?.id === post?.author?.id;

    const handleLike = async () => {
        try {
            const res = await api.post(`/posts/general/${id}/like/`);
            setLiked(res.data.liked);
            setLikes(res.data.total_likes);
        } catch (err) { console.error(err); }
    };

    const handleSave = async () => {
        try {
            const res = await api.post(`/posts/general/${id}/save/`);
            setSaved(res.data.saved);
        } catch (err) { console.error(err); }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            const res = await api.post(`/posts/general/${id}/comments/`, { text: newComment });
            setComments(prev => [res.data, ...prev]);
            setNewComment("");
        } catch (err) { console.error(err); }
    };

    const handleDelete = async () => {
        if (!window.confirm("Delete this post?")) return;
        try {
            await api.delete(`/general-posts/${id}/edit/`);
            navigate("/");
        } catch (err) { console.error(err); }
    };

    const handleSaveEdit = async () => {
        setSaving(true);
        try {
            const res = await api.patch(`/general-posts/${id}/edit/`, { description: editDescription });
            setPost(res.data);
            setEditing(false);
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
    };

    const getProfilePic = (pic) => {
        if (!pic) return "/default-avatar.png";
        return getMediaUrl(pic);
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

    if (!post) return <div className="text-center py-20 text-gray-500">Post not found.</div>;

    const author = post.author;

    return (
        <div className="max-w-2xl mx-auto pb-24">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white border-b px-4 py-3 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-1">
                    <ArrowLeft size={22} className="text-gray-700" />
                </button>
                <img src={getProfilePic(author?.profile_pic)} alt={author?.username}
                    className="w-8 h-8 rounded-full object-cover cursor-pointer"
                    onClick={() => navigate(`/user/${author?.username}`)} />
                <div className="flex-1">
                    <p className="font-semibold text-sm cursor-pointer"
                        onClick={() => navigate(`/user/${author?.username}`)}>
                        @{author?.username}
                    </p>
                    <p className="text-xs text-gray-400">{new Date(post.created_at).toLocaleDateString()}</p>
                </div>
                <button onClick={handleSave}>
                    <Bookmark size={22} className={saved ? "text-blue-600 fill-blue-600" : "text-gray-500"} />
                </button>
                {isOwner && (
                    <div className="relative">
                        <button onClick={() => setShowMenu(!showMenu)} className="p-1 rounded-full hover:bg-gray-100">
                            <MoreVertical size={20} className="text-gray-500" />
                        </button>
                        {showMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                                <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border z-50 w-36 overflow-hidden">
                                    <button onClick={() => { setEditing(true); setShowMenu(false); }}
                                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                                        ✏️ Edit
                                    </button>
                                    <button onClick={handleDelete}
                                        className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2">
                                        <Trash2 size={14} /> Delete
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Images */}
            {post.images?.length > 0 && (
                <div>
                    <img src={getImage(post.images[activeImage]?.image)} alt="Post"
                        className="w-full object-cover max-h-96" />
                    {post.images.length > 1 && (
                        <div className="flex gap-2 px-4 py-2 overflow-x-auto">
                            {post.images.map((img, i) => (
                                <img key={img.id} src={getImage(img.image)} alt=""
                                    onClick={() => setActiveImage(i)}
                                    className={`w-16 h-16 object-cover rounded-lg cursor-pointer flex-shrink-0 ${activeImage === i ? "ring-2 ring-teal-500" : "opacity-70"}`} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Description / Edit */}
            <div className="px-4 py-4">
                {editing ? (
                    <div className="space-y-3">
                        <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            rows={4}
                            className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-400"
                        />
                        <div className="flex gap-2">
                            <button onClick={() => setEditing(false)}
                                className="flex-1 py-2 rounded-full border text-gray-600 text-sm font-semibold">
                                Cancel
                            </button>
                            <button onClick={handleSaveEdit} disabled={saving}
                                className="flex-1 py-2 rounded-full bg-teal-500 text-white text-sm font-semibold">
                                {saving ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-800 text-base leading-relaxed">{post.description}</p>
                )}

                <div className="flex items-center gap-6 mt-4 pt-4 border-t">
                    <button onClick={handleLike} className="flex items-center gap-2">
                        <Heart size={24} className={liked ? "text-red-500 fill-red-500" : "text-gray-500"} />
                        <span className="text-sm font-medium">{likes} likes</span>
                    </button>
                    <span className="text-sm text-gray-400">{comments.length} comments</span>
                </div>
            </div>

            {/* Comments */}
            <div className="px-4 pb-4">
                <h3 className="font-bold text-gray-800 mb-3">Comments</h3>
                <form onSubmit={handleComment} className="flex gap-2 mb-4">
                    <img src={getProfilePic(currentUser?.profile_pic)} alt=""
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                    <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 gap-2">
                        <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="flex-1 bg-transparent outline-none text-sm py-2" />
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
                            <img src={getProfilePic(comment.user?.profile_pic)} alt={comment.user?.username}
                                className="w-8 h-8 rounded-full object-cover flex-shrink-0 cursor-pointer"
                                onClick={() => navigate(`/user/${comment.user?.username}`)} />
                            <div className="flex-1 bg-gray-50 rounded-2xl px-4 py-2">
                                <p className="font-semibold text-xs text-gray-700 mb-1">@{comment.user?.username}</p>
                                <p className="text-sm text-gray-800">{comment.text}</p>
                                <p className="text-xs text-gray-400 mt-1">{new Date(comment.created_at).toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}