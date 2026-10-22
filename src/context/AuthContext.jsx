import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_USERS } from '../firebase/seedData';

const AuthContext = createContext(null);

// Admin fallback user specified in PDF (Vikramaditya Rathore)
export const DEFAULT_ADMIN_USER = INITIAL_USERS[0];

export const AVAILABLE_USERS = INITIAL_USERS;

export function AuthProvider({ children }) {
  // Check stored user or default to Admin user as specified in Section 12
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('urstay_pms_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_ADMIN_USER;
      }
    }
    return DEFAULT_ADMIN_USER;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('urstay_pms_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('urstay_pms_user');
    }
  }, [currentUser]);

  const loginWithCredentials = (email, password) => {
    setLoading(true);
    // Find matching user from seed users or create session
    const matched = AVAILABLE_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      setCurrentUser(matched);
      setLoading(false);
      return { success: true, user: matched };
    }
    
    // Generic fallback login for any staff
    const genericUser = {
      uid: `usr_${Date.now()}`,
      name: email.split('@')[0].replace('.', ' '),
      email: email,
      role: 'Receptionist',
      designation: 'Front Desk Executive',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    };
    setCurrentUser(genericUser);
    setLoading(false);
    return { success: true, user: genericUser };
  };

  const loginAsDemoUser = (roleName = 'Admin') => {
    const found = AVAILABLE_USERS.find(u => u.role.toLowerCase() === roleName.toLowerCase()) || DEFAULT_ADMIN_USER;
    setCurrentUser(found);
    return found;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // Role permissions check
  const hasRole = (...roles) => {
    if (!currentUser) return false;
    if (currentUser.role === 'Admin') return true; // Superuser bypass
    return roles.includes(currentUser.role);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      loading,
      loginWithCredentials,
      loginAsDemoUser,
      logout,
      hasRole,
      switchRole: (role) => loginAsDemoUser(role)
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
