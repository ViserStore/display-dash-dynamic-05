
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';

interface TradeResult {
  id: string;
  symbol: string;
  trade_type: 'BUY' | 'SELL';
  amount: number;
  price: number;
  trade_close_price: number;
  profit_loss: number;
  win_loss: 'win' | 'lose';
  status: string;
  trade_status: 'PENDING' | 'PROFIT' | 'LOSS';
  closing_time?: string;
}

export const useSpecificTradeResult = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const checkTradeStatus = async (tradeId: string): Promise<TradeResult | null> => {
    if (!user || !tradeId) return null;

    try {
      setLoading(true);
      console.log(`Checking status for specific trade: ${tradeId}`);
      
      const { data, error } = await supabase
        .from('trade_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('id', tradeId)
        .eq('status', 'complete')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found - trade not completed yet
          return null;
        }
        console.error('Error checking trade status:', error);
        return null;
      }

      console.log(`Trade ${tradeId} completed with result:`, data);
      
      // Type cast the database response to ensure proper typing
      return {
        id: data.id,
        symbol: data.symbol,
        trade_type: data.trade_type as 'BUY' | 'SELL',
        amount: data.amount,
        price: data.price,
        trade_close_price: data.trade_close_price || 0,
        profit_loss: data.profit_loss || 0,
        win_loss: data.win_loss as 'win' | 'lose',
        status: data.status,
        trade_status: data.trade_status as 'PENDING' | 'PROFIT' | 'LOSS',
        closing_time: data.closing_time
      };
    } catch (error) {
      console.error('Error checking trade status:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    checkTradeStatus,
    loading
  };
};
