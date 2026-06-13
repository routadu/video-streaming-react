import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

// Single auth state object — batches token + user into ONE setState
// so consumers only re-render once when logging in or out.
const initialState = { token: null, user: null };

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(initialState);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate from localStorage once on mount (single setState call)
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken) {
      let parsedUser = null;
      if (storedUser) {
        try {
          parsedUser = JSON.parse(storedUser);
        } catch {
          parsedUser = null;
        }
      }
      // Single setState — one re-render, no duplicate API calls
      setAuth({ token: storedToken, user: parsedUser });
    }
    setIsLoading(false);
  }, []);

  // Single setState call — batches token + user together,
  // so Home.js useEffect only fires ONCE after login
  const login = useCallback((tokenValue, userData) => {
    localStorage.setItem('token', tokenValue);
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    }
    setAuth({ token: tokenValue, user: userData || null });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuth(initialState);
  }, []);

  const isAuthenticated = !!auth.token;

  return (
    <AuthContext.Provider value={{
      user: auth.user,
      token: auth.token,
      isAuthenticated,
      isLoading,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export default AuthContext;
