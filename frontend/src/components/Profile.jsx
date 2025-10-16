import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api'; 
import EditProfileModal from './EditProfileModal';
import PostCard from './PostCard'; // It's common practice to omit the .jsx extension

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('Trips'); // Changed default to 'Trips'
    const [posts, setPosts] = useState([]);

    const fetchProfile = useCallback(async () => {
        try {
            const res = await api.get('/api/profile/');
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
                // Simplified: The interceptor in api.js handles the token automatically!
                const res = await api.get('/api/posts/');
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

    const profilePictureUrl = profile.profile?.profile_picture
        ? `http://127.0.0.1:8000${profile.profile.profile_picture}`
        : `http://127.0.0.1:8000/media/profile_pics/default.jpg`;

    return (
        <div className="min-h-screen bg-gray-100">
            <Link to="/logout" className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 z-10">
                Logout
            </Link>
            <div className="h-48 bg-teal-500"></div>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="-mt-20">
                    <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-lg relative">
                        <img
                            className="h-32 w-32 rounded-full border-4 border-white object-cover"
                            src={profilePictureUrl}
                            alt="Profile"
                        />
                        <div className="flex items-center space-x-2 mt-4">
                            <h1 className="text-2xl font-bold text-gray-900">{profile.username}</h1>
                        </div>

                        {/* --- KEY CHANGE: Action Buttons --- */}
                        <div className="mt-4 flex space-x-4">
                            <button onClick={() => setIsModalOpen(true)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-full text-sm">
                                Edit Profile
                            </button>
                            <Link to="/create-trip" className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-full text-sm">
                                + Create New Trip
                            </Link>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="mt-6 border-b border-gray-200 w-full">
                            <nav className="-mb-px flex space-x-8 justify-center" aria-label="Tabs">
                                <button onClick={() => setActiveTab('Travelwonder')} className={activeTab === 'Travelwonder' ? "border-teal-500 text-teal-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"}>
                                    Travelwonder
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
                    
                    <div className="mt-8">
                        {activeTab === 'Trips' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {posts.length > 0 
                                    ? posts.map(post => <PostCard key={post.id} post={post} />) 
                                    : <p className="col-span-full text-center text-gray-500">No trips posted yet. Click 'Create New Trip' to get started!</p>
                                }
                            </div>
                        )}
                    </div>
                </div>
            </div>

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