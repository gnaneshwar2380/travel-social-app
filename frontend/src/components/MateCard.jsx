import React from "react";

const MateCard = ({ mate }) => (
  <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow">
    <img
      src={mate.profile_picture || "/default.jpg"}
      alt={mate.username}
      className="w-12 h-12 rounded-full object-cover"
    />
    <div>
      <h3 className="font-semibold">{mate.username}</h3>
    </div>
  </div>
);

export default MateCard;
