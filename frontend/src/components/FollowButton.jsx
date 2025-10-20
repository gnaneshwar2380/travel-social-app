import React, { useEffect, useState } from "react";
import axios from "axios";

const FollowButton = ({ userId, currentUserId, token }) => {
  const [status, setStatus] = useState("loading"); // "follow" | "requested" | "mates" | "self"

  useEffect(() => {
    if (!token || !userId) return;

    // Don't show follow button on your own profile
    if (userId === currentUserId) {
      setStatus("self");
      return;
    }

    axios
      .get(`${import.meta.env.VITE_API_URL}/api/follows/${userId}/is_following/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data.is_following) setStatus("mates");
        else setStatus("follow");
      })
      .catch(() => setStatus("follow"));
  }, [userId, currentUserId, token]);

  const handleFollow = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/follows/${userId}/follow/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
               );
      setStatus("requested");
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnfollow = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/follows/${userId}/unfollow/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStatus("follow");
    } catch (err) {
      console.error(err);
    }
  };

  if (status === "self") return null;

  return (
    <button
      onClick={status === "mates" ? handleUnfollow : handleFollow}
      className={`px-4 py-2 rounded-full text-white font-semibold ${
        status === "mates"
          ? "bg-gray-500 hover:bg-gray-600"
          : status === "requested"
          ? "bg-yellow-500 cursor-not-allowed"
          : "bg-blue-500 hover:bg-blue-600"
      }`}
      disabled={status === "requested"}
    >
      {status === "mates"
        ? "Unfollow"
        : status === "requested"
        ? "Requested"
        : "Follow"}
    </button>
  );
};

export default FollowButton;
