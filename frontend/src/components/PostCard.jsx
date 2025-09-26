import React from 'react';

const PostCard = ({ post }) => {
    // A helper function to format the date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            <h3 className="text-xl font-bold text-gray-800">{post.title}</h3>
            <p className="text-gray-500 text-sm mb-2">
                Posted on {formatDate(post.created_at)}
            </p>
            <p className="text-gray-700">{post.content}</p>
        </div>
    );
};

export default PostCard;