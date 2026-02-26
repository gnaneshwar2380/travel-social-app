import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { Send, ArrowLeft, Users } from "lucide-react";

export default function TripGroupChat() {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [members, setMembers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [newMessage, setNewMessage] = useState("");
    const [showMembers, setShowMembers] = useState(false);
    const [groupName, setGroupName] = useState("");
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [messagesRes, membersRes, userRes, groupsRes] = await Promise.all([
                    api.get(`/groups/${groupId}/chat/`),
                    api.get(`/groups/${groupId}/members/`),
                    api.get("/profile/"),
                    api.get("/groups/"),
                ]);
                setMessages(messagesRes.data);
                setMembers(membersRes.data);
                setCurrentUser(userRes.data);
                const group = groupsRes.data.find(g => g.id === parseInt(groupId));
                if (group) setGroupName(group.name);
            } catch (err) {
                console.error("Error loading group chat:", err);
            }
        };
        fetchData();
    }, [groupId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        try {
            const res = await api.post(`/groups/${groupId}/chat/`, {
                content: newMessage,
            });
            setMessages((prev) => [...prev, res.data]);
            setNewMessage("");
        } catch (err) {
            console.error("Error sending message:", err);
        }
    };

    const getProfilePic = (pic) => {
        if (!pic) return "/default-avatar.png";
        return pic.startsWith("http") ? pic : `http://127.0.0.1:8000${pic}`;
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 pb-16">
            <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <p className="font-bold text-gray-800">{groupName || "Trip Group"}</p>
                        <p className="text-xs text-gray-400">{members.length} members</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowMembers(!showMembers)}
                    className="text-teal-600"
                >
                    <Users size={22} />
                </button>
            </div>

            {showMembers && (
                <div className="bg-white border-b px-4 py-3">
                    <h3 className="font-semibold text-sm mb-2">Members</h3>
                    <div className="flex gap-3 overflow-x-auto">
                        {members.map((member) => (
                            <div key={member.id} className="flex flex-col items-center min-w-fit">
                                <img
                                    src={getProfilePic(member.profile_pic)}
                                    alt={member.username}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <p className="text-xs text-gray-600 mt-1">@{member.username}</p>
                                {member.role === 'admin' && (
                                    <span className="text-xs bg-teal-100 text-teal-600 px-1 rounded">admin</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                    <p className="text-center text-gray-400 text-sm mt-10">
                        No messages yet. Start the conversation!
                    </p>
                )}
                {messages.map((msg) => {
                    const isMine = msg.is_mine || msg.sender === currentUser?.id;
                    return (
                        <div key={msg.id} className={`flex gap-2 ${isMine ? "justify-end" : "justify-start"}`}>
                            {!isMine && (
                                <img
                                    src={getProfilePic(msg.sender_profile_pic)}
                                    alt="sender"
                                    className="w-8 h-8 rounded-full object-cover self-end"
                                />
                            )}
                            <div className={`max-w-xs ${isMine ? "items-end" : "items-start"} flex flex-col`}>
                                {!isMine && (
                                    <p className="text-xs text-gray-400 mb-1">@{msg.sender_username}</p>
                                )}
                                <div className={`px-4 py-2 rounded-2xl text-sm ${
                                    isMine
                                        ? "bg-teal-500 text-white rounded-br-none"
                                        : "bg-white text-gray-800 shadow rounded-bl-none"
                                }`}>
                                    {msg.content}
                                </div>
                                <p className="text-xs text-gray-300 mt-1">
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <form
                onSubmit={sendMessage}
                className="border-t bg-white p-3 flex items-center gap-2"
            >
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 p-2 border rounded-full focus:outline-none focus:ring-1 focus:ring-teal-400 text-sm"
                />
                <button
                    type="submit"
                    className="bg-teal-500 text-white p-2 rounded-full hover:bg-teal-600"
                >
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
}