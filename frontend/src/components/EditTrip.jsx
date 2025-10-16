// frontend/src/pages/EditTrip.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';

const EditTrip = () => {
    const { id } = useParams(); // Gets the trip ID from the URL (e.g., /trip/1/edit)
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);

    // State for the "Add a Day" form
    const [dayNumber, setDayNumber] = useState(1);
    const [locationName, setLocationName] = useState('');
    const [description, setDescription] = useState('');

    const fetchTripDetails = useCallback(async () => {
        try {
            const res = await api.get(`/api/posts/${id}/`);
            setTrip(res.data);
            // Automatically set the next day number
            setDayNumber(res.data.days.length + 1);
        } catch (error) {
            console.error("Failed to fetch trip details:", error);
            alert("Could not load trip details.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchTripDetails();
    }, [fetchTripDetails]);

    const handleAddDay = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post(`/api/posts/${id}/days/`, {
                day_number: dayNumber,
                location_name: locationName,
                description: description,
            });
            // After adding a day, refresh the trip data to show the new day in the list
            fetchTripDetails();
            // Clear the form for the next entry
            setLocationName('');
            setDescription('');
        } catch (error) {
            console.error("Failed to add day:", error);
            alert("An error occurred while adding the day.");
        }
    };

    if (loading) return <div>Loading Trip Editor...</div>;
    if (!trip) return <div>Trip not found.</div>;

    return (
        <div className="container mx-auto p-8">
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <img src={`http://127.0.0.1:8000${trip.cover_photo}`} alt={trip.title} className="w-full h-48 object-cover rounded-t-lg" />
                <div className="p-4">
                    <h1 className="text-3xl font-bold">{trip.title}</h1>
                    <p className="text-gray-600">{trip.location_summary}</p>
                </div>
            </div>

            {/* List of Existing Days */}
            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Your Itinerary</h2>
                {trip.days.length > 0 ? (
                    <div className="space-y-4">
                        {trip.days.map((day) => (
                            <div key={day.id} className="bg-white p-4 rounded-lg shadow">
                                <h3 className="font-bold">Day {day.day_number}: {day.location_name}</h3>
                                <p className="text-gray-700">{day.description}</p>
                                {/* Photo upload section will go here later */}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">No days added yet. Use the form below to start building your itinerary.</p>
                )}
            </div>

            {/* Form to Add a New Day */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-4">Add Day {dayNumber}</h2>
                <form onSubmit={handleAddDay} className="space-y-4">
                    <input
                        type="text"
                        value={locationName}
                        onChange={(e) => setLocationName(e.target.value)}
                        placeholder="Location Name (e.g., North Goa)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                    />
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the day's events, activities, and suggestions..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows="4"
                        required
                    ></textarea>
                    <button type="submit" className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-md">
                        Add Day to Itinerary
                    </button>
                </form>
            </div>
             <div className="text-center mt-8">
                <Link to="/profile" className="text-teal-600 hover:underline">
                    Done Editing? Go back to Profile
                </Link>
            </div>
        </div>
    );
};

export default EditTrip;