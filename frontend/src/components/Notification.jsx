import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Notification() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => { fetchNotifications(); }, []);

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
        } catch (err) { console.error(err); }
    };

    const handleAcceptRequest = async (notif) => {
        try {
            await api.post(`/joinable-trips/requests/${notif.object_id}/accept/`);
            setNotifications(prev => prev.map(n =>
                n.id === notif.id ? { ...n, is_read: true, request_status: 'accepted' } : n
            ));
        } catch (err) { console.error(err); }
    };

    const handleRejectRequest = async (notif) => {
        try {
            await api.patch(`/joinable-trips/requests/${notif.object_id}/reject/`);
            setNotifications(prev => prev.map(n =>
                n.id === notif.id ? { ...n, is_read: true, request_status: 'rejected' } : n
            ));
        } catch (err) { console.error(err); }
    };

    const getProfilePic = (sender) => {
        if (!sender?.profile_pic) return "/default-avatar.png";
        return sender.profile_pic.startsWith("http")
            ? sender.profile_pic
            : `http://127.0.0.1:8000${sender.profile_pic}`;
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    const unread = notifications.filter(n => !n.is_read);
    const read = notifications.filter(n => n.is_read);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
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
                    <p className="text-sm mt-1">When someone follows or interacts with you, you'll see it here</p>
                </div>
            ) : (
                <div>
                    {unread.length > 0 && (
                        <>
                            <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase bg-gray-50">New</p>
                            {unread.map(n => (
                                <NotifItem key={n.id} n={n}
                                    getProfilePic={getProfilePic}
                                    navigate={navigate}
                                    handleAcceptRequest={handleAcceptRequest}
                                    handleRejectRequest={handleRejectRequest} />
                            ))}
                        </>
                    )}
                    {read.length > 0 && (
                        <>
                            <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase bg-gray-50">Earlier</p>
                            {read.map(n => (
                                <NotifItem key={n.id} n={n}
                                    getProfilePic={getProfilePic}
                                    navigate={navigate}
                                    handleAcceptRequest={handleAcceptRequest}
                                    handleRejectRequest={handleRejectRequest} />
                            ))}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

function NotifItem({ n, getProfilePic, navigate, handleAcceptRequest, handleRejectRequest }) {
     const showActions = n.notification_type === 'join_request' && !n.is_read;
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

    const getActionText = () => {
        switch (n.notification_type) {
            case 'like': return 'liked your post';
            case 'comment': return 'commented on your post';
            case 'follow': return 'started following you';
            case 'join_request': return 'wants to join your trip';
            case 'request_accepted': return 'accepted your trip request';
            default: return n.text;
        }
    };

    const timeAgo = (dateStr) => {
        const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
        if (diff < 60) return `${diff}s`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
        return `${Math.floor(diff / 86400)}d`;
    };

    return (
        <div
            className={`flex items-center gap-3 px-4 py-3 border-b transition-colors ${!n.is_read ? 'bg-blue-50' : 'bg-white'}`}
            onClick={() => n.post_url && navigate(n.post_url)}
            style={{ cursor: n.post_url ? 'pointer' : 'default' }}
        >
            {/* Left: avatar + icon badge */}
            <div className="relative flex-shrink-0">
                <img
                    src={getProfilePic(n.sender)}
                    alt={n.sender?.username}
                    className="w-11 h-11 rounded-full object-cover"
                    onClick={(e) => { e.stopPropagation(); navigate(`/user/${n.sender?.username}`); }}
                />
                <span className="absolute -bottom-1 -right-1 text-base leading-none">
                    {getIcon(n.notification_type)}
                </span>
            </div>

            {/* Middle: text */}
            <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 leading-snug">
                    <span
                        className="font-bold cursor-pointer hover:underline"
                        onClick={(e) => { e.stopPropagation(); navigate(`/user/${n.sender?.username}`); }}
                    >
                        @{n.sender?.username}
                    </span>
                    {' '}{getActionText()}
                </p>

                {/* Comment preview */}
                {n.notification_type === 'comment' && n.comment_text && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate italic">
                        "{n.comment_text}"
                    </p>
                )}

                <p className="text-xs text-gray-400 mt-0.5">{timeAgo(n.created_at)}</p>

                {/* Accept/Reject buttons */}
                {showActions && (
                    <div className="flex gap-2 mt-2" onClick={e => e.stopPropagation()}>
                        <button onClick={() => handleAcceptRequest(n)}
                            className="bg-teal-500 text-white px-4 py-1 rounded-full text-sm font-semibold hover:bg-teal-600">
                            Accept
                        </button>
                        <button onClick={() => handleRejectRequest(n)}
                            className="bg-gray-200 text-gray-700 px-4 py-1 rounded-full text-sm font-semibold hover:bg-gray-300">
                            Decline
                        </button>
                    </div>
                )}
                
            </div>

            {/* Right: post thumbnail */}
            {n.post_thumbnail && (
                <img src={n.post_thumbnail} alt="post"
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
            )}

            {/* Unread dot */}
            {!n.is_read && !n.post_thumbnail && (
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
            )}
        </div>
    );
}