import React, { useEffect, useState } from "react";
import { getForYouFeed, getFollowingFeed } from "../api";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PostCard from "./PostCard";

export default function Home() {
  const [activeTab, setActiveTab] = useState("foryou");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true);
      try {
        const res = activeTab === "foryou"
          ? await getForYouFeed()
          : await getFollowingFeed();
        setPosts(res.data || []);
      } catch (err) {
        console.error("Error fetching feed:", err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, [activeTab]);

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <div className="sticky top-0 z-40 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button
          className={`font-semibold text-sm px-3 py-2 rounded-full ${
            activeTab === "foryou" ? "text-teal-600 border-b-2 border-teal-600" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("foryou")}
        >
          For You
        </button>

        <button
          className={`font-semibold text-sm px-3 py-2 rounded-full ${
            activeTab === "following" ? "text-teal-600 border-b-2 border-teal-600" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("following")}
        >
          Following
        </button>

        <button
          onClick={() => navigate("/search")}
          className="ml-auto flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 text-gray-500 text-sm"
        >
          <Search size={16} />
          Search
        </button>
      </div>

      <div className="mt-4 space-y-6 px-4">
        {loading && <p className="text-center text-gray-500">Loading posts...</p>}

        {!loading && posts.length === 0 && (
          <p className="text-center text-gray-500">No posts to show yet.</p>
        )}

        {!loading && posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}