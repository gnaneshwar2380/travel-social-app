// frontend/src/components/Signup.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import image1 from '../assets/image1.jpg'; 
import image2 from '../assets/image2.jpg';
import image3 from '../assets/image3.jpg';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
     const [email, setEmail] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://127.0.0.1:8000/api/user/register/', {
                username,
                email,
                password,
            });
            alert('Registration successful! Please log in.');
            window.location.href = '/login';
        } catch (error) {
            alert('Registration failed! A user with that username is already exist.',error);
        }
    };

    return (
        <div className="flex w-full min-h-screen font-sans">
            {/* Image Section */}
            <div className="hidden lg:flex w-1/2  bg-gray-100 p-12">
                <div className="relative w-full max-w-lg flex items-center justify-center">
                    <img src={image2} alt="Travel" className="absolute w-64 h-auto rounded-2xl shadow-lg transform -rotate-15 top-0 left-0" />
                    <img src={image1} alt="Travel" className="relative w-72 h-auto rounded-2xl shadow-lg z-10" />
                    <img src={image3} alt="Travel" className="absolute w-56 h-auto rounded-2xl shadow-lg transform rotate-15 bottom-0 right-0" />
                </div>
            </div>

            {/* Form Section */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="max-w-md w-full">
                    <h1 className="text-4xl font-serif text-center text-gray-800 mb-2">Travel Mates</h1>
                    <p className="text-center text-gray-600 mb-8">Create your account to start your journey.</p>

                    <form onSubmit={handleSubmit}>
                        {/* Note: As requested, we are only including username and password for now.
                            We will add Full Name and Email fields later. */}
                        <div className="mb-4">
                            <input
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                                placeholder="Username" required
                            />
                        </div>
                        <div className="mb-4">
                        <input
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            required
                        />
                    </div>
                        <div className="mb-4">
                            <input
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password" required
                            />
                        </div>
                        <button type="submit" className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300">
                            Sign Up
                        </button>
                    </form>
                    <p className="text-center text-sm text-gray-600 mt-8">
                        Already have an account? <Link to="/login" className="text-teal-500 font-semibold hover:underline">Log In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;