import React, { createContext, useContext, useState, useEffect } from 'react';
import { demoUsers } from '../data/demoUsers';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthContext: Initializing...');
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem('keiros_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        console.log('AuthContext: Found saved user:', user);
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('AuthContext: Error parsing saved user:', error);
        localStorage.removeItem('keiros_user');
      }
    } else {
      console.log('AuthContext: No saved user found');
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      console.log('AuthContext: Login attempt for:', username);
      console.log('AuthContext: Available demo users:', demoUsers);
      console.log('AuthContext: Searching for user with credentials...');
      
      // Use demo users from demoUsers.js
      const user = demoUsers.find(
        u => u.username === username && u.password === password
      );

      console.log('AuthContext: Found user:', user);

      if (user) {
        // Remove password from user object before storing
        const { password: _, ...userWithoutPassword } = user;
        console.log('AuthContext: Setting user state:', userWithoutPassword);
        
        setCurrentUser(userWithoutPassword);
        setIsAuthenticated(true);
        localStorage.setItem('keiros_user', JSON.stringify(userWithoutPassword));
        
        console.log('AuthContext: Login successful, user set:', userWithoutPassword);
        console.log('AuthContext: isAuthenticated set to:', true);
        
        return { success: true, user: userWithoutPassword };
      } else {
        console.log('AuthContext: No user found with credentials');
        console.log('AuthContext: Available usernames:', demoUsers.map(u => u.username));
        return { success: false, error: 'Invalid username or password' };
      }
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      return { success: false, error: 'Failed to load user data. Please try again.' };
    }
  };

  const logout = () => {
    console.log('AuthContext: Logging out user');
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('keiros_user');
  };

  // Debug logging for state changes
  useEffect(() => {
    console.log('AuthContext: State changed - currentUser:', currentUser);
    console.log('AuthContext: State changed - isAuthenticated:', isAuthenticated);
  }, [currentUser, isAuthenticated]);

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
