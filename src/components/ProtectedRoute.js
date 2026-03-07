import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, message = 'Veuillez vous connecter pour acceder a cette section.' }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    const redirectTo = `${location.pathname}${location.search}${location.hash || ''}`;

    return (
      <Navigate
        to="/signin"
        replace
        state={{
          formError: message,
          redirectTo
        }}
      />
    );
  }

  return children;
};

export default ProtectedRoute;
