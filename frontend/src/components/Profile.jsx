import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { getProfile } from "../api";
import EditProfileModal from "./EditProfileModal";
import PostCard from "./PostCard";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Trips");
  const [posts, setPosts] = useState([]);
  const [mates, setMates] = useState([]);
 
  const [stats, setStats] = useState(null);
  const [timestamp, setTimestamp] = useState(Date.now());
  const navigate = useNavigate();

  const fetchProfile = useCallback(async () => {
    try {
      const res = await getProfile();
      setProfile(res.data);
      setTimestamp(Date.now());
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!profile) return;
      try {
        const res = await api.get(`/profile/${profile.username}/stats/`);
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };
    if (profile) fetchStats();
  }, [profile]);

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

  useEffect(() => {
    const fetchPosts = async () => {
      if (!profile) return;
      try {
        const [expRes, joinRes, genRes] = await Promise.all([
          api.get(`/posts/${profile.username}/user/`),
          api.get("/joinable-trips/"),
          api.get("/general-posts/"),
        ]);
        const expPosts = expRes.data.map(p => ({ ...p, post_type: 'experience' }));
        const joinPosts = joinRes.data
          .filter(p => p.creator?.id === profile.id)
          .map(p => ({ ...p, post_type: 'joinable' }));
        const genPosts = genRes.data
          .filter(p => p.author?.id === profile.id)
          .map(p => ({ ...p, post_type: 'general' }));
        const allPosts = [...expPosts, ...joinPosts, ...genPosts]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setPosts(allPosts);
      } catch (error) {
        console.error("Failed to fetch posts", error);
      }
    };
    if (activeTab === "Trips") fetchPosts();
  }, [activeTab, profile]);

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

 

  

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!profile) return <div className="text-center py-20 text-gray-500">Could not load profile.</div>;

  const profilePictureUrl = profile.profile_pic
    ? profile.profile_pic.startsWith("http")
      ? `${profile.profile_pic}?t=${timestamp}`
      : `http://127.0.0.1:8000${profile.profile_pic}?t=${timestamp}`
    : "/default-avatar.png";

  const coverPicStyle = profile.cover_pic
    ? {
        backgroundImage: `url(http://127.0.0.1:8000${profile.cover_pic}?t=${timestamp})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {};

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <Link
        to="/logout"
        className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 z-10"
      >
        Logout
      </Link>

      <div className="h-48 bg-teal-500" style={coverPicStyle}></div>

      <div className="max-w-4xl mx-auto px-4 -mt-20">
        <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-lg relative">
          <img
            className="h-32 w-32 rounded-full border-4 border-white object-cover"
            src={profilePictureUrl}
            alt="Profile"
          />

          <h1 className="text-2xl font-bold text-gray-900 mt-4">{profile.username}</h1>
          {profile.full_name && <p className="text-gray-500 text-sm mt-1">{profile.full_name}</p>}
          {profile.bio && <p className="text-gray-600 text-center mt-2 w-3/4">{profile.bio}</p>}

          {/* Stats Row */}
          {stats && (
            <div className="flex gap-6 mt-5 text-center">
              <div>
                <p className="font-bold text-lg text-gray-900">{stats.total_posts}</p>
                <p className="text-xs text-gray-500">Posts</p>
              </div>
              <div>
                <p className="font-bold text-lg text-gray-900">{stats.followers_count}</p>
                <p className="text-xs text-gray-500">Followers</p>
              </div>
              <div>
                <p className="font-bold text-lg text-gray-900">{stats.following_count}</p>
                <p className="text-xs text-gray-500">Following</p>
              </div>
              <div>
                <p className="font-bold text-lg text-gray-900">{stats.unique_destinations}</p>
                <p className="text-xs text-gray-500">Destinations</p>
              </div>
              <div>
                <p className="font-bold text-lg text-gray-900">{stats.total_trips}</p>
                <p className="text-xs text-gray-500">Trips</p>
              </div>
            </div>
          )}

          {/* Badges */}
          {stats?.badges?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {stats.badges.map((badge, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold px-3 py-1 rounded-full"
                >
                  {badge.icon} {badge.label}
                </span>
              ))}
            </div>
          )}

          <div className="mt-5 flex space-x-4">
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

          <div className="mt-6 border-b border-gray-200 w-full">
            <nav className="-mb-px flex space-x-8 justify-center overflow-x-auto">
              {["Trips", "Travelwonder", "Mates"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={
                    activeTab === tab
                      ? "border-teal-500 text-teal-600 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap"
                      : "border-transparent text-gray-500 hover:text-gray-700 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap"
                  }
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-8">
          {activeTab === "Trips" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.length > 0 ? (
                posts.map((post) => <PostCard key={`${post.post_type}-${post.id}`} post={post} />)
              ) : (
                <div className="col-span-full flex flex-col items-center py-16 text-gray-400">
                  <span className="text-5xl mb-4">✈️</span>
                  <p className="font-medium text-lg">No posts yet</p>
                  <p className="text-sm mt-1">Share your first travel story!</p>
                  <Link to="/create-trip" className="mt-4 bg-teal-500 text-white px-6 py-2 rounded-full text-sm font-semibold">
                    Create Post
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === "Travelwonder" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.length > 0 ? (
                posts.map((post) => <PostCard key={`${post.post_type}-${post.id}`} post={post} />)
              ) : (
                <div className="col-span-full flex flex-col items-center py-16 text-gray-400">
                  <span className="text-5xl mb-4">🔖</span>
                  <p className="font-medium text-lg">No saved posts yet</p>
                  <p className="text-sm mt-1">Save trips you love to find them here</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "Mates" && (
            <div>
              {mates.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {mates.map((mate) => (
                    <div
                      key={mate.id}
                      onClick={() => navigate(`/user/${mate.username}`)}
                      className="bg-white shadow rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50"
                    >
                      <img
                        src={mate.profile_pic
                          ? mate.profile_pic.startsWith("http")
                            ? mate.profile_pic
                            : `http://127.0.0.1:8000${mate.profile_pic}`
                          : "/default-avatar.png"}
                        alt={mate.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-sm">@{mate.username}</p>
                        {mate.full_name && <p className="text-xs text-gray-400">{mate.full_name}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-16 text-gray-400">
                  <span className="text-5xl mb-4">👥</span>
                  <p className="font-medium text-lg">No mates yet</p>
                  <p className="text-sm mt-1">Follow people and get followed back!</p>
                </div>
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