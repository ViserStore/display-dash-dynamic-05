

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSupabaseClient } from '@/integrations/supabase/client';

interface User {
  id: string;
  username: string;
  full_name: string | null;
  pay_id: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (username: string, password: string, userData: { fullName: string; withdrawPin: string }, referralCode?: string) => Promise<{ error: any }>;
  signIn: (username: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const storedUser = localStorage.getItem('tradebull_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('tradebull_user');
      }
    }
    setLoading(false);
  }, []);

  const hashPassword = async (password: string): Promise<string> => {
    // Simple password hashing - in production, use bcrypt or similar
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const signUp = async (username: string, password: string, userData: { fullName: string; withdrawPin: string }, referralCode?: string) => {
    try {
      setLoading(true);
      
      const supabase = await getSupabaseClient();
      
      // Check if username already exists
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('username')
        .eq('username', username);

      if (checkError) {
        console.error('Database check error:', checkError);
        return { error: checkError };
      }

      if (existingUsers && existingUsers.length > 0) {
        return { error: { message: 'Username already exists. Please choose a different username.' } };
      }

      // Hash the password
      const passwordHash = await hashPassword(password);
      
      // Hash the withdraw PIN
      const withdrawPinHash = await hashPassword(userData.withdrawPin);
      
      // Generate pay_id
      const payId = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
      
      // Find referrer if referral code is provided
      let referrerId = null;
      if (referralCode) {
        const { data: referrerData, error: referrerError } = await supabase
          .from('users')
          .select('id')
          .eq('referral_code', referralCode)
          .single();

        if (referrerError) {
          console.log('Referral code not found:', referralCode);
          // Don't block signup if referral code is invalid, just log it
        } else {
          referrerId = referrerData.id;
          console.log('Found referrer:', referrerId);
        }
      }

      // Create user in database
      const { data, error } = await supabase
        .from('users')
        .insert({
          username: username,
          password_hash: passwordHash,
          full_name: userData.fullName,
          pay_id: payId,
          withdraw_pin: withdrawPinHash,
          referred_by: referrerId
        })
        .select()
        .single();

      if (error) {
        console.error('User creation error:', error);
        return { error };
      }

      console.log('User created successfully:', data);
      return { error: null };
    } catch (error) {
      console.error('Signup error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (username: string, password: string) => {
    try {
      setLoading(true);
      
      const supabase = await getSupabaseClient();
      
      // Hash the password for comparison
      const passwordHash = await hashPassword(password);
      
      // Find user with matching username and password
      const { data, error } = await supabase
        .from('users')
        .select('id, username, full_name, pay_id')
        .eq('username', username)
        .eq('password_hash', passwordHash)
        .single();

      if (error) {
        console.error('Login error:', error);
        return { error: { message: 'Invalid username or password' } };
      }

      if (data) {
        const userData: User = {
          id: data.id,
          username: data.username,
          full_name: data.full_name,
          pay_id: data.pay_id
        };
        
        setUser(userData);
        localStorage.setItem('tradebull_user', JSON.stringify(userData));
      }

      return { error: null };
    } catch (error) {
      console.error('Login error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('tradebull_user');
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

