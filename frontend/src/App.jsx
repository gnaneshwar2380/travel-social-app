// frontend/src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login.jsx";
import Signup from "./components/Signup.jsx";
import Profile from "./components/Profile.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import CreateTrip from "./components/CreateTrip.jsx";
import EditTrip from "./components/EditTrip.jsx";
import TripDetail from "./components/TripDetail.jsx";
import Home from "./components/Home.jsx";
import Logout from "./components/Logout.jsx";
import Notification from "./components/Notification.jsx";
import Messages from "./components/Messages.jsx";
import Search from "./components/Search";


import BottomNav from "./components/BottomNav.jsx";

function RegisterAndLogout() {
  localStorage.clear();
  return <Signup />;
}

function App() {
  return (
    <div className="pb-16"> {/* Add padding so content doesn’t hide behind nav */}
      <Routes>
        {/* 🏠 Home */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
  path="/search"
  element={
    <ProtectedRoute>
      <Search />
    </ProtectedRoute>
  }
/>
 
       <Route
  path="/messages"
  element={
    <ProtectedRoute>
      <Messages />
    </ProtectedRoute>
  }
/>

        {/* 👤 Profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* 🔔 Notifications */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notification />
            </ProtectedRoute>
          }
        />

        {/* 🧭 Trip pages */}
        <Route
          path="/trip/:id"
          element={
            <ProtectedRoute>
              <TripDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-trip"
          element={
            <ProtectedRoute>
              <CreateTrip />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trip/:id/edit"
          element={
            <ProtectedRoute>
              <EditTrip />
            </ProtectedRoute>
          }
        />

        {/* 🔐 Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/signup" element={<RegisterAndLogout />} />

        {/* Default */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* 📱 Bottom Navigation (only if logged in) */}
      {localStorage.getItem("authTokens") && <BottomNav />}
    </div>
  );
}

export default App;
