
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';

export const useUserBalance = () => {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchBalance = async () => {
    if (!user) {
      setBalance(0);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('balance')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching balance:', error);
        setError('Failed to fetch balance');
        return;
      }

      setBalance(parseFloat(data.balance?.toString() || '0'));
      setError(null);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setError('Failed to fetch balance');
    } finally {
      setLoading(false);
    }
  };

  const updateBalance = (newBalance: number) => {
    setBalance(newBalance);
  };

  useEffect(() => {
    fetchBalance();
  }, [user]);

  return {
    balance,
    loading,
    error,
    refreshBalance: fetchBalance,
    updateBalance
  };
};
