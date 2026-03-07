import React, { useEffect, useState } from "react";
import { getForYouFeed } from "../api";
import api from "../api";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PostCard from "./PostCard";
import Stories from "./Stories";

export default function Home() {
  const [activeTab, setActiveTab] = useState("foryou");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true);
      try {
        let data = [];
        if (activeTab === "foryou") {
          const res = await getForYouFeed();
          data = res.data || [];
        } else {
          const res = await api.get("/posts/following/");
          data = res.data || [];
        }
        setPosts(data);
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
    <div className="max-w-2xl mx-auto pb-20 relative">
      {/* Top Nav */}
      <div className="sticky top-0 z-40 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button
          className={`font-semibold text-sm px-3 py-2 rounded-full ${
            activeTab === "foryou"
              ? "text-teal-600 border-b-2 border-teal-600"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("foryou")}
        >
          For You
        </button>
        <button
          className={`font-semibold text-sm px-3 py-2 rounded-full ${
            activeTab === "following"
              ? "text-teal-600 border-b-2 border-teal-600"
              : "text-gray-500"
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

      {/* Stories - clipped to page flow, not overlapping nav */}
      <div className="bg-white border-b overflow-hidden">
        <Stories />
      </div>

      {/* Feed */}
      <div className="mt-4 space-y-6 px-4">
        {loading && (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        {!loading && posts.length === 0 && (
          <div className="flex flex-col items-center py-16 text-gray-400">
            <span className="text-5xl mb-4">✈️</span>
            <p className="font-medium">No posts yet</p>
            <p className="text-sm mt-1">Follow people to see their posts here</p>
          </div>
        )}
        {!loading &&
          posts.map((post) => (
            <PostCard key={`${post.post_type}-${post.id}`} post={post} />
          ))}
      </div>
    </div>
  );
}