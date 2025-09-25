import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const Logout = () => {
   
    useEffect(() => {
        localStorage.clear();
    }, []); 

    
    return <Navigate to="/login" replace />;
};

export default Logout;