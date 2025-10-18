import React, { useState } from "react";
import api from "../api";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ users: [], posts: [] });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      const res = await api.get(`/api/search/?q=${encodeURIComponent(query)}`);
      setResults(res.data);
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      <form
        onSubmit={handleSearch}
        className="flex items-center bg-gray-100 rounded-full px-3 py-2 mb-4"
      >
        <input
          type="text"
          placeholder="Search users or #hashtags..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent outline-none text-gray-800 px-2"
        />
        <button
          type="submit"
          className="text-blue-600 font-medium hover:text-blue-700"
        >
          Search
        </button>
      </form>

      {results.users.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-2">Users</h3>
          {results.users.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 bg-white p-3 rounded-xl mb-2 border hover:bg-gray-50 cursor-pointer"
            >
              <img
                src={user.profile_picture || "/default-avatar.png"}
                alt={user.username}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-medium">{user.username}</p>
                <p className="text-xs text-gray-500">@{user.handle}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {results.posts.length > 0 && (
        <div>
          <h3 className="font-semibold text-lg mb-2">Posts</h3>
          {results.posts.map((post) => (
            <div
              key={post.id}
              className="bg-white p-4 rounded-xl mb-3 border hover:bg-gray-50"
            >
              <p className="font-semibold">@{post.user.username}</p>
              <p className="text-gray-800 mt-1">{post.content}</p>
              {post.hashtags?.length > 0 && (
                <p className="text-sm text-blue-500 mt-1">
                  #{post.hashtags.join(" #")}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
