import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('careerhub_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('careerhub_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          localStorage.setItem('careerhub_user', JSON.stringify(res.data.user));
        } catch (error) {
          console.error('Session validation error:', error);
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, [token]);

  const saveAuthData = (data) => {
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('careerhub_token', data.token);
    localStorage.setItem('careerhub_user', JSON.stringify(data.user));
  };

  const handleRegisterStudent = async (formData) => {
    try {
      const res = await api.post('/auth/register', formData);
      saveAuthData(res.data);
      toast.success('Registration successful! Welcome to CareerHub AI 🎉');
      return res.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed';
      toast.error(msg);
      throw error;
    }
  };

  const handleLoginStudent = async (credentials) => {
    try {
      const res = await api.post('/auth/student-login', credentials);
      saveAuthData(res.data);
      toast.success(`Welcome back, ${res.data.user.name}! 👋`);
      return res.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed';
      toast.error(msg);
      throw error;
    }
  };

  const handleLoginAdmin = async (credentials) => {
    try {
      const res = await api.post('/auth/admin-login', credentials);
      saveAuthData(res.data);
      toast.success('Admin login successful! 🛠️');
      return res.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Admin login failed';
      toast.error(msg);
      throw error;
    }
  };

  const updateUser = (updatedUserData) => {
    setUser(prev => {
      const newObj = { ...prev, ...updatedUserData };
      localStorage.setItem('careerhub_user', JSON.stringify(newObj));
      return newObj;
    });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('careerhub_token');
    localStorage.removeItem('careerhub_user');
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      registerStudent: handleRegisterStudent,
      loginStudent: handleLoginStudent,
      loginAdmin: handleLoginAdmin,
      updateUser,
      logout,
      isStudent: user?.role === 'Student',
      isAdmin: user?.role === 'Admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
