import React from 'react';
import { Link } from 'react-router-dom'; // <-- Import Link

const Home = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation Bar */}
            <nav className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <h1 className="text-2xl font-bold text-teal-600">Travel Mates</h1>

                        {/* Replace the button with a Link */}
                        <Link 
                            to="/logout"
                            className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
                        >
                            Logout
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {/* ... your home page content ... */}
            </main>
        </div>
    );
};

export default Home;