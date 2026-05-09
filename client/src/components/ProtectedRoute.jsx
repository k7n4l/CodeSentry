import react from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({children}){
    const {loading, isAuthenticated} = useAuth();
      if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.5rem'
      }}>
        🔄 Loading...
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}