import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Bell, MessageCircle, User } from "lucide-react";
import api from "../api";

export default function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const [counts, setCounts] = useState({ messages: 0, notifications: 0 });

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const res = await api.get("/counts/");
                setCounts(res.data);
            } catch (err) {
                console.error("Failed to fetch counts", err);
            }
        };
        fetchCounts();
        const interval = setInterval(fetchCounts, 15000);
        return () => clearInterval(interval);
    }, []);

    const tabs = [
        { path: "/", icon: Home, label: "Home" },
        { path: "/notifications", icon: Bell, label: "Alerts", badge: counts.notifications },
        { path: "/messages", icon: MessageCircle, label: "DMs", badge: counts.messages },
        { path: "/profile", icon: User, label: "Profile" },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-50">
            <div className="flex justify-around items-center py-2">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = location.pathname === tab.path;
                    return (
                        <button
                            key={tab.path}
                            onClick={() => navigate(tab.path)}
                            className="flex flex-col items-center gap-1 relative px-4 py-1"
                        >
                            <div className="relative">
                                <Icon
                                    size={24}
                                    className={isActive ? "text-teal-500" : "text-gray-500"}
                                />
                                {tab.badge > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                        {tab.badge > 9 ? '9+' : tab.badge}
                                    </span>
                                )}
                            </div>
                            <span className={`text-xs ${isActive ? "text-teal-500" : "text-gray-500"}`}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
