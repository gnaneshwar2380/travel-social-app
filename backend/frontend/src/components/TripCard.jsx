import React from "react";

const TripCard = ({ trip, onJoin }) => (
  <div className="p-4 bg-white rounded-2xl shadow flex flex-col gap-2">
    <img
      src={trip.cover_photo || "/trip_default.jpg"}
      alt={trip.title}
      className="w-full h-40 object-cover rounded-xl"
    />
    <div>
      <h2 className="text-lg font-bold">{trip.title}</h2>
      <p className="text-gray-600">{trip.location_summary}</p>
      <p className="text-sm text-gray-500">
        {trip.start_date} → {trip.end_date}
      </p>
    </div>
    {trip.is_joinable && (
      <button
        onClick={() => onJoin(trip.id)}
        className="mt-2 bg-blue-600 text-white py-1 rounded-lg hover:bg-blue-700"
      >
        Join Trip
      </button>
    )}
  </div>
);

export default TripCard;
