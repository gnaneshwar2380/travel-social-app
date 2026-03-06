import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { MapPin, X } from 'lucide-react';

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

// Reusable Location Search Component
const LocationPicker = ({ value, onChange, onSelect, accentColor = 'teal' }) => {
    const [query, setQuery] = useState(value || '');
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(null);
    const debounceRef = useRef(null);

    useEffect(() => {
        if (query.length < 3) { setSuggestions([]); return; }
        if (selected && selected.display_name === query) return;
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`,
                    { headers: { 'Accept-Language': 'en' } }
                );
                const data = await res.json();
                setSuggestions(data);
            } catch (err) {
                console.error("Location search failed", err);
            } finally {
                setLoading(false);
            }
        }, 400);
    }, [query]); // eslint-disable-line

    const handleSelect = (place) => {
        const name = place.display_name.split(',').slice(0, 3).join(',');
        setQuery(name);
        setSelected(place);
        setSuggestions([]);
        onChange(name);
        onSelect({ lat: parseFloat(place.lat), lng: parseFloat(place.lon), name });
    };

    const handleClear = () => {
        setQuery('');
        setSelected(null);
        setSuggestions([]);
        onChange('');
        onSelect(null);
    };

    const ringColor = accentColor === 'teal' ? 'focus:ring-teal-500 focus:border-teal-500'
        : accentColor === 'blue' ? 'focus:ring-blue-500 focus:border-blue-500'
        : 'focus:ring-purple-500 focus:border-purple-500';

    return (
        <div className="relative">
            <div className="relative">
                <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); setSelected(null); }}
                    className={`w-full pl-9 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none ${ringColor}`}
                    placeholder="Search location... e.g. Goa, India"
                />
                {query && (
                    <button type="button" onClick={handleClear} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Loading */}
            {loading && (
                <div className="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1 px-4 py-2 text-sm text-gray-500">
                    Searching...
                </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                    {suggestions.map((place) => (
                        <button
                            key={place.place_id}
                            type="button"
                            onClick={() => handleSelect(place)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b last:border-0"
                        >
                            <div className="flex items-start gap-2">
                                <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-gray-800 line-clamp-1">
                                        {place.display_name.split(',')[0]}
                                    </p>
                                    <p className="text-xs text-gray-400 line-clamp-1">
                                        {place.display_name.split(',').slice(1, 3).join(',')}
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Selected confirmation */}
            {selected && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <MapPin size={12} /> Location pinned on map ✓
                </p>
            )}
        </div>
    );
};

const CreateTrip = () => {
    const [selectedType, setSelectedType] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Experience
    const [expTitle, setExpTitle] = useState('');
    const [expCoverImage, setExpCoverImage] = useState(null);
    const [expLocation, setExpLocation] = useState('');
    const [expCoords, setExpCoords] = useState(null);

    // Joinable
    const [joinTitle, setJoinTitle] = useState('');
    const [joinDestination, setJoinDestination] = useState('');
    const [joinCoords, setJoinCoords] = useState(null);
    const [joinBudget, setJoinBudget] = useState('');
    const [joinStartDate, setJoinStartDate] = useState('');
    const [joinEndDate, setJoinEndDate] = useState('');
    const [joinDetails, setJoinDetails] = useState('');
    const [joinMinMembers, setJoinMinMembers] = useState(1);
    const [joinMaxMembers, setJoinMaxMembers] = useState(10);
    const [joinImages, setJoinImages] = useState([]);

    // General
    const [generalDescription, setGeneralDescription] = useState('');
    const [generalImages, setGeneralImages] = useState([]);
    const [generalLocation, setGeneralLocation] = useState('');
    const [generalCoords, setGeneralCoords] = useState(null);

    const handleExperienceSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();
        formData.append('title', expTitle);
        if (expCoverImage) formData.append('cover_image', expCoverImage);
        if (expCoords) {
            formData.append('latitude', expCoords.lat);
            formData.append('longitude', expCoords.lng);
        }
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
        if (joinCoords) {
            formData.append('latitude', joinCoords.lat);
            formData.append('longitude', joinCoords.lng);
        }
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
        if (generalCoords) {
            formData.append('latitude', generalCoords.lat);
            formData.append('longitude', generalCoords.lng);
        }
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
            <button onClick={() => setSelectedType(null)} className="text-teal-600 hover:underline mb-6 block">
                ← Back
            </button>

            {/* EXPERIENCE */}
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                📍 Location <span className="text-gray-400 font-normal">(optional)</span>
                            </label>
                            <LocationPicker
                                value={expLocation}
                                onChange={setExpLocation}
                                onSelect={setExpCoords}
                                accentColor="teal"
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

            {/* JOINABLE */}
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
                            <LocationPicker
                                value={joinDestination}
                                onChange={setJoinDestination}
                                onSelect={(coords) => {
                                    setJoinCoords(coords);
                                    if (coords) setJoinDestination(coords.name);
                                }}
                                accentColor="blue"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Budget (₹)</label>
                            <input
                                type="number"
                                value={joinBudget}
                                onChange={(e) => setJoinBudget(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                <input
                                    type="date"
                                    value={joinEndDate}
                                    onChange={(e) => setJoinEndDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    min="1"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max Members</label>
                                <input
                                    type="number"
                                    value={joinMaxMembers}
                                    onChange={(e) => setJoinMaxMembers(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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

            {/* GENERAL */}
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                📍 Location <span className="text-gray-400 font-normal">(optional)</span>
                            </label>
                            <LocationPicker
                                value={generalLocation}
                                onChange={setGeneralLocation}
                                onSelect={setGeneralCoords}
                                accentColor="purple"
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