"use client"

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase-client';
import { User } from '../types';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name: string, role: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    checkUser();
  }, []);

  async function checkUser() {
    try {
      // Check localStorage for existing session
      const storedUser = localStorage.getItem('Smartseed_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setUser(user);
      }
    } catch (error) {
      console.error('Error checking user session:', error);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    try {
      // Use local PostgreSQL authentication
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success && data.user) {
        // Convert PostgreSQL user format to match existing User type
        const user: User = {
          id: data.user.user_id.toString(),
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
          created_at: data.user.created_at || new Date().toISOString()
        };
        
        setUser(user);
        localStorage.setItem('Smartseed_user', JSON.stringify(user));
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Invalid credentials' };
      }
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  async function signUp(email: string, password: string, name: string, role: string) {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-2054dc09/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ email, password, name, role })
      });

      const data = await response.json();

      if (response.ok && data.user) {
        setUser(data.user);
        localStorage.setItem('Smartseed_user', JSON.stringify(data.user));
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Sign up failed' };
      }
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  async function signOut() {
    setUser(null);
    localStorage.removeItem('Smartseed_user');
  }

  return { user, loading, signIn, signUp, signOut };
}
