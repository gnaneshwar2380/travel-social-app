import React, { useEffect, useState } from "react";
import { getForYouFeed, getFollowingFeed,  } from "../api";
import { Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PostCard from "./PostCard";

export default function Home() {
  const [activeTab, setActiveTab] = useState("foryou");
  const [posts, setPosts] = useState([]);
  
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isSearching) return;
    const fetchFeed = async () => {
      setLoading(true);
      try {
        const res =
          activeTab === "foryou"
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
  }, [activeTab, isSearching]);

  

  const clearSearch = () => {
    setIsSearching(false);
    
    setSearchResults([]);
  };

  return (
    <div className="max-w-2xl mx-auto pb-20">
      {/* Tabs + Search */}
      <div className="sticky top-0 z-40 bg-white border-b px-4 py-3 flex items-center gap-3">
        <button
          className={`font-semibold text-sm md:text-base px-3 py-2 rounded-full ${
            activeTab === "foryou"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => {
            setActiveTab("foryou");
            clearSearch();
          }}
        >
          For You
        </button>

        <button
          className={`font-semibold text-sm md:text-base px-3 py-2 rounded-full ${
            activeTab === "following"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => {
            setActiveTab("following");
            clearSearch();
          }}
        >
          Following
        </button>

        <form
        onClick={() => navigate("/search")}
         className="flex items-center bg-gray-100 rounded-full px-3 py-1 ml-auto w-full max-w-xs">
          </form>
          <button onClick={() => navigate("/search")}>
            <Search size={18} className="text-gray-500 mr-2" />
         <Search />
         </button>
        
      </div>

      {/* Feed Section */}
      

          <div className="mt-4 space-y-6">
        {loading && (
          <p className="text-center text-gray-500">Loading posts...</p>
        )}

        {!loading && posts.length === 0 && (
          <p className="text-center text-gray-500">
            No posts to show yet.
          </p>
        )}

        {!loading &&
          posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
      </div>
                      
                  
            
        </div>
      
    
  );
}
