// frontend/src/components/TripDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

const TripDetail = () => {
    const { id } = useParams();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrip = async () => {
            try {
                const res = await api.get(`/api/posts/${id}/`);
                setTrip(res.data);
            } catch (error) { // The fix is here
                console.error("Failed to fetch trip details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTrip();
    }, [id]);

    if (loading) return <div>Loading trip...</div>;
    if (!trip) return <div>Trip not found.</div>;

    return (
        <div className="container mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
            {/* Header Section */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
                <img 
                    src={`http://127.0.0.1:8000${trip.cover_photo}`} 
                    alt={trip.title}
                    className="w-full h-64 object-cover"
                />
                <div className="p-6">
                    <h1 className="text-4xl font-extrabold text-gray-900">{trip.title}</h1>
                    <p className="mt-2 text-lg text-gray-600">{trip.location_summary}</p>
                    <p className="mt-1 text-sm text-gray-500">
                        Posted by {trip.author}
                    </p>
                </div>
            </div>

            {/* Itinerary Section */}
            <div className="space-y-6">
                {trip.days.map(day => (
                    <div key={day.id} className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-bold text-teal-600">
                            Day {day.day_number}: {day.location_name}
                        </h2>
                        <p className="mt-4 text-gray-700 whitespace-pre-wrap">{day.description}</p>
                        
                        {/* We will add the photo slider and map here later */}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TripDetail;