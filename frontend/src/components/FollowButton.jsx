import React, { useEffect, useState } from "react";
import api from "../api";

const FollowButton = ({ userId, currentUserId }) => {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!userId) return;

    if (userId === currentUserId) {
      setStatus("self");
      return;
    }

    api.get(`/follows/${userId}/is_following/`)
      .then((res) => {
        setStatus(res.data.is_following ? "following" : "follow");
      })
      .catch(() => setStatus("follow"));
  }, [userId, currentUserId]);

  const handleFollow = async () => {
    try {
      const res = await api.post(`/follows/${userId}/toggle/`);
      setStatus(res.data.status === "followed" ? "following" : "follow");
    } catch (err) {
      console.error(err);
    }
  };

  if (status === "self" || status === "loading") return null;

  return (
    <button
      onClick={handleFollow}
      className={`px-4 py-2 rounded-full text-white font-semibold ${
        status === "following"
          ? "bg-gray-500 hover:bg-gray-600"
          : "bg-teal-500 hover:bg-teal-600"
      }`}
    >
      {status === "following" ? "Unfollow" : "Follow"}
    </button>
  );
};

export default FollowButton;