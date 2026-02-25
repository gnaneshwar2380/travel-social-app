import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const POST_TYPES = [
    {
        id: 'experience',
        title: 'Experience Post',
        description: 'Share your trip day by day with photos and activities',
        icon: '🗺️',
        color: 'border-teal-500 bg-teal-50',
    },
    {
        id: 'joinable',
        title: 'Joinable Trip',
        description: 'Planning a trip? Let others join you',
        icon: '👥',
        color: 'border-blue-500 bg-blue-50',
    },
    {
        id: 'general',
        title: 'General Post',
        description: 'Share a quick travel photo or thought',
        icon: '📸',
        color: 'border-purple-500 bg-purple-50',
    },
];

const CreateTrip = () => {
    const [selectedType, setSelectedType] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [expTitle, setExpTitle] = useState('');
    const [expCoverImage, setExpCoverImage] = useState(null);

    const [joinTitle, setJoinTitle] = useState('');
    const [joinDestination, setJoinDestination] = useState('');
    const [joinBudget, setJoinBudget] = useState('');
    const [joinStartDate, setJoinStartDate] = useState('');
    const [joinEndDate, setJoinEndDate] = useState('');
    const [joinDetails, setJoinDetails] = useState('');
    const [joinMinMembers, setJoinMinMembers] = useState(1);
    const [joinMaxMembers, setJoinMaxMembers] = useState(10);
    const [joinImages, setJoinImages] = useState([]);

    const [generalDescription, setGeneralDescription] = useState('');
    const [generalImages, setGeneralImages] = useState([]);

    const handleExperienceSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();
        formData.append('title', expTitle);
        if (expCoverImage) formData.append('cover_image', expCoverImage);
        try {
            const res = await api.post('/posts/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            navigate(`/trip/${res.data.id}/edit`);
        } catch (error) {
            console.error('Failed to create experience post:', error);
            alert('Failed to create post.');
        } finally {
            setLoading(false);
        }
    };

    const handleJoinableSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();
        formData.append('title', joinTitle);
        formData.append('destination', joinDestination);
        formData.append('budget', joinBudget);
        formData.append('start_date', joinStartDate);
        formData.append('end_date', joinEndDate);
        formData.append('details', joinDetails);
        formData.append('min_members', joinMinMembers);
        formData.append('max_members', joinMaxMembers);
        joinImages.forEach((img) => formData.append('images', img));
        try {
            const res = await api.post('/joinable-trips/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            navigate(`/joinable-trip/${res.data.id}`);
        } catch (error) {
            console.error('Failed to create joinable trip:', error);
            alert('Failed to create joinable trip.');
        } finally {
            setLoading(false);
        }
    };

    const handleGeneralSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();
        formData.append('description', generalDescription);
        generalImages.forEach((img) => formData.append('images', img));
        try {
            await api.post('/general-posts/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            navigate('/');
        } catch (error) {
            console.error('Failed to create general post:', error);
            alert('Failed to create post.');
        } finally {
            setLoading(false);
        }
    };

    if (!selectedType) {
        return (
            <div className="max-w-2xl mx-auto p-8 pb-20">
                <h1 className="text-3xl font-bold mb-2 text-gray-800">Create a Post</h1>
                <p className="text-gray-500 mb-8">What would you like to share?</p>
                <div className="space-y-4">
                    {POST_TYPES.map((type) => (
                        <button
                            key={type.id}
                            onClick={() => setSelectedType(type.id)}
                            className={`w-full text-left p-5 rounded-xl border-2 ${type.color} hover:shadow-md transition`}
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-4xl">{type.icon}</span>
                                <div>
                                    <h2 className="font-bold text-lg text-gray-800">{type.title}</h2>
                                    <p className="text-gray-500 text-sm">{type.description}</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-8 pb-20">
            <button
                onClick={() => setSelectedType(null)}
                className="text-teal-600 hover:underline mb-6 block"
            >
                ← Back
            </button>

            {selectedType === 'experience' && (
                <>
                    <h1 className="text-3xl font-bold mb-6 text-gray-800">Create Experience Post</h1>
                    <form onSubmit={handleExperienceSubmit} className="space-y-5 bg-white p-8 rounded-xl shadow">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Trip Title</label>
                            <input
                                type="text"
                                value={expTitle}
                                onChange={(e) => setExpTitle(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                placeholder="e.g. My Goa Adventure"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cover Photo</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setExpCoverImage(e.target.files[0])}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create & Add Days'}
                        </button>
                    </form>
                </>
            )}

            {selectedType === 'joinable' && (
                <>
                    <h1 className="text-3xl font-bold mb-6 text-gray-800">Create Joinable Trip</h1>
                    <form onSubmit={handleJoinableSubmit} className="space-y-5 bg-white p-8 rounded-xl shadow">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Trip Title</label>
                            <input
                                type="text"
                                value={joinTitle}
                                onChange={(e) => setJoinTitle(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                placeholder="e.g. Himalaya Trek 2026"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                            <input
                                type="text"
                                value={joinDestination}
                                onChange={(e) => setJoinDestination(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                placeholder="e.g. Manali, Himachal Pradesh"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Budget (₹)</label>
                            <input
                                type="number"
                                value={joinBudget}
                                onChange={(e) => setJoinBudget(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                placeholder="e.g. 15000"
                                required
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    value={joinStartDate}
                                    onChange={(e) => setJoinStartDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                    required
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                <input
                                    type="date"
                                    value={joinEndDate}
                                    onChange={(e) => setJoinEndDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Trip Details</label>
                            <textarea
                                value={joinDetails}
                                onChange={(e) => setJoinDetails(e.target.value)}
                                rows="4"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                placeholder="Describe your trip plan, what to expect, what to bring..."
                                required
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Min Members</label>
                                <input
                                    type="number"
                                    value={joinMinMembers}
                                    onChange={(e) => setJoinMinMembers(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                    min="1"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max Members</label>
                                <input
                                    type="number"
                                    value={joinMaxMembers}
                                    onChange={(e) => setJoinMaxMembers(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                    min="1"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Trip Photos</label>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) => setJoinImages(Array.from(e.target.files))}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Joinable Trip'}
                        </button>
                    </form>
                </>
            )}

            {selectedType === 'general' && (
                <>
                    <h1 className="text-3xl font-bold mb-6 text-gray-800">Create General Post</h1>
                    <form onSubmit={handleGeneralSubmit} className="space-y-5 bg-white p-8 rounded-xl shadow">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">What's on your mind?</label>
                            <textarea
                                value={generalDescription}
                                onChange={(e) => setGeneralDescription(e.target.value)}
                                rows="4"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                placeholder="Share your travel thoughts, tips or memories..."
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Photos</label>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) => setGeneralImages(Array.from(e.target.files))}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50"
                        >
                            {loading ? 'Posting...' : 'Share Post'}
                        </button>
                    </form>
                </>
            )}
        </div>
    );
};

export default CreateTrip;