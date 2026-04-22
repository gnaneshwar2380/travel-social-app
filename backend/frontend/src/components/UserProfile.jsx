import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import PostCard from "./PostCard";
import Stories from "./Stories";
import { getMediaUrl } from "../utils";

const UserProfile = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [activeTab, setActiveTab] = useState("Trips");
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [mates, setMates] = useState([]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const [profileRes, currentUserRes] = await Promise.all([
                    api.get(`/profile/${username}/`),
                    api.get("/profile/"),
                ]);
                setProfile(profileRes.data);
                setCurrentUser(currentUserRes.data);
                const followRes = await api.get(`/follows/${profileRes.data.id}/is_following/`);
                setIsFollowing(followRes.data.is_following);
                const statsRes = await api.get(`/profile/${username}/stats/`);
                setStats(statsRes.data);
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
            if (!profile) return;
            try {
                const [expRes, joinRes, genRes] = await Promise.all([
                    api.get(`/posts/${username}/user/`),
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
            } catch (err) { console.error("Failed to load posts", err); }
        };
        if (activeTab === "Trips") fetchPosts();
    }, [activeTab, profile, username]);

    useEffect(() => {
        const fetchMates = async () => {
            if (!profile) return;
            try {
                const [followingRes, followersRes] = await Promise.all([
                    api.get(`/follows/${profile.id}/following/`),
                    api.get(`/follows/${profile.id}/followers/`),
                ]);
                const followingIds = new Set(followingRes.data.map(u => u.id));
                const mutual = followersRes.data.filter(u => followingIds.has(u.id));
                setMates(mutual);
            } catch (err) { console.error("Failed to fetch mates", err); }
        };
        if (activeTab === "Mates") fetchMates();
    }, [activeTab, profile]);

    const handleFollow = async () => {
        try {
            const res = await api.post(`/follows/${profile.id}/toggle/`);
            setIsFollowing(res.data.status === "followed");
            setStats(prev => prev ? {
                ...prev,
                followers_count: res.data.status === "followed"
                    ? prev.followers_count + 1
                    : prev.followers_count - 1
            } : prev);
        } catch (err) { console.error("Failed to follow", err); }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
    if (!profile) return <div className="text-center py-20 text-gray-500">User not found.</div>;

    const isOwnProfile = currentUser?.id === profile.id;

    return (
        <div className="min-h-screen bg-gray-100 pb-20">
            <div className="h-48 bg-teal-500"
                style={profile.cover_pic ? {
                    backgroundImage: `url(${getMediaUrl(profile.cover_pic)})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                } : {}}>
            </div>
            <div className="bg-white border-b shadow-sm mt-2">
                <Stories filterUserId={profile?.id} />
            </div>

            <div className="max-w-4xl mx-auto px-4 -mt-20">
                <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
                    <img className="h-32 w-32 rounded-full border-4 border-white object-cover"
                        src={getMediaUrl(profile.profile_pic)} alt="Profile" />
                    <h1 className="text-2xl font-bold mt-4">{profile.username}</h1>
                    {profile.full_name && <p className="text-gray-500 text-sm">{profile.full_name}</p>}
                    {profile.bio && <p className="text-gray-600 text-center mt-2">{profile.bio}</p>}

                    {stats && (
                        <div className="flex gap-6 mt-5 text-center">
                            <div><p className="font-bold text-lg text-gray-900">{stats.total_posts}</p><p className="text-xs text-gray-500">Posts</p></div>
                            <div><p className="font-bold text-lg text-gray-900">{stats.followers_count}</p><p className="text-xs text-gray-500">Followers</p></div>
                            <div><p className="font-bold text-lg text-gray-900">{stats.following_count}</p><p className="text-xs text-gray-500">Following</p></div>
                            <div><p className="font-bold text-lg text-gray-900">{stats.unique_destinations}</p><p className="text-xs text-gray-500">Destinations</p></div>
                            <div><p className="font-bold text-lg text-gray-900">{stats.total_trips}</p><p className="text-xs text-gray-500">Trips</p></div>
                        </div>
                    )}

                    {stats?.badges?.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2 justify-center">
                            {stats.badges.map((badge, i) => (
                                <span key={i} className="flex items-center gap-1 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold px-3 py-1 rounded-full">
                                    {badge.icon} {badge.label}
                                </span>
                            ))}
                        </div>
                    )}

                    {!isOwnProfile && (
                        <button onClick={handleFollow}
                            className={`mt-5 px-8 py-2 rounded-full font-semibold text-sm ${isFollowing ? "bg-gray-200 text-gray-700 hover:bg-gray-300" : "bg-teal-500 text-white hover:bg-teal-600"}`}>
                            {isFollowing ? "Unfollow" : "Follow"}
                        </button>
                    )}

                    {isOwnProfile && (
                        <button onClick={() => navigate("/profile")}
                            className="mt-5 px-8 py-2 rounded-full font-semibold text-sm bg-gray-200 text-gray-700 hover:bg-gray-300">
                            Go to My Profile
                        </button>
                    )}

                    <div className="mt-6 border-b border-gray-200 w-full">
                        <nav className="-mb-px flex space-x-8 justify-center">
                            {["Trips", "Mates"].map((tab) => (
                                <button key={tab} onClick={() => setActiveTab(tab)}
                                    className={activeTab === tab
                                        ? "border-teal-500 text-teal-600 py-4 px-1 border-b-2 font-medium text-sm"
                                        : "border-transparent text-gray-500 py-4 px-1 border-b-2 font-medium text-sm"}>
                                    {tab}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="mt-8 w-full">
                        {activeTab === "Trips" && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {posts.length > 0 ? (
                                    posts.map((post) => <PostCard key={`${post.post_type}-${post.id}`} post={post} />)
                                ) : (
                                    <div className="col-span-full flex flex-col items-center py-16 text-gray-400">
                                        <span className="text-5xl mb-4">✈️</span>
                                        <p className="font-medium text-lg">No posts yet</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "Mates" && (
                            <div>
                                {mates.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        {mates.map((mate) => (
                                            <div key={mate.id} onClick={() => navigate(`/user/${mate.username}`)}
                                                className="bg-white shadow rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50">
                                                <img src={getMediaUrl(mate.profile_pic)} alt={mate.username}
                                                    className="w-12 h-12 rounded-full object-cover" />
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
                                    </div>
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