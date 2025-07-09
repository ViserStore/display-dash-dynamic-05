
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getSupabaseClient } from '../integrations/supabase/client';

// Hook to handle automatic trade closing when user is away
export const useTradeAutoClose = () => {
  const { user } = useAuth();

  const fetchFreshPrice = async (symbol: string): Promise<number> => {
    try {
      const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`);
      if (!response.ok) {
        throw new Error('Failed to fetch price');
      }
      const data = await response.json();
      return parseFloat(data.price);
    } catch (error) {
      console.error('Error fetching fresh price:', error);
      throw error;
    }
  };

  const getCoinSettings = async (symbol: string) => {
    try {
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase
        .from('coins')
        .select('*')
        .eq('symbol', symbol)
        .eq('status', 'active')
        .single();

      if (error) {
        console.error(`Error fetching coin settings for ${symbol}:`, error);
        return null;
      }

      return data;
    } catch (error) {
      console.error(`Error getting coin settings for ${symbol}:`, error);
      return null;
    }
  };

  const updateUserBalance = async (userId: string, amount: number) => {
    try {
      const supabase = await getSupabaseClient();
      const { error } = await supabase.rpc('add_user_balance', {
        user_id: userId,
        amount: amount
      });

      if (error) {
        console.error('Error updating balance:', error);
      } else {
        console.log('Balance updated:', amount);
      }
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  };

  const processExpiredTrades = async () => {
    if (!user) return;

    try {
      const supabase = await getSupabaseClient();
      
      // Get all running trades that have expired with a 10-second buffer to prevent premature closure
      const bufferTime = new Date();
      bufferTime.setSeconds(bufferTime.getSeconds() - 10); // 10 second buffer

      const { data: expiredTrades, error } = await supabase
        .from('trade_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'running')
        .lt('return_time', bufferTime.toISOString());

      if (error) {
        console.error('Error fetching expired trades:', error);
        return;
      }

      if (!expiredTrades || expiredTrades.length === 0) {
        return;
      }

      console.log(`Found ${expiredTrades.length} expired trades to process (with 10s buffer)`);

      // Process each expired trade individually
      for (const trade of expiredTrades) {
        try {
          // Double-check expiration with current time
          const now = new Date();
          const returnTime = new Date(trade.return_time);
          
          if (now.getTime() < returnTime.getTime()) {
            console.log(`Trade ${trade.id} not yet expired, skipping`);
            continue;
          }

          // Get coin settings from database - REQUIRED
          const coinSettings = await getCoinSettings(trade.symbol);
          if (!coinSettings) {
            console.error(`No coin settings found for ${trade.symbol}, skipping trade ${trade.id}`);
            continue;
          }

          // Ensure we have valid profit/loss percentage from database
          if (coinSettings.profit_loss === null || coinSettings.profit_loss === undefined) {
            console.error(`No profit_loss percentage set for ${trade.symbol}, skipping trade ${trade.id}`);
            continue;
          }

          console.log(`Coin settings for ${trade.symbol}:`, {
            profit_loss: coinSettings.profit_loss
          });

          const freshClosePrice = await fetchFreshPrice(trade.symbol);
          const closeTime = new Date();
          
          // Use real market data to determine win/loss
          const openPrice = trade.buy_price || trade.price;
          const closePrice = freshClosePrice;
          
          let isWin = false;
          let result: 'WIN' | 'LOSE';
          
          // Determine win/loss based on trade type and actual price movement
          if (trade.trade_type === 'BUY') {
            // BUY trade wins if price goes up
            isWin = closePrice > openPrice;
          } else {
            // SELL trade wins if price goes down
            isWin = closePrice < openPrice;
          }
          
          result = isWin ? 'WIN' : 'LOSE';
          let profit = 0;
          let winLoss: 'win' | 'lose' = isWin ? 'win' : 'lose';
          let tradeStatus: 'PROFIT' | 'LOSS' = isWin ? 'PROFIT' : 'LOSS';

          const profitPercentage = coinSettings.profit_loss; // Use exact value from database

          console.log(`Trade ${trade.id} real market analysis:`, {
            symbol: trade.symbol,
            trade_type: trade.trade_type,
            openPrice: openPrice,
            closePrice: closePrice,
            priceChange: closePrice - openPrice,
            priceChangePercent: ((closePrice - openPrice) / openPrice * 100).toFixed(2) + '%',
            isWin: isWin,
            profitPercentage: profitPercentage
          });

          // Calculate profit/loss based on percentage from database
          if (isWin) {
            // Win: User gets back original amount + profit percentage
            profit = trade.amount * (profitPercentage / 100);
          } else {
            // Loss: User loses the profit percentage amount
            profit = -(trade.amount * (profitPercentage / 100));
          }

          console.log(`Processing trade ${trade.id}: ${result}, Open: ${openPrice}, Close: ${closePrice}, Profit/Loss: ${profit}`);

          // Update trade in database
          const { error: updateError } = await supabase
            .from('trade_transactions')
            .update({
              status: 'complete',
              trade_close_price: freshClosePrice,
              close_price: freshClosePrice,
              win_loss: winLoss,
              trade_status: tradeStatus,
              profit_loss: profit,
              closing_time: closeTime.toISOString()
            })
            .eq('id', trade.id)
            .eq('status', 'running'); // Only update if still running to prevent race conditions

          if (updateError) {
            console.error('Failed to update trade:', updateError);
          } else {
            // Update user balance based on result
            if (result === 'WIN') {
              // Add original amount + profit
              await updateUserBalance(user.id, trade.amount + profit);
              console.log(`User won! Added ${trade.amount + profit} to balance`);
            } else {
              // Return original amount minus loss percentage
              const returnAmount = trade.amount + profit; // profit is negative for losses
              await updateUserBalance(user.id, returnAmount);
              console.log(`User lost ${Math.abs(profit)} (${profitPercentage}%) but got ${returnAmount} back`);
            }
            console.log(`Trade ${trade.id} successfully closed with result: ${result}`);
          }
        } catch (error) {
          console.error(`Failed to process trade ${trade.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in processExpiredTrades:', error);
    }
  };

  useEffect(() => {
    if (!user) return;

    // Process expired trades immediately when hook initializes
    processExpiredTrades();

    // Set up interval to check for expired trades every 2 minutes (less frequent to prevent conflicts)
    const interval = setInterval(processExpiredTrades, 120000); // 2 minutes

    // Handle page visibility change to process trades when user returns
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // User returned to page, check for expired trades after a short delay
        setTimeout(processExpiredTrades, 1000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  return { processExpiredTrades };
};
