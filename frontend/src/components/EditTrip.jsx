import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';

const EditTrip = () => {
    const { id } = useParams();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [locationName, setLocationName] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [photos, setPhotos] = useState([]);
    const [uploadingPhotos, setUploadingPhotos] = useState(false);
    const [currentDayId, setCurrentDayId] = useState(null);

    const fetchTripDetails = useCallback(async () => {
        try {
            const res = await api.get(`/posts/${id}/`);
            setTrip(res.data);
        } catch (error) {
            console.error('Failed to fetch trip details:', error);
            alert('Could not load trip details.');
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
            const res = await api.post(`/posts/${id}/days/`, {
                day_number: (trip?.days?.length || 0) + 1,
                location_name: locationName,
                description: description,
                date: date || null,
            });

            setCurrentDayId(res.data.id);

            if (photos.length > 0) {
                setUploadingPhotos(true);
                const formData = new FormData();
                photos.forEach((photo) => formData.append('images', photo));
                await api.post(`/days/${res.data.id}/images/`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setUploadingPhotos(false);
            }

            fetchTripDetails();
            setLocationName('');
            setDescription('');
            setDate('');
            setPhotos([]);
        } catch (error) {
            console.error('Failed to add day:', error);
            alert('An error occurred while adding the day.');
        }
    };

    if (loading) return <div className="text-center py-10">Loading Trip Editor...</div>;
    if (!trip) return <div className="text-center py-10">Trip not found.</div>;

    return (
        <div className="container mx-auto p-8 pb-20">
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                {trip.cover_image && (
                    <img
                        src={`http://127.0.0.1:8000${trip.cover_image}`}
                        alt={trip.title}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                )}
                <h1 className="text-3xl font-bold">{trip.title}</h1>
            </div>

            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Your Itinerary</h2>
                {trip.days?.length > 0 ? (
                    <div className="space-y-4">
                        {trip.days.map((day) => (
                            <div key={day.id} className="bg-white p-4 rounded-lg shadow">
                                <h3 className="font-bold">
                                    Day {day.day_number}{day.location_name ? `: ${day.location_name}` : ''}
                                </h3>
                                <p className="text-gray-700 mt-1">{day.description}</p>
                                {day.photos?.length > 0 && (
                                    <div className="flex gap-2 mt-3 flex-wrap">
                                        {day.photos.map((photo) => (
                                            <img
                                                key={photo.id}
                                                src={`http://127.0.0.1:8000${photo.image}`}
                                                alt={photo.caption || 'Day photo'}
                                                className="w-24 h-24 object-cover rounded-lg"
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">No days added yet. Use the form below to start building your itinerary.</p>
                )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-4">
                    Add Day {(trip.days?.length || 0) + 1}
                </h2>
                <form onSubmit={handleAddDay} className="space-y-4">
                    <input
                        type="text"
                        value={locationName}
                        onChange={(e) => setLocationName(e.target.value)}
                        placeholder="Location Name (e.g., North Goa)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                    />
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the day's events, activities and highlights..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows="4"
                        required
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Photos for this day
                        </label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => setPhotos(Array.from(e.target.files))}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                        />
                        {photos.length > 0 && (
                            <p className="text-sm text-gray-500 mt-1">{photos.length} photo(s) selected</p>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={uploadingPhotos}
                        className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50"
                    >
                        {uploadingPhotos ? 'Uploading photos...' : 'Add Day to Itinerary'}
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