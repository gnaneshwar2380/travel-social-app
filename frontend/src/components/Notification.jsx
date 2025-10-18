import React, { useState, useEffect } from "react";
import { getNotifications, markAllRead } from "../api";
import { Bell } from "lucide-react";

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getNotifications().then((res) => setNotifications(res.data));
  }, []);

  const unread = notifications.filter((n) => !n.is_read).length;

  const handleMarkAll = async () => {
    await markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative">
        <Bell className="w-6 h-6 text-gray-700" />
        {unread > 0 && (
          <span className="absolute -top-2 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg w-64 p-3 z-50">
          <div className="flex justify-between mb-2">
            <h3 className="font-semibold">Notifications</h3>
            <button
              onClick={handleMarkAll}
              className="text-blue-500 text-sm hover:underline"
            >
              Mark all read
            </button>
          </div>
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-2 rounded-md text-sm ${
                n.is_read ? "text-gray-500" : "text-black font-medium"
              }`}
            >
              {n.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notification;
