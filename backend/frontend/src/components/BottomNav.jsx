import { NavLink } from "react-router-dom";
import { Home, Bell, User, MessageCircle } from "lucide-react";

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 z-50">
      <NavLink
        to="/home"
        className={({ isActive }) =>
          `flex flex-col items-center text-sm ${
            isActive ? "text-blue-600" : "text-gray-500"
          }`
        }
      >
        <Home size={22} />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/notifications"
        className={({ isActive }) =>
          `flex flex-col items-center text-sm ${
            isActive ? "text-blue-600" : "text-gray-500"
          }`
        }
      >
        <Bell size={22} />
        <span>Alerts</span>
      </NavLink>

      <NavLink
        to="/messages"
        className={({ isActive }) =>
          `flex flex-col items-center text-sm ${
            isActive ? "text-blue-600" : "text-gray-500"
          }`
        }
      >
        <MessageCircle size={22} />
        <span>DMs</span>
      </NavLink>

      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `flex flex-col items-center text-sm ${
            isActive ? "text-blue-600" : "text-gray-500"
          }`
        }
      >
        <User size={22} />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
}
