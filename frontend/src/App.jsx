// frontend/src/App.jsx
import {Routes, Route, Link } from 'react-router-dom'; // Import Link

import Login from './components/Login';
import Signup from './components/Signup';
import Logout from './components/Logout';
import Profile from "./components/Profile";
import ProtectedRoute from './components/ProtectedRoute'
import './App.css';





function App() {
    return (
        
            <Routes>
                <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <Profile /> {/* <-- Change Home to Profile */}
                    </ProtectedRoute>
                }
            />
                <Route path="/login" element={<Login />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/signup" element={<Signup/>} />
            </Routes>
       
    );
}

export default App;