

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSupabaseClient } from '@/integrations/supabase/client';

interface AdminUser {
  id: string;
  username: string;
  full_name: string | null;
  email: string | null;
  role: string;
}

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing admin session in localStorage
    const storedAdmin = localStorage.getItem('tradebull_admin');
    if (storedAdmin) {
      try {
        const parsedAdmin = JSON.parse(storedAdmin);
        setAdminUser(parsedAdmin);
        console.log('Restored admin session from localStorage:', parsedAdmin.username);
      } catch (error) {
        console.error('Error parsing stored admin:', error);
        localStorage.removeItem('tradebull_admin');
      }
    }
    setLoading(false);
  }, []);

  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const signIn = async (username: string, password: string) => {
    try {
      setLoading(true);
      
      console.log('Admin login attempt for username:', username);
      
      const supabase = await getSupabaseClient();
      
      // Hash the password for comparison
      const passwordHash = await hashPassword(password);
      console.log('Generated password hash:', passwordHash);
      
      // Find admin user with matching username and password
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, username, full_name, email, role, password_hash')
        .eq('username', username)
        .single();

      if (error) {
        console.error('Database query error:', error);
        return { error: { message: 'Invalid username or password' } };
      }

      if (!data) {
        console.error('No admin user found with username:', username);
        return { error: { message: 'Invalid username or password' } };
      }

      console.log('Found admin user, checking password hash...');
      console.log('Stored hash:', data.password_hash);
      console.log('Generated hash:', passwordHash);

      // Check if password matches
      if (data.password_hash !== passwordHash) {
        console.error('Password hash mismatch');
        return { error: { message: 'Invalid username or password' } };
      }

      const adminData: AdminUser = {
        id: data.id,
        username: data.username,
        full_name: data.full_name,
        email: data.email,
        role: data.role
      };
      
      setAdminUser(adminData);
      localStorage.setItem('tradebull_admin', JSON.stringify(adminData));
      console.log('Admin login successful');

      return { error: null };
    } catch (error) {
      console.error('Admin login error:', error);
      return { error: { message: 'An unexpected error occurred' } };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    console.log('Admin signing out');
    setAdminUser(null);
    localStorage.removeItem('tradebull_admin');
  };

  const value = {
    adminUser,
    loading,
    signIn,
    signOut,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

