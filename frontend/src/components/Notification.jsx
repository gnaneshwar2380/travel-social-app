import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Notification() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await api.get("/notifications/");
                setNotifications(res.data);
            } catch (err) {
                console.error("Failed to load notifications", err);
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    const handleMarkAllRead = async () => {
        try {
            await api.post("/notifications/mark_all_read/");
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (err) {
            console.error("Failed to mark all read", err);
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

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p className="text-gray-400">Loading notifications...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white border-b px-4 py-4 flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-800">Notifications</h1>
                {notifications.some(n => !n.is_read) && (
                    <button
                        onClick={handleMarkAllRead}
                        className="text-sm text-teal-600 font-medium"
                    >
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
                <ul className="divide-y divide-gray-100">
                    {notifications.map((n) => (
                        <li
                            key={n.id}
                            className={`flex items-start gap-4 px-4 py-4 cursor-pointer hover:bg-gray-50 ${!n.is_read ? 'bg-blue-50' : 'bg-white'}`}
                            onClick={() => {
                                if (n.notification_type === 'join_request') {
                                    navigate('/profile');
                                } else if (n.notification_type === 'follow') {
                                    navigate(`/user/${n.sender?.username}`);
                                }
                            }}
                        >
                            <div className="text-2xl">{getIcon(n.notification_type)}</div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <img
                                        src={n.sender?.profile_pic
                                            ? n.sender.profile_pic.startsWith("http")
                                                ? n.sender.profile_pic
                                                : `http://127.0.0.1:8000${n.sender.profile_pic}`
                                            : "/default-avatar.png"}
                                        alt={n.sender?.username}
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                    <p className="text-sm text-gray-800">
                                        <strong>@{n.sender?.username}</strong> {n.text?.replace(n.sender?.username, '').trim()}
                                    </p>
                                </div>
                                <p className="text-xs text-gray-400 mt-1 ml-10">
                                    {new Date(n.created_at).toLocaleString()}
                                </p>
                            </div>
                            {!n.is_read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}