
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';

interface TradeTransaction {
  id: string;
  symbol: string;
  trade_type: 'BUY' | 'SELL';
  action: 'OPEN' | 'CLOSE';
  amount: number;
  price: number;
  buy_price?: number;
  close_price?: number;
  trade_close_price?: number;
  profit_loss: number;
  status: 'pending' | 'running' | 'complete';
  trade_status: 'PENDING' | 'PROFIT' | 'LOSS';
  win_loss: 'pending' | 'win' | 'lose';
  return_time?: string;
  closing_time?: string;
  created_at: string;
  updated_at: string;
}

export const useTradeTransactions = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const createTradeTransaction = async (transactionData: {
    symbol: string;
    trade_type: 'BUY' | 'SELL';
    action: 'OPEN' | 'CLOSE';
    amount: number;
    price: number;
    buy_price?: number;
    close_price?: number;
    trade_close_price?: number;
    profit_loss?: number;
    status?: 'pending' | 'running' | 'complete';
    trade_status?: 'PENDING' | 'PROFIT' | 'LOSS';
    win_loss?: 'pending' | 'win' | 'lose';
    return_time?: string;
    closing_time?: string;
  }) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      
      const transactionPayload = {
        user_id: user.id,
        symbol: transactionData.symbol,
        trade_type: transactionData.trade_type,
        action: transactionData.action,
        amount: transactionData.amount,
        price: transactionData.price,
        buy_price: transactionData.buy_price || transactionData.price,
        close_price: transactionData.close_price || null,
        trade_close_price: transactionData.trade_close_price || 0,
        profit_loss: transactionData.profit_loss || 0,
        status: transactionData.status || (transactionData.action === 'OPEN' ? 'running' : 'pending'),
        trade_status: transactionData.trade_status || (transactionData.action === 'OPEN' ? 'PENDING' : 'PENDING'),
        win_loss: transactionData.win_loss || 'pending',
        return_time: transactionData.return_time || null,
        closing_time: transactionData.closing_time || null
      };

      console.log('Creating trade transaction:', transactionPayload);

      const { data, error } = await supabase
        .from('trade_transactions')
        .insert(transactionPayload)
        .select()
        .single();

      if (error) {
        console.error('Error creating trade transaction:', error);
        throw error;
      }

      console.log('Trade transaction created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error creating trade transaction:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getTradeTransactions = async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('trade_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching trade transactions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching trade transactions:', error);
      return [];
    }
  };

  const getRunningTrades = async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('trade_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'running')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching running trades:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching running trades:', error);
      return [];
    }
  };

  const getCompletedTrades = async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('trade_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'complete')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching completed trades:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching completed trades:', error);
      return [];
    }
  };

  return {
    createTradeTransaction,
    getTradeTransactions,
    getRunningTrades,
    getCompletedTrades,
    loading
  };
};
