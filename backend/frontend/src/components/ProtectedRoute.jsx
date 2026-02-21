// frontend/src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('access_token');

    if (!token) {
        // If no token is found, redirect to the login page
        return <Navigate to="/login" />;
    }

    // If a token is found, show the page the user wanted to see
    return children;
};

export default ProtectedRoute;