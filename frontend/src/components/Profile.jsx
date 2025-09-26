// 1. Import useCallback
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import EditProfileModal from './EditProfileModal';
import PostCard from './PostCard.jsx';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('Uniqe');
    const [posts, setPosts] = useState([]);

    // 2. Move fetchProfile out here and wrap it in useCallback
    const fetchProfile = useCallback(async () => {
        try {
            const token = localStorage.getItem('access_token');
            const res = await axios.get('http://127.0.0.1:8000/api/profile/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setProfile(res.data);
        } catch (error) {
            console.error("Failed to fetch profile", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const res = await axios.get('http://127.0.0.1:8000/api/posts/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setPosts(res.data);
            } catch (error) {
                console.error("Failed to fetch posts", error);
            }
        };

        if (activeTab === 'Trips') {
            fetchPosts();
        }
    }, [activeTab]);

    if (loading) return <div>Loading your profile...</div>;
    if (!profile) return <div>Could not load profile.</div>;

    return (
        <div className="min-h-screen bg-gray-100">
            <Link to="/logout" className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 z-10">
                Logout
            </Link>
            <div className="h-48 bg-teal-500"></div>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="-mt-20">
                    <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-lg relative">
                        <button onClick={() => setIsModalOpen(true)} className="absolute top-4 right-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-3 rounded-full text-xs">
                            Edit
                        </button>
                        <img
                            className="h-32 w-32 rounded-full border-4 border-white object-cover"
                             src={profile.profile?.profile_picture}
                            alt="Profile"
                        />
                        {/* ... (rest of the profile UI is the same) ... */}
                        <div className="flex items-center space-x-2 mt-4">
                            <h1 className="text-2xl font-bold text-gray-900">{profile.username}</h1>
                            <span className="bg-gray-200 text-gray-700 text-sm font-semibold px-2.5 py-0.5 rounded-full">
                                {profile.trips_count} Trips
                            </span>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="mt-6 border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                <button onClick={() => setActiveTab('Uniqe')} className={activeTab === 'Uniqe' ? "border-teal-500 text-teal-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"}>
                                    Uniqe
                                </button>
                                <button onClick={() => setActiveTab('Trips')} className={activeTab === 'Trips' ? "border-teal-500 text-teal-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"}>
                                    Trips
                                </button>
                                <button onClick={() => setActiveTab('Mates')} className={activeTab === 'Mates' ? "border-teal-500 text-teal-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"}>
                                    Mates
                                </button>
                            </nav>
                        </div>
                    </div>
                    {/* ... (Post Feed Area is the same) ... */}
                    <div className="mt-8">
                        {activeTab === 'Trips' && (
                            <div>
                                {posts.map(post => <PostCard key={post.id} post={post} />)}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 3. Pass the fetchProfile function to the modal */}
            {isModalOpen && (
                <EditProfileModal
                    onClose={() => setIsModalOpen(false)}
                    onUploadSuccess={fetchProfile}
                />
            )}
        </div>
    );
};

export default Profile;