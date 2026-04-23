import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, loginUser } from '../api';

import image1 from '../assets/image1.jpg';
import image2 from '../assets/image2.jpg';
import image3 from '../assets/image3.jpg';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // ✅ STEP 1: register
      await registerUser({
        username: username.trim(),
        email: email.trim(),
        password: password.trim(),
      });

      // ✅ STEP 2: login (IMPORTANT: use api.js function)
      const data = await loginUser({
        username: username.trim(),
        password: password.trim(),
      });

      console.log("✅ Signup + Login success:", data);

      // ❌ REMOVE extra storage (handled in api.js)
      // localStorage.setItem('access_token', ...)
      // localStorage.setItem('refresh_token', ...)

      navigate("/");

    } catch (error) {
      console.error("❌ Signup failed:", error.response?.data);

      alert(
        error.response?.data?.detail ||
        JSON.stringify(error.response?.data) ||
        "Signup failed"
      );
    }
  };

  return (
    <div className="flex w-full min-h-screen font-sans">
      {/* Images */}
      <div className="hidden lg:flex w-1/2 bg-gray-100 p-12">
        <div className="relative w-full max-w-lg flex items-center justify-center">
          <img src={image2} className="absolute w-64 rounded-2xl shadow-lg -rotate-12 top-0 left-0" />
          <img src={image1} className="relative w-72 rounded-2xl shadow-lg z-10" />
          <img src={image3} className="absolute w-56 rounded-2xl shadow-lg rotate-12 bottom-0 right-0" />
        </div>
      </div>

      {/* Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <h1 className="text-4xl text-center mb-2">Travel Mates</h1>
          <p className="text-center mb-8">Create your account</p>

          <form onSubmit={handleSubmit}>
            <input
              className="w-full mb-4 p-3 border rounded"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <input
              className="w-full mb-4 p-3 border rounded"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              className="w-full mb-4 p-3 border rounded"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button className="w-full bg-teal-500 text-white py-3 rounded">
              Sign Up
            </button>
          </form>

          <p className="text-center mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-teal-500">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;