import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api, { getNotifications, markAllRead,getProfile } from "../api";
import EditProfileModal from "./EditProfileModal";
import PostCard from "./PostCard";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Trips");
  const [posts, setPosts] = useState([]);
  const [mates, setMates] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await getProfile();
      setProfile(res.data);
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // ✅ Fetch saved posts (Travelwonder)
  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const res = await api.get("/saved/");
        setPosts(res.data);
      } catch (error) {
        console.error("Failed to fetch saved posts", error);
      }
    };
    if (activeTab === "Travelwonder") fetchSaved();
  }, [activeTab]);

  // ✅ Fetch user's own posts (normal, experience, joinable)
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get("/posts/");
        setPosts(res.data);
      } catch (error) {
        console.error("Failed to fetch posts", error);
      }
    };
    if (activeTab === "Trips") fetchPosts();
  }, [activeTab]);

  // ✅ Fetch mates
  useEffect(() => {
    const fetchMates = async () => {
      try {
        const res = await api.get("/follows/mates/");
        setMates(res.data);
      } catch (err) {
        console.error("Failed to fetch mates", err);
      }
    };
    if (activeTab === "Mates") fetchMates();
  }, [activeTab]);

  // ✅ Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await getNotifications();
        setNotifications(res.data);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };
    if (activeTab === "Notifications") fetchNotifications();
  }, [activeTab]);

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
    } catch (err) {
      console.error("Failed to mark notifications as read", err);
    }
  };

  if (loading) return <div>Loading your profile...</div>;
  if (!profile) return <div>Could not load profile.</div>;

  const profilePictureUrl = profile.profile_pic;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Logout */}
      <Link
        to="/logout"
        className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 z-10"
      >
        Logout
      </Link>

      {/* Header */}
    <div
    className="h-48 bg-teal-500"
    style={
        profile.cover_pic
            ? { backgroundImage: `url(http://127.0.0.1:8000${profile.cover_pic})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : {}
    }
></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20">
        <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-lg relative">
          <img
            className="h-32 w-32 rounded-full border-4 border-white object-cover"
            src={profilePictureUrl}
            alt="Profile"
          />

          <h1 className="text-2xl font-bold text-gray-900 mt-4">
            {profile.user?.username || "Anonymous User"}
          </h1>

          {profile.bio && (
            <p className="text-gray-600 text-center mt-2 w-3/4">
              {profile.bio}
            </p>
          )}

          {/* Buttons */}
          <div className="mt-4 flex space-x-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-full text-sm"
            >
              Edit Profile
            </button>
            <Link
              to="/create-trip"
              className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-full text-sm"
            >
              + Create Post
            </Link>
          </div>

          {/* Tabs */}
          <div className="mt-6 border-b border-gray-200 w-full">
            <nav className="-mb-px flex space-x-8 justify-center" aria-label="Tabs">
              {["Travelwonder", "Trips", "Mates", "Notifications"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={
                    activeTab === tab
                      ? "border-teal-500 text-teal-600 py-4 px-1 border-b-2 font-medium text-sm"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 py-4 px-1 border-b-2 font-medium text-sm"
                  }
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Section */}
        <div className="mt-8">
          {/* Trips / Posts */}
          {activeTab === "Trips" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <div key={post.id} className="relative">
                    {post.post_type === "experience" && (
                      <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                        Experience
                      </div>
                    )}
                    {post.post_type === "joinable" && (
                      <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                        Joinable
                      </div>
                    )}
                    <PostCard post={post} />
                  </div>
                ))
              ) : (
                <p className="col-span-full text-center text-gray-500">
                  No posts yet. Click “Create Post” to share your journey!
                </p>
              )}
            </div>
          )}

          {/* Travelwonder */}
          {activeTab === "Travelwonder" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.length > 0 ? (
                posts.map((post) => <PostCard key={post.id} post={post} />)
              ) : (
                <p className="col-span-full text-center text-gray-500">
                  You haven't saved any trips yet. 
    
                </p>
              )}
            </div>
          )}

          {/* Mates */}
          {activeTab === "Mates" && (
            <div>
              {mates.length > 0 ? (
                <ul className="grid grid-cols-2 gap-4">
                  {mates.map((mate) => (
                    <li
                      key={mate.id}
                      className="bg-white shadow rounded-lg p-4 text-center"
                    >
                      <p className="font-semibold">{mate.username}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500">
                  No mates yet — follow and get followed back!
                </p>
              )}
            </div>
          )}

          {/* Notifications */}
          {activeTab === "Notifications" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Notifications
                </h2>
                <button
                  onClick={handleMarkAllRead}
                  className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-md"
                >
                  Mark all read
                </button>
              </div>

              {notifications.length > 0 ? (
                <ul className="space-y-3">
                  {notifications.map((n) => (
                    <li
                      key={n.id}
                      className={`p-3 rounded-lg shadow-sm ${
                        n.is_read ? "bg-gray-100" : "bg-blue-50"
                      }`}
                    >
                      <p className="text-gray-800 text-sm">{n.text}</p>
                      <p className="text-gray-400 text-xs mt-1">
                        {new Date(n.created_at).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-center">
                  No notifications yet.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <EditProfileModal
          onClose={() => setIsModalOpen(false)}
          onUploadSuccess={fetchProfile}
        />
      )}
    </div>
  );
};

export default Profile;
