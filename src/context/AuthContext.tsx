import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { DEMO_USERS } from '../services/mockData';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  quickLogin: (role: UserRole) => void;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default logged in as District Officer or Admin for rich immediate dashboard view
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('gramtrack_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEMO_USERS[1]; // District Officer
      }
    }
    return DEMO_USERS[1]; // Default to District Officer
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('gramtrack_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('gramtrack_user');
    }
  }, [currentUser]);

  const login = async (email: string): Promise<boolean> => {
    const matched = DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      setCurrentUser(matched);
      return true;
    }
    // Fallback: match by role keyword
    if (email.toLowerCase().includes('admin')) {
      setCurrentUser(DEMO_USERS[0]);
      return true;
    }
    if (email.toLowerCase().includes('district') || email.toLowerCase().includes('officer')) {
      setCurrentUser(DEMO_USERS[1]);
      return true;
    }
    if (email.toLowerCase().includes('inspector') || email.toLowerCase().includes('field')) {
      setCurrentUser(DEMO_USERS[2]);
      return true;
    }
    return false;
  };

  const quickLogin = (role: UserRole) => {
    const user = DEMO_USERS.find((u) => u.role === role) || DEMO_USERS[0];
    setCurrentUser(user);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const hasRole = (roles: UserRole[]) => {
    if (!currentUser) return false;
    return roles.includes(currentUser.role);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        quickLogin,
        logout,
        hasRole,
      }}
    >
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
