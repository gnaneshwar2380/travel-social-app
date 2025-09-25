// frontend/src/App.jsx
import {Routes, Route, Link } from 'react-router-dom'; // Import Link
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import Logout from './components/Logout';
import ProtectedRoute from './components/ProtectedRoute'
import './App.css';





function App() {
    return (
        
            <Routes>
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Home />
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