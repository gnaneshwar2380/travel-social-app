import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import PostCard from "./PostCard";

const UserProfile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("Trips");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/profile/${username}/`);
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get(`/posts/${username}/`);
        setPosts(res.data);
      } catch (err) {
        console.error("Failed to load user posts", err);
      }
    };
    if (activeTab === "Trips") fetchPosts();
  }, [activeTab, username]);

  if (loading) return <div>Loading profile...</div>;
  if (!profile) return <div>User not found.</div>;

  const profilePictureUrl = profile.profile_picture
    ? `http://127.0.0.1:8000${profile.profile_picture}`
    : `http://127.0.0.1:8000/media/profile_pics/default.jpg`;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="h-48 bg-teal-500"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20">
        <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
          <img
            className="h-32 w-32 rounded-full border-4 border-white object-cover"
            src={profilePictureUrl}
            alt="Profile"
          />
          <h1 className="text-2xl font-bold mt-4">{profile.username}</h1>

          <button className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 mt-3 rounded-full">
            Follow
          </button>

          <div className="mt-6 border-b border-gray-200 w-full">
            <nav className="-mb-px flex space-x-8 justify-center">
              {["Trips", "Travelwonder", "Mates"].map((tab) => (
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

          <div className="mt-8 w-full">
            {activeTab === "Trips" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.length > 0 ? (
                  posts.map((post) => <PostCard key={post.id} post={post} />)
                ) : (
                  <p className="col-span-full text-center text-gray-500">
                    No trips posted yet.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

