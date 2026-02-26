import { Routes, Route, Navigate, useLocation } from "react-router-dom";
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
import Search from "./components/Search.jsx";
import BottomNav from "./components/BottomNav.jsx";
import UserProfile from "./components/UserProfile.jsx";
import JoinableTripDetail from "./components/JoinableTripDetail.jsx";
import TripGroupChat from "./components/TripGroupChat.jsx";
function RegisterAndLogout() {
  localStorage.clear();
  return <Signup />;
}

function App() {
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem("authTokens");
  const hideNavRoutes = ["/login", "/signup"];
  const shouldShowNav = isLoggedIn && !hideNavRoutes.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow pb-16">
        <Routes>
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
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
                
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notification />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trip/:id"
            element={
              <ProtectedRoute>
                <TripDetail />
              </ProtectedRoute>
            }
          />
          <Route
    path="/group-chat/:groupId"
    element={
        <ProtectedRoute>
            <TripGroupChat />
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
          <Route
            path="/user/:username"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
          path="/joinable-trip/:id"
          element={
            <ProtectedRoute>
             <JoinableTripDetail />
            </ProtectedRoute>
            }
         />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/signup" element={<RegisterAndLogout />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>

      {shouldShowNav && <BottomNav />}
    </div>
  );
}

export default App;
