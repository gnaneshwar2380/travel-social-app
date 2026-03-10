import React, { useState, useEffect } from "react";
import { Heart, MessageCircle, Share2, Bookmark, MoreVertical, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { getMediaUrl } from "../utils";

export default function PostCard({ post, onDelete }) {
    const [likes, setLikes] = useState(post.total_likes ?? 0);
    const [liked, setLiked] = useState(post.is_liked ?? false);
    const [saved, setSaved] = useState(post.is_saved ?? false);
    const [loadingLike, setLoadingLike] = useState(false);
    const [loadingSave, setLoadingSave] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const navigate = useNavigate();

    const postType = post.post_type || 'experience';
    const author = post.author || post.creator;

    useEffect(() => {
        try {
            const tokens = localStorage.getItem('authTokens');
            if (tokens) {
                const parsed = JSON.parse(tokens);
                const payload = JSON.parse(atob(parsed.access.split('.')[1]));
                setCurrentUserId(payload.user_id);
            }
        } catch (e) { console.error(e); }
    }, []);

    const isOwner = currentUserId && author?.id === Number(currentUserId);

    const rawImage = post.cover_image || post.images?.[0]?.image || null;
    const imageUrl = rawImage ? getMediaUrl(rawImage) : null;
    const profileImage = getMediaUrl(author?.profile_pic);
    const title = post.title || post.destination || post.description?.slice(0, 60);

    const navigateToPost = () => {
        if (postType === 'joinable') navigate(`/joinable-trip/${post.id}`);
        else if (postType === 'general') navigate(`/general-post/${post.id}`);
        else navigate(`/trip/${post.id}`);
    };

    const handleLike = async () => {
        if (loadingLike) return;
        setLoadingLike(true);
        try {
            const res = await api.post(`/posts/${postType}/${post.id}/like/`);
            setLiked(res.data.liked);
            setLikes(res.data.total_likes);
        } catch (err) { console.error("Error liking post:", err); }
        finally { setLoadingLike(false); }
    };

    const handleSave = async () => {
        if (loadingSave) return;
        setLoadingSave(true);
        try {
            const res = await api.post(`/posts/${postType}/${post.id}/save/`);
            setSaved(res.data.saved);
        } catch (err) { console.error("Error saving post:", err); }
        finally { setLoadingSave(false); }
    };

    const handleShare = () => {
        const shareUrl = postType === 'joinable'
            ? `${window.location.origin}/joinable-trip/${post.id}`
            : `${window.location.origin}/trip/${post.id}`;
        if (navigator.share) navigator.share({ title, url: shareUrl });
        else { navigator.clipboard.writeText(shareUrl); alert("Link copied!"); }
    };

    const handleDelete = async () => {
        if (!window.confirm("Delete this post?")) return;
        setDeleting(true);
        try {
            const endpoint = postType === 'general' ? `/general-posts/${post.id}/edit/`
                : postType === 'joinable' ? `/joinable-trips/${post.id}/edit/`
                : `/posts/${post.id}/edit/`;
            await api.delete(endpoint);
            if (onDelete) onDelete(post.id, postType);
        } catch (err) { console.error("Error deleting:", err); }
        finally { setDeleting(false); setShowMenu(false); }
    };

    const handleEdit = () => {
        setShowMenu(false);
        if (postType === 'general') navigate(`/general-post/${post.id}/edit`);
        else if (postType === 'joinable') navigate(`/joinable-trip/${post.id}/edit`);
        else navigate(`/trip/${post.id}/edit`);
    };

    const postTypeLabel = {
        experience: { label: 'Experience', color: 'bg-teal-500' },
        joinable: { label: 'Joinable Trip', color: 'bg-blue-500' },
        general: { label: 'General', color: 'bg-purple-500' },
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3">
                <img src={profileImage} alt={author?.username || "User"}
                    className="w-10 h-10 rounded-full object-cover cursor-pointer"
                    onClick={() => navigate(`/user/${author?.username}`)} />
                <div className="flex-1">
                    <p className="font-semibold text-sm cursor-pointer"
                        onClick={() => navigate(`/user/${author?.username}`)}>
                        @{author?.username}
                    </p>
                    <p className="text-xs text-gray-500">{new Date(post.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs text-white px-2 py-1 rounded-full ${postTypeLabel[postType]?.color}`}>
                    {postTypeLabel[postType]?.label}
                </span>
                {isOwner && (
                    <div className="relative">
                        <button onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                            className="p-1 rounded-full hover:bg-gray-100">
                            <MoreVertical size={18} className="text-gray-500" />
                        </button>
                        {showMenu && (
                            <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border z-50 w-36 overflow-hidden">
                                <button onClick={handleEdit}
                                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                    ✏️ Edit
                                </button>
                                <button onClick={handleDelete} disabled={deleting}
                                    className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2">
                                    <Trash2 size={14} /> {deleting ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="cursor-pointer bg-gray-100 min-h-48" onClick={navigateToPost}>
                {imageUrl ? (
                    <img src={imageUrl} alt={title} className="w-full h-64 object-cover" />
                ) : (
                    <div className="w-full h-64 bg-gradient-to-br from-blue-400 to-teal-500 flex items-center justify-center">
                        <p className="text-white font-bold text-xl">✈️ {title}</p>
                    </div>
                )}
            </div>

            <div className="px-4 py-3">
                <h3 className="font-semibold text-base cursor-pointer" onClick={navigateToPost}>{title}</h3>
                {postType === 'joinable' && (
                    <div className="flex gap-3 mt-2 text-xs text-gray-500">
                        <span>📍 {post.destination}</span>
                        <span>💰 ₹{post.budget}</span>
                        <span>👥 {post.max_members} spots</span>
                    </div>
                )}
                <div className="flex items-center justify-between mt-4 text-gray-600">
                    <button onClick={handleLike} className="flex items-center gap-1">
                        <Heart size={20} className={liked ? "text-red-500 fill-red-500" : ""} />
                        <span className="text-sm">{likes}</span>
                    </button>
                    <button onClick={navigateToPost} className="flex items-center gap-1">
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

            {showMenu && (
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
            )}
        </div>
    );
}