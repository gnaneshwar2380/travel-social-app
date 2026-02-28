import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import PostCard from "./PostCard";

const UserProfile = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [activeTab, setActiveTab] = useState("Trips");
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

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
            } catch (err) {
                console.error("Failed to load posts", err);
            }
        };
        if (activeTab === "Trips") fetchPosts();
    }, [activeTab, profile, username]);

    const handleFollow = async () => {
        try {
            const res = await api.post(`/follows/${profile.id}/toggle/`);
            setIsFollowing(res.data.status === "followed");
        } catch (err) {
            console.error("Failed to follow", err);
        }
    };

    if (loading) return <div className="text-center py-10">Loading profile...</div>;
    if (!profile) return <div className="text-center py-10">User not found.</div>;

    const isOwnProfile = currentUser?.id === profile.id;

    const getProfilePic = (pic) => {
        if (!pic) return "/default-avatar.png";
        return pic.startsWith("http") ? pic : `http://127.0.0.1:8000${pic}`;
    };

    return (
        <div className="min-h-screen bg-gray-100 pb-20">
            <div
                className="h-48 bg-teal-500"
                style={profile.cover_pic ? {
                    backgroundImage: `url(${getProfilePic(profile.cover_pic)})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                } : {}}
            ></div>

            <div className="max-w-4xl mx-auto px-4 -mt-20">
                <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
                    <img
                        className="h-32 w-32 rounded-full border-4 border-white object-cover"
                        src={getProfilePic(profile.profile_pic)}
                        alt="Profile"
                    />
                    <h1 className="text-2xl font-bold mt-4">{profile.username}</h1>
                    {profile.full_name && (
                        <p className="text-gray-500 text-sm">{profile.full_name}</p>
                    )}
                    {profile.bio && (
                        <p className="text-gray-600 text-center mt-2">{profile.bio}</p>
                    )}

                    {!isOwnProfile && (
                        <button
                            onClick={handleFollow}
                            className={`mt-4 px-6 py-2 rounded-full font-semibold text-sm ${
                                isFollowing
                                    ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    : "bg-teal-500 text-white hover:bg-teal-600"
                            }`}
                        >
                            {isFollowing ? "Unfollow" : "Follow"}
                        </button>
                    )}

                    {isOwnProfile && (
                        <button
                            onClick={() => navigate("/profile")}
                            className="mt-4 px-6 py-2 rounded-full font-semibold text-sm bg-gray-200 text-gray-700 hover:bg-gray-300"
                        >
                            Go to My Profile
                        </button>
                    )}

                    <div className="mt-6 border-b border-gray-200 w-full">
                        <nav className="-mb-px flex space-x-8 justify-center">
                            {["Trips"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={
                                        activeTab === tab
                                            ? "border-teal-500 text-teal-600 py-4 px-1 border-b-2 font-medium text-sm"
                                            : "border-transparent text-gray-500 py-4 px-1 border-b-2 font-medium text-sm"
                                    }
                                >
                                    {tab}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="mt-8 w-full">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {posts.length > 0 ? (
                                posts.map((post) => (
                                    <PostCard key={post.id} post={post} />
                                ))
                            ) : (
                                <p className="col-span-full text-center text-gray-500">
                                    No trips posted yet.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
