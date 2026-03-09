import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { MoreVertical, Trash2 } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function JoinableTripDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [trip, setTrip] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [joinStatus, setJoinStatus] = useState(null);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [showMenu, setShowMenu] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tripRes, userRes] = await Promise.all([
                    api.get(`/joinable-trips/${id}/`),
                    api.get("/profile/"),
                ]);
                setTrip(tripRes.data);
                setCurrentUser(userRes.data);
                setEditData({
                    title: tripRes.data.title,
                    destination: tripRes.data.destination,
                    budget: tripRes.data.budget,
                    details: tripRes.data.details,
                    start_date: tripRes.data.start_date,
                    end_date: tripRes.data.end_date,
                    min_members: tripRes.data.min_members,
                    max_members: tripRes.data.max_members,
                });
                const commentsRes = await api.get(`/posts/joinable/${id}/comments/`);
                setComments(commentsRes.data);
                const isCreator = tripRes.data.creator.id === userRes.data.id;
                if (isCreator) {
                    const requestsRes = await api.get(`/joinable-trips/${id}/requests/`);
                    setPendingRequests(requestsRes.data);
                } else {
                    try {
                        const statusRes = await api.get(`/joinable-trips/${id}/my-request/`);
                        if (statusRes.data?.status) setJoinStatus(statusRes.data.status);
                    } catch (e) { 
                        print(e)
                        setJoinStatus(null); }
                }
            } catch (err) {
                console.error("Error loading trip:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleInterest = async () => {
        try {
            const res = await api.post(`/joinable-trips/${id}/interest/`);
            setJoinStatus(res.data.status || "pending");
        } catch (err) {
            if (err.response?.data?.status) setJoinStatus(err.response.data.status);
        }
    };

    const handleAccept = async (requestId) => {
        try {
            await api.post(`/joinable-trips/requests/${requestId}/accept/`);
            setPendingRequests(prev => prev.filter(r => r.id !== requestId));
        } catch (err) { console.error(err); }
    };

    const handleReject = async (requestId) => {
        try {
            await api.patch(`/joinable-trips/requests/${requestId}/reject/`);
            setPendingRequests(prev => prev.filter(r => r.id !== requestId));
        } catch (err) { console.error(err); }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            const res = await api.post(`/posts/joinable/${id}/comments/`, { text: newComment });
            setComments(prev => [res.data, ...prev]);
            setNewComment("");
        } catch (err) { console.error(err); }
    };

    const handleDelete = async () => {
        if (!window.confirm("Delete this trip?")) return;
        try {
            await api.delete(`/joinable-trips/${id}/edit/`);
            navigate("/");
        } catch (err) { console.error(err); }
    };

    const handleSaveEdit = async () => {
        setSaving(true);
        try {
            const res = await api.patch(`/joinable-trips/${id}/edit/`, editData);
            setTrip(res.data);
            setEditing(false);
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
    };

    if (loading) return <div className="text-center py-10">Loading trip...</div>;
    if (!trip) return <div className="text-center py-10">Trip not found.</div>;

    const isCreator = currentUser?.id === trip.creator.id;

    const getProfilePic = (pic) => {
        if (!pic) return "/default-avatar.png";
        return pic.startsWith("http") ? pic : `http://127.0.0.1:8000${pic}`;
    };

    const statusColors = {
        planning: "bg-yellow-100 text-yellow-700",
        full: "bg-red-100 text-red-700",
        ongoing: "bg-green-100 text-green-700",
        completed: "bg-gray-100 text-gray-700",
    };

    const renderJoinButton = () => {
        if (joinStatus === "accepted") return (
            <button onClick={() => navigate(`/group-chat/${trip.group_id}`)}
                className="w-full py-3 rounded-xl font-bold text-white bg-green-500">✅ Go to Trip Chat</button>
        );
        if (joinStatus === "pending") return (
            <button disabled className="w-full py-3 rounded-xl font-bold text-white bg-yellow-500 cursor-not-allowed">⏳ Request Pending</button>
        );
        if (joinStatus === "rejected") return (
            <button disabled className="w-full py-3 rounded-xl font-bold text-white bg-gray-400 cursor-not-allowed">❌ Request Declined</button>
        );
        return (
            <button onClick={handleInterest} className="w-full py-3 rounded-xl font-bold text-white bg-blue-500">🙋 I'm Interested</button>
        );
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-6 pb-24">
            {trip.images?.length > 0 && (
                <Swiper modules={[Navigation, Pagination]} navigation pagination={{ clickable: true }}
                    className="rounded-xl overflow-hidden mb-6">
                    {trip.images.map((img) => (
                        <SwiperSlide key={img.id}>
                            <img src={getProfilePic(img.image)} alt="Trip" className="w-full h-72 object-cover" />
                        </SwiperSlide>
                    ))}
                </Swiper>
            )}

            <div className="bg-white rounded-xl shadow p-6 mb-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900">{trip.title}</h1>
                        <p className="text-gray-500 mt-1">{trip.destination}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[trip.status] || 'bg-gray-100 text-gray-700'}`}>
                            {trip.status}
                        </span>
                        {isCreator && (
                            <div className="relative">
                                <button onClick={() => setShowMenu(!showMenu)}
                                    className="p-1 rounded-full hover:bg-gray-100">
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
                </div>

                {/* Edit Form */}
                {editing ? (
                    <div className="mt-4 space-y-3">
                        <div>
                            <label className="text-xs font-medium text-gray-500">Title</label>
                            <input value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})}
                                className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-blue-400" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500">Destination</label>
                            <input value={editData.destination} onChange={e => setEditData({...editData, destination: e.target.value})}
                                className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-blue-400" />
                        </div>
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="text-xs font-medium text-gray-500">Budget (₹)</label>
                                <input type="number" value={editData.budget} onChange={e => setEditData({...editData, budget: e.target.value})}
                                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-blue-400" />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs font-medium text-gray-500">Max Members</label>
                                <input type="number" value={editData.max_members} onChange={e => setEditData({...editData, max_members: e.target.value})}
                                    className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-blue-400" />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500">Details</label>
                            <textarea rows={3} value={editData.details} onChange={e => setEditData({...editData, details: e.target.value})}
                                className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-blue-400" />
                        </div>
                        <div className="flex gap-2 mt-2">
                            <button onClick={() => setEditing(false)}
                                className="flex-1 py-2 rounded-full border text-gray-600 text-sm font-semibold">Cancel</button>
                            <button onClick={handleSaveEdit} disabled={saving}
                                className="flex-1 py-2 rounded-full bg-blue-500 text-white text-sm font-semibold">
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-4 mt-4 text-sm text-gray-600">
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-400 mb-1">Budget</p>
                                <p className="font-semibold text-gray-800">₹{trip.budget}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-400 mb-1">Members</p>
                                <p className="font-semibold text-gray-800">{trip.min_members} - {trip.max_members} people</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-400 mb-1">Start Date</p>
                                <p className="font-semibold text-gray-800">{new Date(trip.start_date).toLocaleDateString()}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-400 mb-1">End Date</p>
                                <p className="font-semibold text-gray-800">{new Date(trip.end_date).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="font-semibold text-gray-800 mb-2">About this trip</h3>
                            <p className="text-gray-600 leading-relaxed">{trip.details}</p>
                        </div>
                    </>
                )}

                <div className="flex items-center gap-3 mt-4 pt-4 border-t">
                    <img src={getProfilePic(trip.creator.profile_pic)} alt={trip.creator.username}
                        className="w-10 h-10 rounded-full object-cover cursor-pointer"
                        onClick={() => navigate(`/user/${trip.creator.username}`)} />
                    <div>
                        <p className="text-xs text-gray-400">Trip organized by</p>
                        <p className="font-semibold text-gray-800">@{trip.creator.username}</p>
                    </div>
                </div>

                {!isCreator && <div className="mt-5">{renderJoinButton()}</div>}
            </div>

            {isCreator && trip.group_id && (
                <div className="bg-white rounded-xl shadow p-4 mb-6">
                    <button onClick={() => navigate(`/group-chat/${trip.group_id}`)}
                        className="w-full py-3 rounded-xl font-bold text-white bg-teal-500">💬 Open Trip Group Chat</button>
                </div>
            )}

            {isCreator && pendingRequests.length > 0 && (
                <div className="bg-white rounded-xl shadow p-6 mb-6">
                    <h3 className="font-bold text-lg text-gray-800 mb-4">Join Requests ({pendingRequests.length})</h3>
                    <div className="space-y-3">
                        {pendingRequests.map((req) => (
                            <div key={req.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <img src={getProfilePic(req.user.profile_pic)} alt={req.user.username}
                                        className="w-10 h-10 rounded-full object-cover" />
                                    <div>
                                        <p className="font-semibold">@{req.user.username}</p>
                                        <p className="text-xs text-gray-400">{new Date(req.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleAccept(req.id)}
                                        className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm">Accept</button>
                                    <button onClick={() => handleReject(req.id)}
                                        className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm">Reject</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-bold text-lg text-gray-800 mb-4">Comments</h3>
                <form onSubmit={handleComment} className="flex gap-2 mb-4">
                    <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-grow border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-teal-500" />
                    <button type="submit" className="bg-teal-500 text-white px-4 py-2 rounded-lg">Post</button>
                </form>
                {comments.length > 0 ? (
                    <ul className="space-y-3">
                        {comments.map(comment => (
                            <li key={comment.id} className="border-b pb-2">
                                <p className="text-gray-800"><strong>@{comment.user?.username}</strong>: {comment.text}</p>
                                <p className="text-xs text-gray-400">{new Date(comment.created_at).toLocaleString()}</p>
                            </li>
                        ))}
                    </ul>
                ) : <p className="text-gray-500">No comments yet.</p>}
            </div>
        </div>
    );
}