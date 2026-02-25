import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function JoinableTripDetail() {
    const { id } = useParams();
    const [trip, setTrip] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [joinStatus, setJoinStatus] = useState(null);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tripRes, userRes] = await Promise.all([
                    api.get(`/joinable-trips/${id}/`),
                    api.get("/profile/"),
                ]);
                setTrip(tripRes.data);
                setCurrentUser(userRes.data);

                const commentsRes = await api.get(`/posts/joinable/${id}/comments/`);
                setComments(commentsRes.data);

                if (tripRes.data.creator.id === userRes.data.id) {
                    const requestsRes = await api.get(`/joinable-trips/${id}/requests/`);
                    setPendingRequests(requestsRes.data);
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
            if (err.response?.data?.status) {
                setJoinStatus(err.response.data.status);
            }
            console.error("Error expressing interest:", err);
        }
    };

    const handleAccept = async (requestId) => {
        try {
            await api.post(`/joinable-trips/requests/${requestId}/accept/`);
            setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
            alert("Request accepted! User has been added to the trip group.");
        } catch (err) {
            console.error("Error accepting request:", err);
        }
    };

    const handleReject = async (requestId) => {
        try {
            await api.patch(`/joinable-trips/requests/${requestId}/reject/`);
            setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
        } catch (err) {
            console.error("Error rejecting request:", err);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            const res = await api.post(`/posts/joinable/${id}/comments/`, { text: newComment });
            setComments((prev) => [res.data, ...prev]);
            setNewComment("");
        } catch (err) {
            console.error("Error posting comment:", err);
        }
    };

    if (loading) return <div className="text-center py-10">Loading trip...</div>;
    if (!trip) return <div className="text-center py-10">Trip not found.</div>;

    const isCreator = currentUser?.id === trip.creator.id;

    const statusColors = {
        planning: "bg-yellow-100 text-yellow-700",
        full: "bg-red-100 text-red-700",
        ongoing: "bg-green-100 text-green-700",
        completed: "bg-gray-100 text-gray-700",
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-6 pb-24">
            {trip.images?.length > 0 && (
                <Swiper
                    modules={[Navigation, Pagination]}
                    navigation
                    pagination={{ clickable: true }}
                    className="rounded-xl overflow-hidden mb-6"
                >
                    {trip.images.map((img) => (
                        <SwiperSlide key={img.id}>
                            <img
                                src={`http://127.0.0.1:8000${img.image}`}
                                alt="Trip"
                                className="w-full h-72 object-cover"
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>
            )}

            <div className="bg-white rounded-xl shadow p-6 mb-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{trip.title}</h1>
                        <p className="text-gray-500 mt-1">{trip.destination}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[trip.status]}`}>
                        {trip.status}
                    </span>
                </div>

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

                <div className="flex items-center gap-3 mt-4 pt-4 border-t">
                    <img
                        src={trip.creator.profile_pic
                            ? `http://127.0.0.1:8000${trip.creator.profile_pic}`
                            : "/default-avatar.png"}
                        alt={trip.creator.username}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                        <p className="text-xs text-gray-400">Trip organized by</p>
                        <p className="font-semibold text-gray-800">@{trip.creator.username}</p>
                    </div>
                </div>

                {!isCreator && (
                    <button
                        onClick={handleInterest}
                        disabled={joinStatus === "pending" || joinStatus === "accepted"}
                        className={`w-full mt-5 py-3 rounded-xl font-bold text-white transition ${
                            joinStatus === "accepted"
                                ? "bg-green-500 cursor-not-allowed"
                                : joinStatus === "pending"
                                ? "bg-yellow-500 cursor-not-allowed"
                                : "bg-blue-500 hover:bg-blue-600"
                        }`}
                    >
                        {joinStatus === "accepted"
                            ? "✅ You're in!"
                            : joinStatus === "pending"
                            ? "⏳ Request Pending"
                            : "🙋 I'm Interested"}
                    </button>
                )}
            </div>

            {isCreator && pendingRequests.length > 0 && (
                <div className="bg-white rounded-xl shadow p-6 mb-6">
                    <h3 className="font-bold text-lg text-gray-800 mb-4">
                        Join Requests ({pendingRequests.length})
                    </h3>
                    <div className="space-y-3">
                        {pendingRequests.map((req) => (
                            <div key={req.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={req.user.profile_pic
                                            ? `http://127.0.0.1:8000${req.user.profile_pic}`
                                            : "/default-avatar.png"}
                                        alt={req.user.username}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="font-semibold">@{req.user.username}</p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(req.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAccept(req.id)}
                                        className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600"
                                    >
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => handleReject(req.id)}
                                        className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-bold text-lg text-gray-800 mb-4">Comments</h3>
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