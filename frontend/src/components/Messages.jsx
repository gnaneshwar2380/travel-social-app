import React, { useEffect, useState } from "react";
import api from "../api";
import { Send } from "lucide-react";

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get("/api/messages/conversations/");
        setConversations(res.data);
      } catch (error) {
        console.error("Error loading conversations:", error);
      }
    };
    fetchConversations();
  }, []);

  const openChat = async (userId) => {
    setActiveChat(userId);
    try {
      const res = await api.get(`/api/messages/chat/${userId}/`);
      setMessages(res.data);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await api.post(`/api/messages/chat/${activeChat}/send/`, {
        content: newMessage,
      });
      setMessages((prev) => [...prev, res.data]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-1/3 border-r bg-white overflow-y-auto hidden md:block">
        <h2 className="p-4 font-semibold border-b">Messages</h2>
        {conversations.length === 0 ? (
          <p className="text-gray-500 text-sm p-4">
            No conversations yet.
          </p>
        ) : (
          conversations.map((chat) => (
            <div
              key={chat.id}
              className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-100 ${
                activeChat === chat.user.id ? "bg-gray-100" : ""
              }`}
              onClick={() => openChat(chat.user.id)}
            >
              <img
                src={chat.user.profile_picture || "/default-avatar.png"}
                alt={chat.user.username}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-medium">{chat.user.username}</p>
                <p className="text-xs text-gray-500 truncate w-40">
                  {chat.last_message || "No messages yet"}
                </p>
              </div>
            </div>
          ))
        )}
      </aside>

      {/* Chat Section */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            <div className="p-4 border-b bg-white flex items-center gap-3">
              <h3 className="font-semibold text-lg">
                Chat with{" "}
                {
                  conversations.find((c) => c.user.id === activeChat)?.user
                    ?.username
                }
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.is_mine ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      msg.is_mine
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-gray-200 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
            <form
              onSubmit={sendMessage}
              className="border-t bg-white p-3 flex items-center"
            >
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 p-2 border rounded-full focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
              <button
                type="submit"
                className="ml-3 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
              >
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
