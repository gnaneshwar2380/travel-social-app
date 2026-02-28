import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Notification() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await api.get("/notifications/");
            const data = res.data;
            if (data.notifications) {
                setNotifications(data.notifications);
                setUnreadCount(data.unread_count);
            } else {
                setNotifications(data);
            }
        } catch (err) {
            console.error("Failed to load notifications", err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.post("/notifications/mark_all_read/");
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error("Failed to mark all read", err);
        }
    };

    const handleAcceptRequest = async (notif) => {
        try {
            await api.post(`/joinable-trips/requests/${notif.object_id}/accept/`);
            setNotifications(prev => prev.map(n =>
                n.id === notif.id ? { ...n, is_read: true, accepted: true } : n
            ));
            alert("Request accepted! User added to trip group.");
        } catch (err) {
            console.error("Failed to accept request", err);
        }
    };

    const handleRejectRequest = async (notif) => {
        try {
            await api.patch(`/joinable-trips/requests/${notif.object_id}/reject/`);
            setNotifications(prev => prev.map(n =>
                n.id === notif.id ? { ...n, is_read: true, rejected: true } : n
            ));
        } catch (err) {
            console.error("Failed to reject request", err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'follow': return '👤';
            case 'join_request': return '✈️';
            case 'request_accepted': return '✅';
            case 'like': return '❤️';
            case 'comment': return '💬';
            default: return '🔔';
        }
    };

    const getProfilePic = (sender) => {
        if (!sender?.profile_pic) return "/default-avatar.png";
        return sender.profile_pic.startsWith("http")
            ? sender.profile_pic
            : `http://127.0.0.1:8000${sender.profile_pic}`;
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p className="text-gray-400">Loading notifications...</p>
        </div>
    );

    const unread = notifications.filter(n => !n.is_read);
    const read = notifications.filter(n => n.is_read);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white border-b px-4 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-gray-800">Notifications</h1>
                    {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </div>
                {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="text-sm text-teal-600 font-medium">
                        Mark all read
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <span className="text-5xl mb-4">🔔</span>
                    <p className="text-lg font-medium">No notifications yet</p>
                    <p className="text-sm mt-1">When someone follows you or joins your trip, you'll see it here</p>
                </div>
            ) : (
                <div>
                    {unread.length > 0 && (
                        <>
                            <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase bg-gray-50">New</p>
                            {unread.map((n) => (
                                <NotifItem
                                    key={n.id}
                                    n={n}
                                    getIcon={getIcon}
                                    getProfilePic={getProfilePic}
                                    navigate={navigate}
                                    handleAcceptRequest={handleAcceptRequest}
                                    handleRejectRequest={handleRejectRequest}
                                />
                            ))}
                        </>
                    )}
                    {read.length > 0 && (
                        <>
                            <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase bg-gray-50">Earlier</p>
                            {read.map((n) => (
                                <NotifItem
                                    key={n.id}
                                    n={n}
                                    getIcon={getIcon}
                                    getProfilePic={getProfilePic}
                                    navigate={navigate}
                                    handleAcceptRequest={handleAcceptRequest}
                                    handleRejectRequest={handleRejectRequest}
                                />
                            ))}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

function NotifItem({ n, getIcon, getProfilePic, navigate, handleAcceptRequest, handleRejectRequest }) {
    return (
        <div className={`flex items-start gap-3 px-4 py-4 border-b ${!n.is_read ? 'bg-blue-50' : 'bg-white'}`}>
            <div className="text-xl">{getIcon(n.notification_type)}</div>
            <img
                src={getProfilePic(n.sender)}
                alt={n.sender?.username}
                className="w-10 h-10 rounded-full object-cover cursor-pointer"
                onClick={() => navigate(`/user/${n.sender?.username}`)}
            />
            <div className="flex-1">
                <p className="text-sm text-gray-800">{n.text}</p>
                <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.created_at).toLocaleString()}
                </p>
                {n.notification_type === 'join_request' && !n.accepted && !n.rejected && (
                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={() => handleAcceptRequest(n)}
                            className="bg-teal-500 text-white px-4 py-1 rounded-full text-sm font-semibold hover:bg-teal-600"
                        >
                            Accept
                        </button>
                        <button
                            onClick={() => handleRejectRequest(n)}
                            className="bg-gray-200 text-gray-700 px-4 py-1 rounded-full text-sm font-semibold hover:bg-gray-300"
                        >
                            Decline
                        </button>
                    </div>
                )}
                {n.accepted && <p className="text-xs text-teal-600 mt-1 font-medium">✅ Accepted</p>}
                {n.rejected && <p className="text-xs text-gray-400 mt-1 font-medium">Declined</p>}
            </div>
            {!n.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>}
        </div>
    );
}