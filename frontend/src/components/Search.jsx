import React, { useState, useEffect, useRef } from "react";
import api from "../api";
import { Search as SearchIcon, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PostCard from "./PostCard";

export default function Search() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState({ users: [], posts: [], trips: [] });
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("all");
    const [searched, setSearched] = useState(false);
    const navigate = useNavigate();
    const inputRef = useRef(null);
    const debounceRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        if (!query.trim()) {
            setResults({ users: [], posts: [], trips: [] });
            setSearched(false);
            return;
        }
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            doSearch(query);
        }, 400);
        return () => clearTimeout(debounceRef.current);
    }, [query]);

    const doSearch = async (q) => {
        setLoading(true);
        try {
            const res = await api.get(`/search/?q=${encodeURIComponent(q)}`);
            const data = res.data;

            const users = data.users || [];
            const expPosts = (data.posts || []).map(p => ({ ...p, post_type: 'experience' }));
            const genPosts = (data.general_posts || []).map(p => ({ ...p, post_type: 'general' }));
            const trips = (data.trips || []).map(p => ({ ...p, post_type: 'joinable' }));

            setResults({
                users,
                posts: [...expPosts, ...genPosts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
                trips,
            });
            setSearched(true);
        } catch (err) {
            console.error("Search failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const getProfilePic = (pic) => {
        if (!pic) return "/default-avatar.png";
        return pic.startsWith("http") ? pic : `http://127.0.0.1:8000${pic}`;
    };

    const totalResults = results.users.length + results.posts.length + results.trips.length;

    const tabs = [
        { key: "all", label: "All" },
        { key: "users", label: `People (${results.users.length})` },
        { key: "posts", label: `Posts (${results.posts.length})` },
        { key: "trips", label: `Trips (${results.trips.length})` },
    ];

    return (
        <div className="max-w-2xl mx-auto pb-24">
            <div className="sticky top-0 z-40 bg-white border-b px-4 py-3">
                <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 gap-2">
                    <SearchIcon size={18} className="text-gray-400 flex-shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search people, trips, posts..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-gray-800 text-sm"
                    />
                    {query && (
                        <button onClick={() => setQuery("")}>
                            <X size={16} className="text-gray-400" />
                        </button>
                    )}
                </div>

                {searched && (
                    <div className="flex gap-2 mt-3 overflow-x-auto">
                        {tabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                                    activeTab === tab.key
                                        ? "bg-teal-500 text-white"
                                        : "bg-gray-100 text-gray-600"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="px-4 mt-4">
                {loading && (
                    <div className="flex justify-center py-10">
                        <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {!loading && searched && totalResults === 0 && (
                    <div className="flex flex-col items-center py-20 text-gray-400">
                        <SearchIcon size={48} className="mb-4 opacity-30" />
                        <p className="text-lg font-medium">No results for "{query}"</p>
                        <p className="text-sm mt-1">Try a different search term</p>
                    </div>
                )}

                {!loading && !searched && (
                    <div className="flex flex-col items-center py-20 text-gray-400">
                        <SearchIcon size={48} className="mb-4 opacity-30" />
                        <p className="text-lg font-medium">Search TravelMates</p>
                        <p className="text-sm mt-1">Find people, trips and posts</p>
                    </div>
                )}

                {!loading && searched && (
                    <>
                        {(activeTab === "all" || activeTab === "users") && results.users.length > 0 && (
                            <div className="mb-6">
                                <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">People</h3>
                                <div className="space-y-2">
                                    {results.users.map((user) => (
                                        <div
                                            key={user.id}
                                            onClick={() => navigate(`/user/${user.username}`)}
                                            className="flex items-center gap-3 bg-white p-3 rounded-xl border hover:bg-gray-50 cursor-pointer"
                                        >
                                            <img
                                                src={getProfilePic(user.profile_pic)}
                                                alt={user.username}
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-900">@{user.username}</p>
                                                {user.full_name && (
                                                    <p className="text-sm text-gray-500 truncate">{user.full_name}</p>
                                                )}
                                                {user.bio && (
                                                    <p className="text-xs text-gray-400 truncate">{user.bio}</p>
                                                )}
                                            </div>
                                            <span className="text-teal-500 text-sm font-medium">View</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(activeTab === "all" || activeTab === "trips") && results.trips.length > 0 && (
                            <div className="mb-6">
                                <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">Trips</h3>
                                <div className="space-y-4">
                                    {results.trips.map((trip) => (
                                        <PostCard key={trip.id} post={trip} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {(activeTab === "all" || activeTab === "posts") && results.posts.length > 0 && (
                            <div className="mb-6">
                                <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">Posts</h3>
                                <div className="space-y-4">
                                    {results.posts.map((post) => (
                                        <PostCard key={`${post.post_type}-${post.id}`} post={post} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}