import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const createCustomIcon = (color) => L.divIcon({
    className: '',
    html: `<div style="background:${color};width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

const experienceIcon = createCustomIcon('#14b8a6');
const joinableIcon = createCustomIcon('#3b82f6');
const generalIcon = createCustomIcon('#a855f7');

export default function Explore() {
    const [trips, setTrips] = useState([]);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [budgetMax, setBudgetMax] = useState(100000);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [joinRes, expRes, genRes] = await Promise.all([
                    api.get("/joinable-trips/"),
                    api.get("/posts/"),
                    api.get("/general-posts/"),
                ]);
                const joinable = joinRes.data.map(t => ({ ...t, post_type: 'joinable' }));
                const experience = expRes.data.map(t => ({ ...t, post_type: 'experience' }));
                const general = genRes.data.map(t => ({ ...t, post_type: 'general' }));
                setTrips([...joinable, ...experience, ...general]);
            } catch (err) {
                console.error("Failed to load trips", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getImage = (trip) => {
        const img = trip.cover_image || trip.images?.[0]?.image;
        if (!img) return null;
        return img.startsWith("http") ? img : `http://127.0.0.1:8000${img}`;
    };

    const filteredTrips = trips.filter(t => {
        if (filter !== "all" && t.post_type !== filter) return false;
        if (search && !JSON.stringify(t).toLowerCase().includes(search.toLowerCase())) return false;
        if (t.post_type === 'joinable' && t.budget > budgetMax) return false;
        return true;
    });

    const joinableTrips = filteredTrips.filter(t => t.post_type === 'joinable');
    const joinableWithCoords = joinableTrips.filter(t => t.latitude && t.longitude);
    const experienceWithCoords = filteredTrips.filter(t => t.post_type === 'experience' && t.latitude && t.longitude);
    const generalWithCoords = filteredTrips.filter(t => t.post_type === 'general' && t.latitude && t.longitude);
    const totalOnMap = joinableWithCoords.length + experienceWithCoords.length + generalWithCoords.length;

    const filterTabs = [
        { key: "all", label: "All", color: "bg-gray-700" },
        { key: "joinable", label: "✈️ Trips", color: "bg-blue-500" },
        { key: "experience", label: "🌟 Experiences", color: "bg-teal-500" },
        { key: "general", label: "📸 Posts", color: "bg-purple-500" },
    ];

    return (
        <div className="h-screen flex flex-col pb-16">
            {/* Header */}
            <div className="bg-white border-b px-4 py-3 z-10">
                <h1 className="font-bold text-lg text-gray-800 mb-2">🗺️ Explore</h1>
                <input
                    type="text"
                    placeholder="Search destinations..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-gray-100 rounded-full px-4 py-2 text-sm outline-none mb-2"
                />
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {filterTabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap text-white ${
                                filter === tab.key ? tab.color : 'bg-gray-300'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                    {filter === 'joinable' && (
                        <div className="flex items-center gap-2 ml-2">
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                                Budget: ₹{budgetMax.toLocaleString()}
                            </span>
                            <input
                                type="range"
                                min={1000}
                                max={200000}
                                step={1000}
                                value={budgetMax}
                                onChange={(e) => setBudgetMax(Number(e.target.value))}
                                className="w-24"
                            />
                        </div>
                    )}
                </div>

                {/* Legend */}
                <div className="flex gap-3 mt-2">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                        <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span> Trips
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                        <span className="w-3 h-3 rounded-full bg-teal-500 inline-block"></span> Experiences
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                        <span className="w-3 h-3 rounded-full bg-purple-500 inline-block"></span> Posts
                    </span>
                </div>
            </div>

            {/* Map */}
            <div className="flex-1 relative">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <>
                        <MapContainer
                            center={[20.5937, 78.9629]}
                            zoom={5}
                            style={{ height: "100%", width: "100%" }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            {/* Joinable trips */}
                            {joinableWithCoords.map((trip) => (
                                <Marker
                                    key={`joinable-${trip.id}`}
                                    position={[trip.latitude, trip.longitude]}
                                    icon={joinableIcon}
                                >
                                    <Popup>
                                        <div className="w-48">
                                            {getImage(trip) && (
                                                <img src={getImage(trip)} alt={trip.title}
                                                    className="w-full h-24 object-cover rounded-lg mb-2" />
                                            )}
                                            <p className="font-bold text-sm">{trip.title}</p>
                                            <p className="text-xs text-gray-500">📍 {trip.destination}</p>
                                            <p className="text-xs text-gray-500">💰 ₹{trip.budget}</p>
                                            <p className="text-xs text-gray-500">👥 {trip.max_members} spots</p>
                                            <button
                                                onClick={() => navigate(`/joinable-trip/${trip.id}`)}
                                                className="mt-2 w-full bg-blue-500 text-white text-xs py-1 rounded-full font-semibold"
                                            >
                                                View Trip
                                            </button>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}

                            {/* Experience posts */}
                            {experienceWithCoords.map((trip) => (
                                <Marker
                                    key={`exp-${trip.id}`}
                                    position={[trip.latitude, trip.longitude]}
                                    icon={experienceIcon}
                                >
                                    <Popup>
                                        <div className="w-48">
                                            {getImage(trip) && (
                                                <img src={getImage(trip)} alt={trip.title}
                                                    className="w-full h-24 object-cover rounded-lg mb-2" />
                                            )}
                                            <p className="font-bold text-sm">{trip.title}</p>
                                            <p className="text-xs text-gray-500">by @{trip.author?.username}</p>
                                            <button
                                                onClick={() => navigate(`/trip/${trip.id}`)}
                                                className="mt-2 w-full bg-teal-500 text-white text-xs py-1 rounded-full font-semibold"
                                            >
                                                View Experience
                                            </button>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}

                            {/* General posts */}
                            {generalWithCoords.map((post) => (
                                <Marker
                                    key={`general-${post.id}`}
                                    position={[post.latitude, post.longitude]}
                                    icon={generalIcon}
                                >
                                    <Popup>
                                        <div className="w-48">
                                            {post.images?.[0]?.image && (
                                                <img
                                                    src={post.images[0].image.startsWith("http")
                                                        ? post.images[0].image
                                                        : `http://127.0.0.1:8000${post.images[0].image}`}
                                                    alt="post"
                                                    className="w-full h-24 object-cover rounded-lg mb-2"
                                                />
                                            )}
                                            <p className="text-sm text-gray-700 line-clamp-2">{post.description}</p>
                                            <p className="text-xs text-gray-500 mt-1">by @{post.author?.username}</p>
                                            <button
                                                onClick={() => navigate(`/general-post/${post.id}`)}
                                                className="mt-2 w-full bg-purple-500 text-white text-xs py-1 rounded-full font-semibold"
                                            >
                                                View Post
                                            </button>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>

                        {/* Empty state overlay */}
                        {totalOnMap === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="bg-white/90 rounded-2xl px-6 py-4 text-center shadow-lg">
                                    <p className="text-2xl mb-1">📍</p>
                                    <p className="font-semibold text-gray-700 text-sm">No pinned locations yet</p>
                                    <p className="text-gray-400 text-xs mt-1">Create a post and add a location to see it here</p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Trip Cards at bottom */}
            {filter === 'joinable' && joinableTrips.length > 0 && (
                <div className="bg-white border-t">
                    <p className="px-4 pt-2 text-xs font-semibold text-gray-400">
                        {joinableTrips.length} trips · {joinableWithCoords.length} on map
                    </p>
                    <div className="flex gap-3 px-4 py-2 overflow-x-auto">
                        {joinableTrips.slice(0, 10).map((trip) => (
                            <div
                                key={trip.id}
                                onClick={() => navigate(`/joinable-trip/${trip.id}`)}
                                className="flex-shrink-0 w-36 bg-white rounded-xl border shadow-sm overflow-hidden cursor-pointer"
                            >
                                {getImage(trip) ? (
                                    <img src={getImage(trip)} alt={trip.title} className="w-full h-20 object-cover" />
                                ) : (
                                    <div className="w-full h-20 bg-gradient-to-br from-blue-400 to-teal-500 flex items-center justify-center">
                                        <span className="text-2xl">✈️</span>
                                    </div>
                                )}
                                <div className="p-2">
                                    <p className="font-semibold text-xs truncate">{trip.title}</p>
                                    <p className="text-xs text-gray-400 truncate">📍 {trip.destination}</p>
                                    <p className="text-xs text-blue-500 font-semibold">₹{trip.budget}</p>
                                    {trip.latitude && (
                                        <p className="text-xs text-green-500">📌 On map</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}