// frontend/src/pages/CreateTrip.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const CreateTrip = () => {
    const [title, setTitle] = useState('');
    const [locationSummary, setLocationSummary] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [coverPhoto, setCoverPhoto] = useState(null);
    const [isJoinable, setIsJoinable] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('location_summary', locationSummary);
        if (startDate) formData.append('start_date', startDate);
        if (endDate) formData.append('end_date', endDate);
        formData.append('cover_photo', coverPhoto);
        formData.append('is_joinable', isJoinable);

        try {
            // The API call creates the main trip "cover"
            const res = await api.post('/api/posts/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            // After creating, redirect to a new page to add days
            // We will build this page in the next step
            alert('Trip created successfully! Now add details for each day.');
            navigate(`/trip/${res.data.id}/edit`);
        } catch (error) {
            console.error('Failed to create trip:', error);
            alert('An error occurred while creating the trip.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-8 max-w-2xl">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Create a New Trip</h1>
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Trip Title</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                        placeholder="e.g., Summer in the Himalayas"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                        type="text"
                        id="location"
                        value={locationSummary}
                        onChange={(e) => setLocationSummary(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                        placeholder="e.g., Goa, India"
                    />
                </div>
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">Start Date</label>
                        <input
                            type="date"
                            id="start-date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>
                    <div className="flex-1">
                        <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">End Date</label>
                        <input
                            type="date"
                            id="end-date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="cover-photo" className="block text-sm font-medium text-gray-700">Cover Photo</label>
                    <input
                        type="file"
                        id="cover-photo"
                        onChange={(e) => setCoverPhoto(e.target.files[0])}
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                        accept="image/*"
                        required
                    />
                </div>
                <div className="flex items-center">
                    <input
                        id="is-joinable"
                        type="checkbox"
                        checked={isJoinable}
                        onChange={(e) => setIsJoinable(e.target.checked)}
                        className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <label htmlFor="is-joinable" className="ml-2 block text-sm text-gray-900">
                        This trip is open for others to join
                    </label>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:opacity-50"
                >
                    {loading ? 'Creating...' : 'Create Trip & Add Days'}
                </button>
            </form>
        </div>
    );
};

export default CreateTrip;