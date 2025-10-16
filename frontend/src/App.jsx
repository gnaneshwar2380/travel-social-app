// frontend/src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Profile from "./components/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import CreateTrip from "./components/CreateTrip";
import EditTrip from "./components/EditTrip";

function Logout() {
  localStorage.clear();
  return <Navigate to="/login" />;
}

function RegisterAndLogout() {
  localStorage.clear();
  return <Signup />;
}

function App() {
  return (
    <Routes>
      {/* ✅ Main route goes to Profile (protected) */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
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

      <Route path="/login" element={<Login />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/signup" element={<RegisterAndLogout />} />

      {/* Default redirect to Profile */}
      <Route path="*" element={<Navigate to="/profile" />} />
    </Routes>
  );
}

export default App;
