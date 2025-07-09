

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getSupabaseClient } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserData {
  balance: number;
  pay_id?: string;
  full_name?: string;
  username?: string;
  total_referrals?: number;
  referral_earnings?: number;
}

interface Coin {
  id: number;
  symbol: string;
  image_url: string | null;
  status: string | null;
}

interface SiteSettings {
  site_title?: string;
  site_currency?: string;
  currency_symbol?: string;
}

interface UserDataContextType {
  userData: UserData;
  coins: Coin[];
  siteSettings: SiteSettings;
  isLoading: boolean;
  refreshUserData: () => Promise<void>;
  updateBalance: (newBalance: number) => void;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
};

export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData>({
    balance: 0.00,
    username: 'User'
  });
  const [coins, setCoins] = useState<Coin[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    currency_symbol: '$',
    site_currency: 'USDT'
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = useCallback(async () => {
    if (!user) {
      setUserData({ balance: 0.00, username: 'User' });
      setIsLoading(false);
      return;
    }

    try {
      const supabase = await getSupabaseClient();
      
      // Fetch user data
      const { data: userDataResult, error: userError } = await supabase
        .from('users')
        .select('pay_id, full_name, username, balance, total_referrals, referral_earnings')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
      } else if (userDataResult) {
        setUserData({
          balance: userDataResult.balance || 0.00,
          pay_id: userDataResult.pay_id,
          full_name: userDataResult.full_name,
          username: userDataResult.username,
          total_referrals: userDataResult.total_referrals || 0,
          referral_earnings: userDataResult.referral_earnings || 0.00
        });
      }

      // Fetch coins data only if not already loaded
      if (coins.length === 0) {
        const { data: coinsData, error: coinsError } = await supabase
          .from('coins')
          .select('*')
          .eq('status', 'active')
          .order('id', { ascending: true });

        if (coinsError) {
          console.error('Error fetching coins data:', coinsError);
        } else {
          setCoins(coinsData || []);
        }
      }

      // Fetch site settings only if not already loaded
      if (!siteSettings.site_title) {
        const { data: settingsData, error: settingsError } = await supabase
          .from('site_settings')
          .select('site_title, site_currency, currency_symbol')
          .single();

        if (settingsError) {
          console.error('Error fetching site settings:', settingsError);
        } else if (settingsData) {
          setSiteSettings(settingsData);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, coins.length, siteSettings.site_title]);

  const refreshUserData = useCallback(async () => {
    await fetchUserData();
  }, [fetchUserData]);

  const updateBalance = useCallback((newBalance: number) => {
    setUserData(prev => ({ ...prev, balance: newBalance }));
  }, []);

  // Initial load
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Background refresh every 10 seconds for balance updates
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      try {
        const supabase = await getSupabaseClient();
        const { data: userDataResult, error } = await supabase
          .from('users')
          .select('balance')
          .eq('id', user.id)
          .single();

        if (!error && userDataResult) {
          const newBalance = userDataResult.balance || 0.00;
          if (newBalance !== userData.balance) {
            setUserData(prev => ({ ...prev, balance: newBalance }));
          }
        }
      } catch (error) {
        console.error('Background balance update error:', error);
      }
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [user, userData.balance]);

  const value = {
    userData,
    coins,
    siteSettings,
    isLoading,
    refreshUserData,
    updateBalance
  };

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
};

