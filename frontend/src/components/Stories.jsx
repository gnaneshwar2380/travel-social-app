import React, { useEffect, useState, useRef } from "react";
import api from "../api";
import { X, Plus, Heart } from "lucide-react";

export default function Stories({ filterUserId = null }) {
    const [storyGroups, setStoryGroups] = useState([]);
    const [activeGroup, setActiveGroup] = useState(null);
    const [activeStoryIndex, setActiveStoryIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [caption, setCaption] = useState("");
    const [previewImage, setPreviewImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [showViewers, setShowViewers] = useState(false);
    const [storyLikes, setStoryLikes] = useState({});
    const [currentUserId, setCurrentUserId] = useState(null);
    const fileInputRef = useRef(null);
    const progressRef = useRef(null);

    useEffect(() => {
        try {
            const tokens = localStorage.getItem('authTokens');
            if (tokens) {
                const parsed = JSON.parse(tokens);
                const payload = JSON.parse(atob(parsed.access.split('.')[1]));
                setCurrentUserId(payload.user_id);
            }
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => { fetchStories(); }, []); // eslint-disable-line

    const fetchStories = async () => {
        try {
            const res = await api.get("/stories/");
            let data = res.data;
            if (filterUserId) data = data.filter(g => g.user.id === filterUserId);
            setStoryGroups(data);
        } catch (err) { console.error("Failed to load stories", err); }
    };

    const openStory = async (group, index = 0) => {
        setActiveGroup(group);
        setActiveStoryIndex(index);
        setProgress(0);
        setShowViewers(false);
        const story = group.stories[index];
        if (!story.is_viewed) {
            try { await api.post(`/stories/${story.id}/view/`); }
            catch (err) { console.error(err); }
        }
    };

    useEffect(() => {
        if (!activeGroup) return;
        if (showViewers) { clearInterval(progressRef.current); return; }
        clearInterval(progressRef.current);
        setProgress(0);
        progressRef.current = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) { goNext(); return 0; }
                return prev + 2;
            });
        }, 100);
        return () => clearInterval(progressRef.current);
    }, [activeGroup, activeStoryIndex, showViewers]); // eslint-disable-line react-hooks/exhaustive-deps

    const goNext = () => {
        if (!activeGroup) return;
        setShowViewers(false);
        if (activeStoryIndex < activeGroup.stories.length - 1) {
            setActiveStoryIndex(prev => prev + 1);
            setProgress(0);
        } else {
            const idx = storyGroups.findIndex(g => g.user.id === activeGroup.user.id);
            if (idx < storyGroups.length - 1) openStory(storyGroups[idx + 1]);
            else closeStory();
        }
    };

    const goPrev = () => {
        if (!activeGroup) return;
        setShowViewers(false);
        if (activeStoryIndex > 0) {
            setActiveStoryIndex(prev => prev - 1);
            setProgress(0);
        } else {
            const idx = storyGroups.findIndex(g => g.user.id === activeGroup.user.id);
            if (idx > 0) {
                const prevGroup = storyGroups[idx - 1];
                openStory(prevGroup, prevGroup.stories.length - 1);
            }
        }
    };

    const closeStory = () => {
        clearInterval(progressRef.current);
        setActiveGroup(null);
        setActiveStoryIndex(0);
        setProgress(0);
        setShowViewers(false);
        fetchStories();
    };

    const handleLike = (e) => {
        e.stopPropagation();
        if (!activeStory) return;
        setStoryLikes(prev => ({ ...prev, [activeStory.id]: !prev[activeStory.id] }));
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => setPreviewImage(ev.target.result);
        reader.readAsDataURL(file);
        setShowUpload(true);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', selectedFile);
            formData.append('caption', caption);
            await api.post('/stories/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setShowUpload(false);
            setPreviewImage(null);
            setSelectedFile(null);
            setCaption("");
            fetchStories();
        } catch (err) { console.error("Failed to upload story", err); }
        finally { setUploading(false); }
    };

    const getImage = (img) => {
        if (!img) return "/default-avatar.png";
        return img.startsWith("http") ? img : `http://127.0.0.1:8000${img}`;
    };

    const activeStory = activeGroup?.stories[activeStoryIndex];
    const isOwnStory = !!(currentUserId && activeGroup && activeGroup.user.id === Number(currentUserId));

    if (filterUserId && storyGroups.length === 0) return null;

    return (
        <div className="relative">
            {/* Stories Bar */}
            <div className="flex gap-4 px-4 py-3 overflow-x-auto overflow-y-hidden scrollbar-hide">
                {!filterUserId && (
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-16 h-16 rounded-full border-2 border-dashed border-teal-400 flex items-center justify-center bg-teal-50 hover:bg-teal-100"
                        >
                            <Plus size={24} className="text-teal-500" />
                        </button>
                        <p className="text-xs text-gray-500 w-16 text-center truncate">Your Story</p>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                    </div>
                )}
                {storyGroups.map((group) => (
                    <div
                        key={group.user.id}
                        onClick={() => openStory(group)}
                        className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer"
                    >
                        <div className={`w-16 h-16 rounded-full p-0.5 ${group.has_unviewed ? 'bg-gradient-to-tr from-teal-400 to-blue-500' : 'bg-gray-300'}`}>
                            <img
                                src={getImage(group.user.profile_pic)}
                                alt={group.user.username}
                                className="w-full h-full rounded-full object-cover border-2 border-white"
                            />
                        </div>
                        <p className="text-xs text-gray-600 w-16 text-center truncate">@{group.user.username}</p>
                    </div>
                ))}
            </div>

            {/* Story Viewer - portal-like fixed overlay */}
            {activeGroup && activeStory && (
                <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center">
                    <div className="relative w-full max-w-sm h-full max-h-screen overflow-hidden">

                        {/* Progress bars */}
                        <div className="absolute top-4 left-2 right-2 flex gap-1 z-20">
                            {activeGroup.stories.map((s, i) => (
                                <div key={s.id} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-white rounded-full transition-none"
                                        style={{
                                            width: i < activeStoryIndex ? '100%'
                                                : i === activeStoryIndex ? `${progress}%`
                                                : '0%'
                                        }}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Header */}
                        <div className="absolute top-8 left-4 right-4 flex items-center gap-3 z-20">
                            <img
                                src={getImage(activeGroup.user.profile_pic)}
                                alt={activeGroup.user.username}
                                className="w-9 h-9 rounded-full object-cover border-2 border-white"
                            />
                            <div className="flex-1">
                                <p className="text-white font-semibold text-sm">@{activeGroup.user.username}</p>
                                <p className="text-white/70 text-xs">
                                    {new Date(activeStory.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            <button onClick={closeStory} className="text-white z-20">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Story Image */}
                        <img src={getImage(activeStory.image)} alt="Story" className="w-full h-full object-cover" />

                        {/* Caption */}
                        {activeStory.caption && (
                            <div className="absolute bottom-24 left-4 right-4 z-20 pointer-events-none">
                                <p className="text-white text-sm text-center bg-black/40 rounded-xl px-4 py-2">
                                    {activeStory.caption}
                                </p>
                            </div>
                        )}

                        {/* Bottom bar */}
                        <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-8">
                            {isOwnStory ? (
                                <div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowViewers(!showViewers); }}
                                        className="w-full flex items-center gap-2 bg-black/50 rounded-2xl px-4 py-3"
                                    >
                                        <span className="text-white text-sm">👁️ {activeStory.views_count} views</span>
                                        <div className="flex -space-x-2 ml-1">
                                            {(activeStory.viewers || []).slice(0, 5).map((viewer) => (
                                                <img key={viewer.id} src={getImage(viewer.profile_pic)} alt={viewer.username}
                                                    className="w-6 h-6 rounded-full border border-white object-cover" />
                                            ))}
                                        </div>
                                        {activeStory.viewers?.length > 0 && (
                                            <p className="text-white/70 text-xs flex-1 text-left truncate ml-1">
                                                {activeStory.viewers.slice(0, 2).map(v => `@${v.username}`).join(', ')}
                                                {activeStory.viewers.length > 2 ? ` +${activeStory.viewers.length - 2} more` : ''}
                                            </p>
                                        )}
                                        <span className="text-white/50 text-xs">{showViewers ? '▼' : '▲'}</span>
                                    </button>
                                    {showViewers && (
                                        <div className="bg-black/80 rounded-2xl mt-1 max-h-48 overflow-y-auto">
                                            {!activeStory.viewers?.length ? (
                                                <p className="text-white/50 text-sm text-center py-4">No views yet</p>
                                            ) : (
                                                activeStory.viewers.map((viewer) => (
                                                    <div key={viewer.id} className="flex items-center gap-3 px-4 py-2">
                                                        <img src={getImage(viewer.profile_pic)} alt={viewer.username}
                                                            className="w-8 h-8 rounded-full object-cover" />
                                                        <p className="text-white text-sm">@{viewer.username}</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex justify-center">
                                    <button
                                        onClick={handleLike}
                                        className="flex items-center gap-2 bg-black/50 rounded-full px-6 py-3"
                                    >
                                        <Heart size={22} className={storyLikes[activeStory.id] ? "text-red-500 fill-red-500" : "text-white"} />
                                        <span className="text-white text-sm">
                                            {storyLikes[activeStory.id] ? "Liked" : "Like"}
                                        </span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Tap navigation */}
                        <button onClick={goPrev} className="absolute left-0 top-0 w-1/3 h-4/5 z-10" />
                        <button onClick={goNext} className="absolute right-0 top-0 w-2/3 h-4/5 z-10" />
                    </div>
                </div>
            )}

            {/* Upload Modal */}
            {showUpload && previewImage && (
                <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center px-4">
                    <div className="bg-white rounded-2xl overflow-hidden w-full max-w-sm">
                        <img src={previewImage} alt="Preview" className="w-full h-72 object-cover" />
                        <div className="p-4">
                            <input
                                type="text"
                                placeholder="Add a caption..."
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                className="w-full border rounded-full px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-teal-400 mb-3"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setShowUpload(false); setPreviewImage(null); }}
                                    className="flex-1 py-2 rounded-full border text-gray-600 text-sm font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpload}
                                    disabled={uploading}
                                    className="flex-1 py-2 rounded-full bg-teal-500 text-white text-sm font-semibold hover:bg-teal-600"
                                >
                                    {uploading ? "Posting..." : "Share Story"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}