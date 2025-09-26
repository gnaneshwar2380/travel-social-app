import React, { useState } from 'react';
import axios from 'axios';

// 1. Accept the new onUploadSuccess function as a prop
const EditProfileModal = ({ onClose, onUploadSuccess }) => {
    const [profilePicture, setProfilePicture] = useState(null);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        setProfilePicture(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!profilePicture) {
            setError('Please select a file.');
            return;
        }

        const formData = new FormData();
        formData.append('profile_picture', profilePicture);

        try {
            const token = localStorage.getItem('access_token');
            await axios.patch('http://127.0.0.1:8000/api/profile/update/', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            // 2. Call the function from the parent to refresh the data
            onUploadSuccess();
            // 3. Then close the modal
            onClose();

        } catch (err) {
            setError('Upload failed. Please try again.');
            console.error(err);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="profile_picture" className="block text-sm font-medium text-gray-700">
                            Upload New Profile Picture
                        </label>
                        <input
                            type="file"
                            id="profile_picture"
                            onChange={handleFileChange}
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600">
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;