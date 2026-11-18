import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginApi, registerApi, getMeApi, logoutApi, getProfileApi, updateProfileApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('careerpilot_token') || null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Refresh user data from backend
  const refreshUser = useCallback(async () => {
    const storedToken = localStorage.getItem('careerpilot_token');
    if (!storedToken) {
      setUser(null);
      setIsLoading(false);
      return null;
    }

    try {
      const res = await getProfileApi();
      if (res?.data?.profile) {
        setUser(res.data.profile);
        return res.data.profile;
      }
      // Fallback to /auth/me if profile endpoint returns alternate shape
      const meRes = await getMeApi();
      if (meRes?.data?.user) {
        setUser(meRes.data.user);
        return meRes.data.user;
      }
    } catch (err) {
      console.warn('[Auth Initialization Note]: Invalid or expired token, clearing session.', err.message);
      localStorage.removeItem('careerpilot_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
    return null;
  }, []);

  // Initial authentication check on application mount
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Log in existing user
  const login = async (email, password) => {
    const res = await loginApi({ email, password });
    if (res?.data?.token) {
      localStorage.setItem('careerpilot_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res?.message || 'Login failed. Please check your credentials.');
  };

  // Register new user
  const register = async (userData) => {
    const res = await registerApi(userData);
    if (res?.data?.token) {
      localStorage.setItem('careerpilot_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res?.message || 'Registration failed.');
  };

  // Log out user
  const logout = async () => {
    try {
      await logoutApi();
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('careerpilot_token');
      setToken(null);
      setUser(null);
    }
  };

  // Update profile
  const updateProfile = async (profileUpdates) => {
    const res = await updateProfileApi(profileUpdates);
    if (res?.data?.profile) {
      setUser(res.data.profile);
      return res.data.profile;
    }
    return null;
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
