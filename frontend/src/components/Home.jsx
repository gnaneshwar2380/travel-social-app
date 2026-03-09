import React, { useEffect, useState, useRef, useCallback } from "react";
import { getForYouFeed } from "../api";
import api from "../api";
import { Search, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PostCard from "./PostCard";
import Stories from "./Stories";
import useRefresh from "./useRefresh";

export default function Home() {
    const [activeTab, setActiveTab] = useState("foryou");
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
   
    const touchStartY = useRef(null);
    const containerRef = useRef(null);
    const navigate = useNavigate();
    const { homeRefreshKey } = useRefresh();

    const fetchFeed = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
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
            setRefreshing(false);
            setPullDistance(0);
           
        }
    }, [activeTab]);

    // Fetch on tab change or home refresh trigger
    useEffect(() => {
        fetchFeed();
    }, [activeTab, homeRefreshKey, fetchFeed]);

    // Pull to refresh touch handlers
    const handleTouchStart = (e) => {
        if (window.scrollY === 0) {
            touchStartY.current = e.touches[0].clientY;
        }
    };

    const handleTouchMove = (e) => {
        if (touchStartY.current === null) return;
        const distance = e.touches[0].clientY - touchStartY.current;
        if (distance > 0 && window.scrollY === 0) {
            
            setPullDistance(Math.min(distance * 0.4, 80));
        }
    };

    const handleTouchEnd = () => {
        if (pullDistance > 50) {
            fetchFeed(true);
        } else {
            setPullDistance(0);
            
        }
        touchStartY.current = null;
    };

    const handleDeletePost = (postId, postType) => {
        setPosts(prev => prev.filter(p => !(p.id === postId && p.post_type === postType)));
    };

    return (
        <div
            ref={containerRef}
            className="max-w-2xl mx-auto pb-20"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Pull to refresh indicator */}
            <div
                className="flex items-center justify-center overflow-hidden transition-all duration-200"
                style={{ height: `${pullDistance}px` }}
            >
                <div className={`flex items-center gap-2 text-teal-500 ${refreshing ? 'animate-spin' : ''}`}>
                    <RefreshCw size={20} className={refreshing || pullDistance > 50 ? 'text-teal-500' : 'text-gray-300'} />
                    <span className="text-sm text-teal-500">
                        {refreshing ? 'Refreshing...' : pullDistance > 50 ? 'Release to refresh' : 'Pull to refresh'}
                    </span>
                </div>
            </div>

            {/* Top Nav */}
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

            {/* Stories */}
            <div className="bg-white border-b overflow-hidden">
                <Stories />
            </div>

            {/* Refreshing spinner */}
            {refreshing && (
                <div className="flex justify-center py-3">
                    <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

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
                {!loading && posts.map((post) => (
                    <PostCard
                        key={`${post.post_type}-${post.id}`}
                        post={post}
                        onDelete={handleDeletePost}
                    />
                ))}
            </div>
        </div>
    );
}