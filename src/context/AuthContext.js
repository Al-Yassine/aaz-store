import React, { createContext, useContext, useState, useEffect } from 'react';
import { subscribeToAuthChanges } from '../services/authService';
import { getUserDocument } from '../services/userService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (user) => {
      setLoading(true);
      setError(null);
      
      if (user) {
        setCurrentUser(user);
        
        try {
          // Fetch user data from Firestore
          const result = await getUserDocument(user.uid);
          
          if (result.success) {
            setUserData(result.data);
            setIsAdmin(result.data.role === 'admin');
          } else {
            // User document doesn't exist yet, create default
            setUserData({
              id: user.uid,
              email: user.email,
              name: user.displayName || '',
              role: 'customer'
            });
            setIsAdmin(false);
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
          setError(err.message);
          setUserData(null);
          setIsAdmin(false);
        }
      } else {
        setCurrentUser(null);
        setUserData(null);
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Refresh user data from Firestore
   */
  const refreshUserData = async () => {
    if (currentUser) {
      try {
        const result = await getUserDocument(currentUser.uid);
        if (result.success) {
          setUserData(result.data);
          setIsAdmin(result.data.role === 'admin');
        }
      } catch (err) {
        console.error('Error refreshing user data:', err);
      }
    }
  };

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = () => {
    return !!currentUser;
  };

  /**
   * Check if current user has a specific role
   */
  const hasRole = (role) => {
    return userData?.role === role;
  };

  const value = {
    currentUser,
    userData,
    isAdmin,
    loading,
    error,
    refreshUserData,
    isAuthenticated,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
