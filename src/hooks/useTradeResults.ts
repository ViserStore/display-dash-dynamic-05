
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';

interface TradeResult {
  id: string;
  symbol: string;
  trade_type: 'BUY' | 'SELL';
  amount: number;
  openPrice: number;
  closePrice: number;
  result: 'WIN' | 'LOSE';
  profit: number;
  profitLoss: number;
  win_loss: 'win' | 'lose';
  trade_status: 'PROFIT' | 'LOSS';
}

export const useTradeResults = () => {
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [currentTradeResult, setCurrentTradeResult] = useState<TradeResult | null>(null);
  const { user } = useAuth();
  const realtimeChannel = useRef<any>(null);
  const processedResults = useRef<Set<string>>(new Set());

  // Set up real-time listening for completed trades
  useEffect(() => {
    if (!user) return;

    console.log('Setting up real-time listener for completed trades...');
    
    // Clean up any existing channel
    if (realtimeChannel.current) {
      supabase.removeChannel(realtimeChannel.current);
      realtimeChannel.current = null;
    }

    // Create new real-time channel for completed trades
    realtimeChannel.current = supabase
      .channel('trade-results')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'trade_transactions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const updatedTrade = payload.new;
          
          // Only show result popup for trades that just completed
          if (updatedTrade.status === 'complete' && !processedResults.current.has(updatedTrade.id)) {
            console.log('Trade completed, showing result popup:', updatedTrade);
            
            // Mark as processed to prevent duplicates
            processedResults.current.add(updatedTrade.id);
            
            // Create trade result object
            const tradeResult: TradeResult = {
              id: updatedTrade.id,
              symbol: updatedTrade.symbol,
              trade_type: updatedTrade.trade_type,
              amount: updatedTrade.amount,
              openPrice: updatedTrade.buy_price || updatedTrade.price,
              closePrice: updatedTrade.trade_close_price || updatedTrade.close_price,
              result: updatedTrade.win_loss === 'win' ? 'WIN' : 'LOSE',
              profit: updatedTrade.profit_loss,
              profitLoss: updatedTrade.profit_loss,
              win_loss: updatedTrade.win_loss,
              trade_status: updatedTrade.trade_status
            };
            
            setCurrentTradeResult(tradeResult);
            setShowResultPopup(true);
          }
        }
      )
      .subscribe((status) => {
        console.log('Real-time trade results subscription status:', status);
      });

    return () => {
      if (realtimeChannel.current) {
        console.log('Cleaning up real-time trade results subscription');
        supabase.removeChannel(realtimeChannel.current);
      }
    };
  }, [user]);

  const closeResultPopup = () => {
    setShowResultPopup(false);
    setCurrentTradeResult(null);
  };

  // Clean up processed results periodically to prevent memory leaks
  useEffect(() => {
    const cleanup = setInterval(() => {
      if (processedResults.current.size > 100) {
        processedResults.current.clear();
      }
    }, 300000); // 5 minutes

    return () => clearInterval(cleanup);
  }, []);

  return {
    showResultPopup,
    currentTradeResult,
    closeResultPopup
  };
};
