import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";

export default function GeneralPostDetail() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await api.get(`/general-posts/${id}/`);
                setPost(res.data);
                const commentsRes = await api.get(`/posts/general/${id}/comments/`);
                setComments(commentsRes.data);
            } catch (err) {
                console.error("Error loading post:", err);
            }
        };
        fetchPost();
    }, [id]);

    const handleComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            const res = await api.post(`/posts/general/${id}/comments/`, { text: newComment });
            setComments((prev) => [res.data, ...prev]);
            setNewComment("");
        } catch (err) {
            console.error("Error posting comment:", err);
        }
    };

    if (!post) return <div className="text-center py-10">Loading post...</div>;

    const authorProfilePic = post.author?.profile_pic
        ? post.author.profile_pic.startsWith("http")
            ? post.author.profile_pic
            : `http://127.0.0.1:8000${post.author.profile_pic}`
        : "/default-avatar.png";

    return (
        <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
            <div className="bg-white rounded-xl shadow overflow-hidden mb-6">
                <div className="flex items-center gap-3 p-4">
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

                <p className="px-4 pb-4 text-gray-700 leading-relaxed">{post.description}</p>

                {post.images?.length > 0 && (
                    <div className="grid grid-cols-2 gap-1 px-4 pb-4">
                        {post.images.map((img) => (
                            <img
                                key={img.id}
                                src={`http://127.0.0.1:8000${img.image}`}
                                alt="Post"
                                className="w-full h-48 object-cover rounded-lg"
                            />
                        ))}
                    </div>
                )}
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