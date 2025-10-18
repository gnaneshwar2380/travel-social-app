import React, { useEffect, useState } from "react";
import api from "../api";
import { Search } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("foryou");
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch feed for "For You" or "Following"
  useEffect(() => {
    if (isSearching) return; // don’t reload feed during search
    const fetchFeed = async () => {
      try {
        const endpoint =
          activeTab === "foryou"
            ? "/api/posts/foryou/"
            : "/api/posts/following/";
        const res = await api.get(endpoint);
        setPosts(res.data);
      } catch (err) {
        console.error("Error fetching feed:", err);
      }
    };
    fetchFeed();
  }, [activeTab, isSearching]);

  // Handle search button click
  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchTerm.trim() === "") return;

    try {
      setIsSearching(true);
      const res = await api.get(`/api/search/?q=${searchTerm}`);
      setSearchResults(res.data.results || []);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  // Clear search and go back to feed
  const clearSearch = () => {
    setIsSearching(false);
    setSearchTerm("");
    setSearchResults([]);
  };

  return (
    <div className="max-w-2xl mx-auto pb-20">
      {/* Header: Tabs + Search */}
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

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="flex items-center bg-gray-100 rounded-full px-3 py-1 ml-auto w-full max-w-xs"
        >
          <Search size={18} className="text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search users or #posts"
            className="bg-transparent outline-none text-sm w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            type="submit"
            className="ml-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            Search
          </button>
        </form>
      </div>

      {/* Show search results if searching */}
      {isSearching ? (
        <div className="p-3 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-700">
              Search Results for “{searchTerm}”
            </h3>
            <button
              onClick={clearSearch}
              className="text-sm text-blue-600 hover:underline"
            >
              Clear
            </button>
          </div>

          {searchResults.length > 0 ? (
            searchResults.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-xl shadow-sm border hover:bg-gray-50"
              >
                {item.username ? (
                  // User result
                  <div className="flex items-center gap-3">
                    <img
                      src={item.profile_picture || "/default-avatar.png"}
                      alt={item.username}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-semibold">{item.username}</p>
                      <p className="text-sm text-gray-500">
                        {item.bio || "No bio yet"}
                      </p>
                    </div>
                  </div>
                ) : (
                  // Post result
                  <div>
                    <p className="font-semibold">@{item.author}</p>
                    <p className="text-gray-700 mt-1">{item.caption}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">No results found.</p>
          )}
        </div>
      ) : (
        // Default Feed
        <div className="p-3 space-y-4">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div
                key={post.id}
                className="bg-white p-4 rounded-xl shadow-sm border hover:bg-gray-50"
              >
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src={post.author_profile || "/default-avatar.png"}
                    alt={post.author}
                    className="w-10 h-10 rounded-full"
                  />
                  <p className="font-semibold">@{post.author}</p>
                </div>
                <p className="text-gray-800">{post.caption}</p>
                {post.image && (
                  <img
                    src={post.image}
                    alt="Post"
                    className="mt-2 rounded-xl w-full"
                  />
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">No posts yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
