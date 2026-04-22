// frontend/src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import { RefreshProvider } from "./components/RefreshContext";

ReactDOM.createRoot(document.getElementById('root')).render(
  
    <BrowserRouter>
        <RefreshProvider>
            <App />
        </RefreshProvider>
    </BrowserRouter>
)