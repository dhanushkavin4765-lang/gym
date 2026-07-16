import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if admin token exists on boot
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('gym_admin_token');
      const savedAdmin = localStorage.getItem('gym_admin_user');
      
      if (token && savedAdmin) {
        try {
          setAdmin(JSON.parse(savedAdmin));
          // Validate token by fetching latest profile
          const { data } = await API.get('/auth/profile');
          setAdmin(data);
          localStorage.setItem('gym_admin_user', JSON.stringify(data));
        } catch (error) {
          console.error('Session expired or invalid token');
          logout();
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await API.post('/auth/login', { email, password });
      
      localStorage.setItem('gym_admin_token', data.token);
      localStorage.setItem('gym_admin_user', JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        avatar: data.avatar
      }));
      
      setAdmin(data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Try again.'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('gym_admin_token');
    localStorage.removeItem('gym_admin_user');
    setAdmin(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const { data } = await API.put('/auth/profile', profileData);
      setAdmin(data);
      localStorage.setItem('gym_admin_user', JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        avatar: data.avatar
      }));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Update failed'
      };
    }
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
