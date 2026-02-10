// frontend/src/components/Login.jsx
import  { React,useState } from 'react';
import api from '../api'; 
import { useNavigate, Link } from 'react-router-dom';
import image1 from '../assets/image1.jpg';
import image2 from '../assets/image2.jpg';
import image3 from '../assets/image3.jpg';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Login button clicked! Sending data:", { username, password });
    try {
      const res = await api.post("/token/", { username, password });
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      localStorage.setItem("authTokens", JSON.stringify(res.data));
      navigate("/"); 
    } catch (error) {
      console.error("Login request failed!", error); 
      alert('Login failed! Check your credentials.');
    }
  };

  return (
    <div className="flex w-full min-h-screen font-sans">
      <div className="hidden lg:flex w-1/2 items-center justify-center bg-gray-100 p-12">
        <div className="relative w-full max-w-lg flex items-center justify-center">
          <img src={image2} alt="Travel" className="absolute w-64 h-auto rounded-2xl shadow-lg transform -rotate-15 top-0 left-0" />
          <img src={image1} alt="Travel" className="relative w-72 h-auto rounded-2xl shadow-lg z-10" />
          <img src={image3} alt="Travel" className="absolute w-56 h-auto rounded-2xl shadow-lg transform rotate-15 bottom-0 right-0" />
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <h1 className="text-4xl font-serif text-center text-gray-800 mb-2">Travel Mates</h1>
          <p className="text-center text-gray-600 mb-8">Find new friends. Discover new journeys. Travel together.</p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder=" username "
                required
              />
            </div>
            <div className="mb-4">
              <input
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
            >
              Log In
            </button>
            <a href="#" className="block text-center text-sm text-teal-500 hover:underline mt-4">
              Forgot Password?
            </a>
          </form>
          <p className="text-center text-sm text-gray-600 mt-8">
            Don't have an account?{" "}
            <Link to="/signup" className="text-teal-500 font-semibold hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
