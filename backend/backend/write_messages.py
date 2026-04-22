content = '''import React, { useEffect, useState, useRef } from "react";
import api from "../api";
import { Send, Search, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Messages() {
    const [groups, setGroups] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [activeChatUser, setActiveChatUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [convsRes, userRes, groupsRes] = await Promise.all([
                    api.get("/messages/conversations/"),
                    api.get("/profile/"),
                    api.get("/groups/"),
                ]);
                setConversations(convsRes.data);
                setCurrentUser(userRes.data);
                setGroups(groupsRes.data);
            } catch (error) {
                console.error("Error loading conversations:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const openChat = async (userId, user) => {
        setActiveChat(userId);
        setActiveChatUser(user);
        try {
            const res = await api.get(`/messages/chat/${userId}/`);
            setMessages(res.data);
        } catch (error) {
            console.error("Error loading messages:", error);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        try {
            const res = await api.post(`/messages/chat/${activeChat}/`, {
                content: newMessage,
            });
            setMessages((prev) => [...prev, res.data]);
            setNewMessage("");
            setConversations((prev) => {
                const exists = prev.find((c) => c.user.id === activeChat);
                if (exists) {
                    return prev.map((c) =>
                        c.user.id === activeChat
                            ? { ...c, last_message: newMessage }
                            : c
                    );
                }
                return [
                    { id: activeChat, user: activeChatUser, last_message: newMessage },
                    ...prev,
                ];
            });
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const handleSearch = async (e) => {
        const q = e.target.value;
        setSearchQuery(q);
        if (!q.trim()) {
            setSearchResults([]);
            return;
        }
        try {
            const res = await api.get(`/messages/search-users/?q=${q}`);
            setSearchResults(res.data);
        } catch (err) {
            console.error("Search failed:", err);
        }
    };

    const getProfilePic = (user) => {
        if (!user?.profile_pic) return "/default-avatar.png";
        return user.profile_pic.startsWith("http")
            ? user.profile_pic
            : `http://127.0.0.1:8000${user.profile_pic}`;
    };

    return (
        <div className="flex h-screen bg-gray-50 pb-16">
            <aside className={`w-full md:w-1/3 border-r bg-white flex flex-col ${activeChat ? "hidden md:flex" : "flex"}`}>
                <div className="p-4 border-b">
                    <h2 className="font-bold text-lg mb-3">Messages</h2>
                    <div className="flex items-center bg-gray-100 rounded-full px-3 py-2 gap-2">
                        <Search size={16} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="bg-transparent outline-none text-sm flex-1"
                        />
                    </div>
                </div>
                <div className="overflow-y-auto flex-1">
                    {searchQuery ? (
                        searchResults.length > 0 ? (
                            searchResults.map((user) => (
                                <div
                                    key={user.id}
                                    onClick={() => {
                                        setSearchQuery("");
                                        setSearchResults([]);
                                        openChat(user.id, user);
                                    }}
                                    className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 border-b"
                                >
                                    <img src={getProfilePic(user)} alt={user.username} className="w-10 h-10 rounded-full object-cover" />
                                    <div>
                                        <p className="font-medium text-sm">@{user.username}</p>
                                        <p className="text-xs text-gray-400">{user.full_name}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-400 text-sm p-4">No users found</p>
                        )
                    ) : loading ? (
                        <p className="text-center text-gray-400 text-sm p-4">Loading...</p>
                    ) : (
                        <>
                            {groups.length > 0 && (
                                <>
                                    <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase bg-gray-50">Trip Groups</p>
                                    {groups.map((group) => (
                                        <div
                                            key={group.id}
                                            onClick={() => navigate(`/group-chat/${group.id}`)}
                                            className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 border-b"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white">✈️</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm">{group.name}</p>
                                                <p className="text-xs text-gray-400">{group.member_count} members</p>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                            {conversations.length > 0 && (
                                <>
                                    <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase bg-gray-50">Direct Messages</p>
                                    {conversations.map((chat) => (
                                        <div
                                            key={chat.id}
                                            onClick={() => openChat(chat.user.id, chat.user)}
                                            className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 border-b ${activeChat === chat.user.id ? "bg-teal-50" : ""}`}
                                        >
                                            <img src={getProfilePic(chat.user)} alt={chat.user.username} className="w-10 h-10 rounded-full object-cover" />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm">@{chat.user.username}</p>
                                                <p className="text-xs text-gray-400 truncate">{chat.last_message}</p>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                            {groups.length === 0 && conversations.length === 0 && (
                                <p className="text-center text-gray-400 text-sm p-4">No messages yet. Search for a user to start chatting!</p>
                            )}
                        </>
                    )}
                </div>
            </aside>
            <div className={`flex-1 flex flex-col ${activeChat ? "flex" : "hidden md:flex"}`}>
                {activeChat ? (
                    <>
                        <div className="p-4 border-b bg-white flex items-center gap-3">
                            <button onClick={() => setActiveChat(null)} className="md:hidden"><ArrowLeft size={20} /></button>
                            <img src={getProfilePic(activeChatUser)} alt={activeChatUser?.username} className="w-9 h-9 rounded-full object-cover" />
                            <p className="font-semibold">@{activeChatUser?.username}</p>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {messages.length === 0 && <p className="text-center text-gray-400 text-sm">No messages yet. Say hello!</p>}
                            {messages.map((msg) => {
                                const isMine = msg.sender === currentUser?.id || msg.is_mine;
                                return (
                                    <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                                        <div className={`px-4 py-2 rounded-2xl max-w-xs text-sm ${isMine ? "bg-teal-500 text-white rounded-br-none" : "bg-gray-200 text-gray-800 rounded-bl-none"}`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                        <form onSubmit={sendMessage} className="border-t bg-white p-3 flex items-center gap-2">
                            <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1 p-2 border rounded-full focus:outline-none focus:ring-1 focus:ring-teal-400 text-sm" />
                            <button type="submit" className="bg-teal-500 text-white p-2 rounded-full hover:bg-teal-600"><Send size={18} /></button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <p className="text-lg font-medium">Select a chat</p>
                        <p className="text-sm mt-1">or search for a user to start messaging</p>
                    </div>
                )}
            </div>
        </div>
    );
}'''

with open('C:/Users/gnaes/my-fullstack-projects/travel-social-app/frontend/src/components/Messages.jsx', 'w') as f:
    f.write(content)
print("Messages.jsx written successfully!")