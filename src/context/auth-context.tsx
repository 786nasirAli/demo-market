'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, UserRole } from '@/lib/types';
import { INITIAL_PROFILES } from '@/lib/db/mock-data';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  login: (email: string, role?: UserRole) => Promise<boolean>;
  signup: (email: string, fullName: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'esols_marketplace_auth_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Restore session from localStorage or set default buyer
    const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (saved) {
      try {
        setUser(JSON.parse(saved));
        return;
      } catch (e) {
        console.error('Failed to parse stored auth user', e);
      }
    }
    // Default to buyer for seamless exploration
    setUser(INITIAL_PROFILES[0]);
  }, []);

  const login = async (email: string, role?: UserRole): Promise<boolean> => {
    const trimmed = email.toLowerCase().trim();
    let matchedProfile = INITIAL_PROFILES.find((p) => p.email.toLowerCase() === trimmed);

    if (!matchedProfile) {
      // Create guest profile if email not in mock profiles
      matchedProfile = {
        id: `usr-${Date.now()}`,
        email: trimmed,
        fullName: trimmed.split('@')[0],
        role: role || 'buyer',
        createdAt: new Date().toISOString(),
      };
    }

    if (role && matchedProfile.role !== role) {
      matchedProfile = { ...matchedProfile, role };
    }

    setUser(matchedProfile);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(matchedProfile));
    return true;
  };

  const signup = async (email: string, fullName: string, role: UserRole): Promise<boolean> => {
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      email: email.trim().toLowerCase(),
      fullName: fullName.trim(),
      role,
      createdAt: new Date().toISOString(),
    };

    setUser(newUser);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
  };

  const switchRole = (newRole: UserRole) => {
    const preset = INITIAL_PROFILES.find((p) => p.role === newRole);
    if (preset) {
      setUser(preset);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(preset));
    } else if (user) {
      const updated = { ...user, role: newRole };
      setUser(updated);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        login,
        signup,
        logout,
        switchRole,
      }}
    >
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
